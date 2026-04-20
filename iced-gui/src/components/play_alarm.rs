use crate::components::toggle::animated_toggle;
use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style_colored, hex_to_color, COLORS};
use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path, Stroke};
use iced::widget::svg::Handle as SvgHandle;
use iced::widget::{column, container, mouse_area, text};
use iced::{Color, Element, Length, Point, Radians, Rectangle, Vector};
use std::f32::consts::PI;

// ── Constants ─────────────────────────────────────────────────────────────────

const SNOOZE_SIZE: f32 = 200.0;
const LOGO_SVG_SIZE: f32 = 116.0; // SVG size inside the circle canvas

// ── Alarm-logo canvas animation (1 s loop) ───────────────────────────────────

fn alarm_logo_transform(t: f32) -> (f32, f32) {
    fn ease(p: f32) -> f32 {
        p * p * (3.0 - 2.0 * p)
    }
    fn lerp(a: f32, b: f32, p: f32) -> f32 {
        a + (b - a) * ease(p)
    }
    if t < 0.25 {
        (lerp(0.0, -25.0f32.to_radians(), t / 0.25), 1.0)
    } else if t < 0.5 {
        let p = (t - 0.25) / 0.25;
        (lerp(-25.0f32.to_radians(), 0.0, p), lerp(1.0, 0.85, p))
    } else if t < 0.75 {
        let p = (t - 0.5) / 0.25;
        (lerp(0.0, 25.0f32.to_radians(), p), lerp(0.85, 1.0, p))
    } else {
        let p = (t - 0.75) / 0.25;
        (lerp(25.0f32.to_radians(), 0.0, p), 1.0)
    }
}

// ── Canvas program ────────────────────────────────────────────────────────────
// Draws the blue circle background + centered, animated SVG logo in one pass.

struct AlarmLogoCanvas {
    svg_size: f32,
    angle: f32,
    scale: f32,
    hold_progress: f32, // 0.0..=1.0 while user holds; drives arc + press shrink
}

impl<Message> canvas::Program<Message> for AlarmLogoCanvas {
    type State = ();

    fn draw(
        &self,
        _state: &(),
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());
        let cx = bounds.width / 2.0;
        let cy = bounds.height / 2.0;
        let radius = bounds.width.min(bounds.height) / 2.0;

        // Press shrinks the whole circle slightly for tactile feedback
        let press_scale = 1.0 - 0.05 * self.hold_progress;
        let draw_radius = radius * press_scale;

        // ── Blue circle background ────────────────────────────────────────────
        let circle = Path::circle(Point::new(cx, cy), draw_radius);
        frame.fill(&circle, Color::from_rgb(0.18, 0.52, 0.96));

        // ── Animated SVG, centered and rotated around the circle centre ───────
        let svg_display = self.svg_size * press_scale;
        let offset = (bounds.width - svg_display) / 2.0;

        frame.with_save(|f| {
            f.translate(Vector::new(cx, cy));
            f.rotate(Radians(self.angle));
            f.scale(self.scale * press_scale);
            f.translate(Vector::new(-cx, -cy));

            let handle = SvgHandle::from_memory(include_bytes!("../assets/logo.svg"));
            f.draw_svg(
                Rectangle {
                    x: offset,
                    y: offset,
                    width: svg_display,
                    height: svg_display,
                },
                &handle,
            );
        });

        // ── Hold-progress arc (white ring, clockwise from top) ────────────────
        if self.hold_progress > 0.0 {
            let arc_radius = draw_radius - 5.0;
            let start_angle = -PI / 2.0;
            let sweep = self.hold_progress * 2.0 * PI;

            let arc = Path::new(|b| {
                b.arc(canvas::path::Arc {
                    center: Point::new(cx, cy),
                    radius: arc_radius,
                    start_angle: Radians(start_angle),
                    end_angle: Radians(start_angle + sweep),
                });
            });
            frame.stroke(
                &arc,
                Stroke::default()
                    .with_color(Color::from_rgba(1.0, 1.0, 1.0, 0.9))
                    .with_width(4.0),
            );
        }

        vec![frame.into_geometry()]
    }
}

// ── Public view ───────────────────────────────────────────────────────────────

pub fn play_alarm_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let alarm = state.playing_alarm.as_ref();

    let label = alarm
        .map(|a| a.label.clone())
        .unwrap_or_else(|| "Alarm".to_string());

    let time_str = alarm
        .map(|a| {
            let hour = a.time.first().copied().unwrap_or(8);
            let minute = a.time.get(1).copied().unwrap_or(0);
            if state.settings.clock24 {
                format!("{:02}:{:02}", hour, minute)
            } else {
                let is_pm = hour >= 12;
                let display_hour = if hour == 0 {
                    12
                } else if hour > 12 {
                    hour - 12
                } else {
                    hour
                };
                format!(
                    "{:02}:{:02} {}",
                    display_hour,
                    minute,
                    if is_pm { "PM" } else { "AM" }
                )
            }
        })
        .unwrap_or_else(|| "08:00".to_string());

    // ── Pulsing "ALARM" text (6 s cycle) ─────────────────────────────────────
    let elapsed = state
        .alarm_anim_start
        .map(|s| s.elapsed().as_secs_f32())
        .unwrap_or(0.0);
    let text_t = (elapsed % 6.0) / 6.0;
    let text_scale = if text_t < 0.5 {
        1.0 - 0.08 * (text_t / 0.5)
    } else {
        0.92 + 0.08 * ((text_t - 0.5) / 0.5)
    };
    let label_size = (36.0 * text_scale).round();

    // ── Animated snooze circle (canvas fills the full 200 × 200 area) ────────
    let logo_t = elapsed % 1.0;
    let (angle, scale) = alarm_logo_transform(logo_t);

    let hold_progress = state
        .snooze_press_start
        .map(|start| {
            let elapsed_ms = start.elapsed().as_millis() as f32;
            let required_ms = state.settings.snooze_press_ms as f32;
            (elapsed_ms / required_ms).min(1.0)
        })
        .unwrap_or(0.0);

    // The canvas draws both the blue circle background and the rotating logo.
    // mouse_area wraps it directly — no button in the way to swallow events.
    let snooze_canvas: Element<Message> = Canvas::new(AlarmLogoCanvas {
        svg_size: LOGO_SVG_SIZE,
        angle,
        scale,
        hold_progress,
    })
    .width(Length::Fixed(SNOOZE_SIZE))
    .height(Length::Fixed(SNOOZE_SIZE))
    .into();

    let snooze_area: Element<Message> = container(
        mouse_area(snooze_canvas)
            .on_press(Message::SnoozePressStart)
            .on_release(Message::SnoozePressEnd),
    )
    .center_x(Length::Fill)
    .into();

    // ── Header ────────────────────────────────────────────────────────────────
    let header = column![
        text(label).size(24).color(COLORS.text),
        text(format!("({})", time_str))
            .size(18)
            .color(COLORS.text_secondary),
    ]
    .spacing(4)
    .align_x(iced::Alignment::Center);

    // ── Turn-off toggle (IS the dismiss action when flipped on) ──────────────
    let bottom_row: Element<Message> = column![
        text("Turn alarm OFF").size(14).color(COLORS.text),
        animated_toggle(
            &state.toggle_anims,
            "play_turn_off",
            state.turn_off,
            Message::SetTurnOff(!state.turn_off)
        ),
    ]
    .spacing(8)
    .align_x(iced::Alignment::Center)
    .into();

    // ── Assemble ──────────────────────────────────────────────────────────────
    let content = column![
        header,
        text("ALARM").size(label_size).color(COLORS.danger),
        text("Hold the clock below to snooze")
            .size(14)
            .color(COLORS.text_secondary),
        snooze_area,
        bottom_row,
    ]
    .spacing(20)
    .padding(40)
    .align_x(iced::Alignment::Center);

    let bg = hex_to_color(&state.settings.card_colors.background);
    iced::widget::container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(card_container_style_colored(bg))
        .into()
}

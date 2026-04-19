use crate::messages::Message;
use crate::state::AppState;
use crate::components::toggle::animated_toggle;
use crate::theme::{card_container_style_colored, hex_to_color, COLORS};
use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path};
use iced::widget::svg::Handle as SvgHandle;
use iced::widget::{column, mouse_area, row, text};
use iced::{
    Background, Border, Color, Element, Length, Point, Radians, Rectangle, Shadow, Size, Vector,
};

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

        // ── Blue circle background ────────────────────────────────────────────
        let circle = Path::circle(Point::new(cx, cy), radius);
        frame.fill(&circle, Color::from_rgb(0.18, 0.52, 0.96));

        // ── Animated SVG, centered and rotated around the circle centre ───────
        let offset = (bounds.width - self.svg_size) / 2.0;

        frame.with_save(|f| {
            // Rotate/scale around the canvas centre
            f.translate(Vector::new(cx, cy));
            f.rotate(Radians(self.angle));
            f.scale(self.scale);
            f.translate(Vector::new(-cx, -cy));

            let handle = SvgHandle::from_memory(include_bytes!("../assets/logo.svg"));
            f.draw_svg(
                Rectangle {
                    x: offset,
                    y: offset,
                    width: self.svg_size,
                    height: self.svg_size,
                },
                &handle,
            );
        });

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
    let elapsed = state.alarm_anim_start
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

    // The canvas draws both the blue circle background and the rotating logo.
    // mouse_area wraps it directly — no button in the way to swallow events.
    let snooze_canvas: Element<Message> = Canvas::new(AlarmLogoCanvas {
        svg_size: LOGO_SVG_SIZE,
        angle,
        scale,
    })
    .width(Length::Fixed(SNOOZE_SIZE))
    .height(Length::Fixed(SNOOZE_SIZE))
    .into();

    let snooze_area: Element<Message> = mouse_area(snooze_canvas)
        .on_press(Message::SnoozePressStart)
        .on_release(Message::SnoozePressEnd)
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
        animated_toggle(&state.toggle_anims, "play_turn_off", state.turn_off, Message::SetTurnOff(!state.turn_off)),
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

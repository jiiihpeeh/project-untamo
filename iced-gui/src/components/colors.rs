use crate::messages::Message;
use crate::state::{ColorMode, SettingsState};
use crate::theme::{card_container_style_colored, secondary_button, COLORS};
use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path};
use iced::widget::{button, column, container, row, text, Space};
use iced::{Background, Border, Color, Element, Length, Point, Rectangle, Shadow, Size};
use iced_widget::rule;
use iced_widget::Action;

const PICKER_SIZE: f32 = 200.0;
const HUE_H: f32 = 18.0;
const BTN_W: f32 = 160.0;
const ROW_SPACING: f32 = 28.0;
const CARD_PAD: f32 = 24.0;
const DIALOG_W: f32 = PICKER_SIZE + ROW_SPACING + BTN_W + CARD_PAD * 2.0; // 436px

// ── SV (saturation / value) square ───────────────────────────────────────────

struct SVSquare {
    hue: f32,
    sat: f32,
    val: f32,
}

#[derive(Default)]
struct DragState {
    dragging: bool,
}

impl canvas::Program<Message> for SVSquare {
    type State = DragState;

    fn update(
        &self,
        state: &mut DragState,
        event: &canvas::Event,
        bounds: Rectangle,
        cursor: iced::mouse::Cursor,
    ) -> Option<Action<Message>> {
        use canvas::Event::Mouse;
        use iced::mouse::Event as ME;
        match event {
            Mouse(ME::ButtonPressed(iced::mouse::Button::Left)) => {
                if cursor.is_over(bounds) {
                    state.dragging = true;
                    if let Some(pos) = cursor.position_in(bounds) {
                        let s = (pos.x / bounds.width).clamp(0.0, 1.0);
                        let v = 1.0 - (pos.y / bounds.height).clamp(0.0, 1.0);
                        return Some(Action::publish(Message::SetColorSV(s, v)).and_capture());
                    }
                }
                None
            }
            Mouse(ME::CursorMoved { .. }) if state.dragging => {
                let pos = cursor.position().unwrap_or(Point::ORIGIN);
                let rel_x = (pos.x - bounds.x).clamp(0.0, bounds.width);
                let rel_y = (pos.y - bounds.y).clamp(0.0, bounds.height);
                let s = rel_x / bounds.width;
                let v = 1.0 - rel_y / bounds.height;
                Some(Action::publish(Message::SetColorSV(s, v)).and_capture())
            }
            Mouse(ME::ButtonReleased(iced::mouse::Button::Left)) => {
                state.dragging = false;
                None
            }
            _ => None,
        }
    }

    fn draw(
        &self,
        _state: &DragState,
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());

        // 1. Solid hue background (hue at full S=1, V=1)
        frame.fill(
            &Path::rectangle(Point::ORIGIN, bounds.size()),
            hsv_to_color(self.hue, 1.0, 1.0),
        );

        // 2. White → transparent overlay (left→right): controls saturation
        let white_grad = canvas::gradient::Linear::new(Point::ORIGIN, Point::new(bounds.width, 0.0))
            .add_stop(0.0, Color::WHITE)
            .add_stop(1.0, Color { r: 1.0, g: 1.0, b: 1.0, a: 0.0 });
        frame.fill(
            &Path::rectangle(Point::ORIGIN, bounds.size()),
            white_grad,
        );

        // 3. Transparent → black overlay (top→bottom): controls value
        let black_grad = canvas::gradient::Linear::new(Point::ORIGIN, Point::new(0.0, bounds.height))
            .add_stop(0.0, Color { r: 0.0, g: 0.0, b: 0.0, a: 0.0 })
            .add_stop(1.0, Color::BLACK);
        frame.fill(
            &Path::rectangle(Point::ORIGIN, bounds.size()),
            black_grad,
        );

        // 4. Cursor circle
        let cx = self.sat * bounds.width;
        let cy = (1.0 - self.val) * bounds.height;
        frame.fill(&Path::circle(Point::new(cx, cy), 7.0), Color::WHITE);
        frame.fill(&Path::circle(Point::new(cx, cy), 5.5), Color::BLACK);
        frame.fill(
            &Path::circle(Point::new(cx, cy), 4.5),
            hsv_to_color(self.hue, self.sat, self.val),
        );

        vec![frame.into_geometry()]
    }
}

// ── Hue bar ───────────────────────────────────────────────────────────────────

struct HueBar {
    hue: f32,
}

impl canvas::Program<Message> for HueBar {
    type State = DragState;

    fn update(
        &self,
        state: &mut DragState,
        event: &canvas::Event,
        bounds: Rectangle,
        cursor: iced::mouse::Cursor,
    ) -> Option<Action<Message>> {
        use canvas::Event::Mouse;
        use iced::mouse::Event as ME;
        match event {
            Mouse(ME::ButtonPressed(iced::mouse::Button::Left)) => {
                if cursor.is_over(bounds) {
                    state.dragging = true;
                    if let Some(pos) = cursor.position_in(bounds) {
                        let h = (pos.x / bounds.width * 360.0).clamp(0.0, 360.0);
                        return Some(Action::publish(Message::SetColorHue(h)).and_capture());
                    }
                }
                None
            }
            Mouse(ME::CursorMoved { .. }) if state.dragging => {
                let pos = cursor.position().unwrap_or(Point::ORIGIN);
                let rel_x = (pos.x - bounds.x).clamp(0.0, bounds.width);
                let h = rel_x / bounds.width * 360.0;
                Some(Action::publish(Message::SetColorHue(h)).and_capture())
            }
            Mouse(ME::ButtonReleased(iced::mouse::Button::Left)) => {
                state.dragging = false;
                None
            }
            _ => None,
        }
    }

    fn draw(
        &self,
        _state: &DragState,
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());

        // Rainbow gradient across 360° using 7 stops (max 8 in iced)
        let rainbow = canvas::gradient::Linear::new(Point::ORIGIN, Point::new(bounds.width, 0.0))
            .add_stop(0.0 / 6.0, Color::from_rgb(1.0, 0.0, 0.0))
            .add_stop(1.0 / 6.0, Color::from_rgb(1.0, 1.0, 0.0))
            .add_stop(2.0 / 6.0, Color::from_rgb(0.0, 1.0, 0.0))
            .add_stop(3.0 / 6.0, Color::from_rgb(0.0, 1.0, 1.0))
            .add_stop(4.0 / 6.0, Color::from_rgb(0.0, 0.0, 1.0))
            .add_stop(5.0 / 6.0, Color::from_rgb(1.0, 0.0, 1.0))
            .add_stop(1.0, Color::from_rgb(1.0, 0.0, 0.0));
        frame.fill(
            &Path::rectangle(Point::ORIGIN, bounds.size()),
            rainbow,
        );

        // Hue cursor: vertical white bar with black outline
        let cx = self.hue / 360.0 * bounds.width;
        frame.fill(
            &Path::rectangle(
                Point::new(cx - 3.0, -1.0),
                Size::new(6.0, bounds.height + 2.0),
            ),
            Color::WHITE,
        );
        frame.fill(
            &Path::rectangle(
                Point::new(cx - 1.5, 0.0),
                Size::new(3.0, bounds.height),
            ),
            Color::BLACK,
        );

        vec![frame.into_geometry()]
    }
}

// ── Mode button ───────────────────────────────────────────────────────────────

fn mode_btn<'a>(mode: ColorMode, hex: &str, is_selected: bool) -> Element<'a, Message> {
    let (r, g, b) = hex_to_rgb(hex);
    let bg = Color::from_rgb(r, g, b);
    let text_col = if luminance(r, g, b) < 0.5 {
        Color::WHITE
    } else {
        Color::from_rgb(0.07, 0.07, 0.07)
    };
    let label = mode.as_str();
    button(text(label).size(14).color(text_col))
        .on_press(Message::SetColorMode(mode))
        .width(Length::Fixed(BTN_W))
        .style(move |_, status| iced::widget::button::Style {
            background: Some(Background::Color(
                if matches!(status, iced::widget::button::Status::Hovered) {
                    Color::from_rgb((r + 0.08).min(1.0), (g + 0.08).min(1.0), (b + 0.08).min(1.0))
                } else {
                    bg
                },
            )),
            border: Border {
                color: if is_selected {
                    Color::from_rgb(0.18, 0.52, 0.96)
                } else {
                    Color::from_rgba(0.0, 0.0, 0.0, 0.2)
                },
                width: if is_selected { 2.5 } else { 1.0 },
                radius: 6.0.into(),
            },
            text_color: text_col,
            shadow: Shadow::default(),
            snap: false,
        })
        .into()
}

fn divider<'a>() -> Element<'a, Message> {
    rule::horizontal(1)
        .style(|_| iced_widget::rule::Style {
            color: COLORS.border,
            radius: 0.0.into(),
            fill_mode: iced_widget::rule::FillMode::Full,
            snap: false,
        })
        .into()
}

// ── Public view ───────────────────────────────────────────────────────────────

pub fn colors_dialog<'a>(state: &'a SettingsState, bg: iced::Color) -> Element<'a, Message> {
    let mode = &state.color_mode;
    let current_hex = match mode {
        ColorMode::Even => &state.card_colors.even,
        ColorMode::Odd => &state.card_colors.odd,
        ColorMode::Inactive => &state.card_colors.inactive,
        ColorMode::Background => &state.card_colors.background,
    };

    let (r, g, b) = hex_to_rgb(current_hex);
    let (_, sat, val) = rgb_to_hsv(r, g, b);
    let hue = state.picker_h;

    // ── Left: canvas pickers ─────────────────────────────────────────────────

    let sv_canvas: Element<Message> = Canvas::new(SVSquare { hue, sat, val })
        .width(Length::Fixed(PICKER_SIZE))
        .height(Length::Fixed(PICKER_SIZE))
        .into();

    let hue_canvas: Element<Message> = Canvas::new(HueBar { hue })
        .width(Length::Fixed(PICKER_SIZE))
        .height(Length::Fixed(HUE_H))
        .into();

    // Color preview swatch showing hex
    let preview_col = Color::from_rgb(r, g, b);
    let txt_on_preview = if luminance(r, g, b) < 0.5 { Color::WHITE } else { Color::from_rgb(0.07, 0.07, 0.07) };
    let preview: Element<Message> = container(
        text(current_hex.as_str()).size(13).color(txt_on_preview),
    )
    .style(move |_| iced::widget::container::Style {
        background: Some(Background::Color(preview_col)),
        border: Border { color: Color::from_rgba(0.0, 0.0, 0.0, 0.2), width: 1.0, radius: 6.0.into() },
        ..Default::default()
    })
    .padding([10, 14])
    .width(Length::Fixed(PICKER_SIZE))
    .into();

    let left_col: Element<Message> = column![
        sv_canvas,
        Space::new().height(8),
        hue_canvas,
        Space::new().height(8),
        preview,
    ]
    .spacing(0)
    .into();

    // ── Right: mode buttons ──────────────────────────────────────────────────

    let right_col: Element<Message> = column![
        mode_btn(ColorMode::Even, &state.card_colors.even, *mode == ColorMode::Even),
        mode_btn(ColorMode::Odd, &state.card_colors.odd, *mode == ColorMode::Odd),
        mode_btn(ColorMode::Inactive, &state.card_colors.inactive, *mode == ColorMode::Inactive),
        mode_btn(ColorMode::Background, &state.card_colors.background, *mode == ColorMode::Background),
        divider(),
        button(text("Default Colors").size(13))
            .on_press(Message::SetDefaultCardColors)
            .width(Length::Fixed(BTN_W))
            .style(secondary_button()),
    ]
    .spacing(8)
    .into();

    // ── Header + layout ──────────────────────────────────────────────────────

    let header: Element<Message> = row![
        text("Set Alarm Colors").size(20).color(COLORS.text),
        Space::new().width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::ToggleColors)
            .style(secondary_button()),
    ]
    .align_y(iced::Alignment::Center)
    .into();

    let content = column![
        header,
        divider(),
        row![left_col, right_col].spacing(ROW_SPACING).align_y(iced::Alignment::Start),
    ]
    .spacing(16)
    .padding(CARD_PAD);

    container(content)
        .max_width(DIALOG_W)
        .style(card_container_style_colored(bg))
        .into()
}

// ── Color math helpers ────────────────────────────────────────────────────────

fn hsv_to_color(h: f32, s: f32, v: f32) -> Color {
    let h = h % 360.0;
    let c = v * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = v - c;
    let (r, g, b) = if h < 60.0 { (c, x, 0.0) }
        else if h < 120.0 { (x, c, 0.0) }
        else if h < 180.0 { (0.0, c, x) }
        else if h < 240.0 { (0.0, x, c) }
        else if h < 300.0 { (x, 0.0, c) }
        else { (c, 0.0, x) };
    Color::from_rgb(r + m, g + m, b + m)
}

fn rgb_to_hsv(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let delta = max - min;
    let v = max;
    let s = if max > 0.001 { delta / max } else { 0.0 };
    let h = if delta < 0.001 {
        0.0
    } else if (max - r).abs() < 0.001 {
        let h = 60.0 * ((g - b) / delta);
        if h < 0.0 { h + 360.0 } else { h }
    } else if (max - g).abs() < 0.001 {
        60.0 * ((b - r) / delta + 2.0)
    } else {
        60.0 * ((r - g) / delta + 4.0)
    };
    (h, s, v)
}

fn hex_to_rgb(hex: &str) -> (f32, f32, f32) {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255) as f32 / 255.0;
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255) as f32 / 255.0;
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255) as f32 / 255.0;
        (r, g, b)
    } else {
        (1.0, 1.0, 1.0)
    }
}

fn luminance(r: f32, g: f32, b: f32) -> f32 {
    0.299 * r + 0.587 * g + 0.114 * b
}

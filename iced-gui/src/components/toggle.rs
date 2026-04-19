use crate::messages::Message;
use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path};
use iced::{Color, Element, Length, Point, Rectangle, Size};
use iced_widget::Action;

pub const TRACK_W: f32 = 44.0;
pub const TRACK_H: f32 = 24.0;
const THUMB_R: f32 = 9.5;

struct ToggleCanvas {
    pos: f32,
    on_press: Message,
}

impl canvas::Program<Message> for ToggleCanvas {
    type State = ();

    fn update(
        &self,
        _state: &mut (),
        event: &canvas::Event,
        bounds: Rectangle,
        cursor: iced::mouse::Cursor,
    ) -> Option<Action<Message>> {
        if let canvas::Event::Mouse(iced::mouse::Event::ButtonPressed(
            iced::mouse::Button::Left,
        )) = event
        {
            if cursor.is_over(bounds) {
                return Some(Action::publish(self.on_press.clone()).and_capture());
            }
        }
        None
    }

    fn draw(
        &self,
        _state: &(),
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());

        let cy = bounds.height / 2.0;
        let r = TRACK_H / 2.0;
        let t = self.pos.clamp(0.0, 1.0);

        // Track: gray (#bfbfbf) → success green (#38a169)
        let track_color = Color::from_rgb(
            0.75 + (0.220 - 0.75) * t,
            0.75 + (0.631 - 0.75) * t,
            0.75 + (0.412 - 0.75) * t,
        );

        // Pill: two semicircle caps + connecting rect
        frame.fill(&Path::circle(Point::new(r, cy), r), track_color);
        frame.fill(
            &Path::rectangle(Point::new(r, cy - r), Size::new(TRACK_W - TRACK_H, TRACK_H)),
            track_color,
        );
        frame.fill(
            &Path::circle(Point::new(TRACK_W - r, cy), r),
            track_color,
        );

        // Thumb slides from left cap center to right cap center
        let thumb_cx = r + t * (TRACK_W - TRACK_H);

        // Drop shadow
        frame.fill(
            &Path::circle(Point::new(thumb_cx, cy + 1.0), THUMB_R),
            Color::from_rgba(0.0, 0.0, 0.0, 0.15),
        );
        // White thumb
        frame.fill(
            &Path::circle(Point::new(thumb_cx, cy), THUMB_R),
            Color::WHITE,
        );

        vec![frame.into_geometry()]
    }
}

pub fn animated_toggle<'a>(
    anims: &std::collections::HashMap<String, f32>,
    key: &str,
    logical: bool,
    on_press: Message,
) -> Element<'a, Message> {
    let pos = anims.get(key).copied().unwrap_or(if logical { 1.0 } else { 0.0 });
    Canvas::new(ToggleCanvas { pos, on_press })
        .width(Length::Fixed(TRACK_W))
        .height(Length::Fixed(TRACK_H))
        .into()
}

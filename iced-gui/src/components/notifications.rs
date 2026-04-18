use crate::messages::Message;
use crate::state::{Notification, NotificationKind};
use crate::theme::COLORS;
use iced::{
    widget::{button, column, container, row, text, Column},
    Background, Color, Element, Length,
};

fn kind_colors(kind: &NotificationKind) -> (Color, Color) {
    // (background, border)
    match kind {
        NotificationKind::Success => (
            Color::from_rgb(0.220, 0.631, 0.412),
            Color::from_rgb(0.165, 0.490, 0.314),
        ),
        NotificationKind::Error => (
            Color::from_rgb(0.863, 0.196, 0.196),
            Color::from_rgb(0.700, 0.140, 0.140),
        ),
        NotificationKind::Warning => (
            Color::from_rgb(0.847, 0.627, 0.059),
            Color::from_rgb(0.700, 0.510, 0.020),
        ),
        NotificationKind::Info => (
            Color::from_rgb(0.192, 0.510, 0.812),
            Color::from_rgb(0.140, 0.380, 0.640),
        ),
    }
}

fn toast_item<'a>(notif: &'a Notification, index: usize) -> Element<'a, Message> {
    let (bg, border) = kind_colors(&notif.kind);

    let dismiss_btn = button(text("✕").size(12).color(Color::WHITE))
        .on_press(Message::DismissNotification(index))
        .padding([2, 6])
        .style(move |_theme: &iced::Theme, status: iced::widget::button::Status| {
            let alpha = match status {
                iced::widget::button::Status::Hovered => 0.25,
                _ => 0.12,
            };
            iced::widget::button::Style {
                background: Some(Background::Color(Color::from_rgba(1.0, 1.0, 1.0, alpha))),
                border: iced::Border {
                    color: Color::TRANSPARENT,
                    width: 0.0,
                    radius: iced::border::Radius::new(4.0),
                },
                shadow: iced::Shadow::default(),
                text_color: Color::WHITE,
                snap: false,
            }
        });

    let header = row![
        text(&notif.title).size(13).color(Color::WHITE),
        iced::widget::Space::new().width(Length::Fill),
        dismiss_btn,
    ]
    .align_y(iced::Alignment::Center);

    let body = if notif.message.is_empty() {
        Column::new()
    } else {
        Column::new().push(
            text(&notif.message)
                .size(12)
                .color(Color::from_rgba(1.0, 1.0, 1.0, 0.88)),
        )
    };

    let inner = column![header].push(body).spacing(3).padding(12);

    container(inner)
        .width(Length::Fixed(280.0))
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            text_color: None,
            background: Some(Background::Color(bg)),
            border: iced::Border {
                color: border,
                width: 1.0,
                radius: iced::border::Radius::new(8.0),
            },
            shadow: iced::Shadow {
                color: Color::from_rgba(0.0, 0.0, 0.0, 0.28),
                offset: iced::Vector::new(0.0, 4.0),
                blur_radius: 10.0,
            },
            snap: false,
        })
        .into()
}

pub fn notifications_view<'a>(notifications: &'a [Notification]) -> Element<'a, Message> {
    if notifications.is_empty() {
        return container(text(""))
            .width(Length::Fixed(0.0))
            .height(Length::Fixed(0.0))
            .into();
    }

    let toasts: Vec<Element<Message>> = notifications
        .iter()
        .enumerate()
        .map(|(i, n)| toast_item(n, i))
        .collect();

    let mut col = Column::new().spacing(8);
    for t in toasts {
        col = col.push(t);
    }

    // The stack positioning (top-right) is handled in views.rs
    col.into()
}

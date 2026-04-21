use crate::messages::Message;
use iced::widget::{button, container, text};
use iced::{Color, Element, Length, Vector};

pub fn centered_button_content<'a>(label: &'a str, size: f32) -> Element<'a, Message> {
    container(
        text(label)
            .size(size)
            .color(Color::WHITE)
            .align_x(iced::Alignment::Center)
            .align_y(iced::Alignment::Center),
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .center_x(Length::Fill)
    .center_y(Length::Fill)
    .into()
}

pub fn start_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.22, 0.82, 0.22),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.12, 0.72, 0.12),
            _ => Color::from_rgb(0.18, 0.78, 0.18),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 28.0.into(),
            },
            shadow: iced::Shadow {
                offset: Vector::new(0.0, 2.0),
                blur_radius: 4.0,
                color: Color::from_rgba(0.0, 0.0, 0.0, 0.3),
            },
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

pub fn stop_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.85, 0.15, 0.15),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.75, 0.10, 0.10),
            _ => Color::from_rgb(0.90, 0.20, 0.20),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 28.0.into(),
            },
            shadow: iced::Shadow {
                offset: Vector::new(0.0, 2.0),
                blur_radius: 4.0,
                color: Color::from_rgba(0.0, 0.0, 0.0, 0.3),
            },
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

pub fn reset_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.3, 0.3, 0.3),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.4, 0.4, 0.4),
            _ => Color::from_rgb(0.25, 0.25, 0.25),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::from_rgb(0.4, 0.4, 0.4),
                width: 1.0,
                radius: 20.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

pub fn lap_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.25, 0.25, 0.25),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.35, 0.35, 0.35),
            _ => Color::from_rgb(0.20, 0.20, 0.20),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::from_rgb(0.4, 0.4, 0.4),
                width: 1.0,
                radius: 24.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

pub fn adjuster_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.3, 0.3, 0.3),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.35, 0.35, 0.35),
            _ => Color::from_rgb(0.22, 0.22, 0.22),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::from_rgb(0.35, 0.35, 0.35),
                width: 1.0,
                radius: 8.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

pub fn save_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.2, 0.4, 0.8),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.1, 0.3, 0.7),
            _ => Color::from_rgb(0.15, 0.35, 0.75),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 20.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

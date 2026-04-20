use crate::messages::Message;
use crate::state::AppState;
use crate::theme::hex_to_color;
use iced::widget::{button, column, container, row, text};
use iced::{Color, Element, Length, Vector};

pub fn countdown_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let bg = hex_to_color(&state.settings.card_colors.background);
    let bg_dark = Color {
        r: (bg.r * 0.4).max(0.05),
        g: (bg.g * 0.4).max(0.05),
        b: (bg.b * 0.4).max(0.05),
        a: bg.a,
    };
    let border_color = Color {
        r: (bg.r + 0.15).min(1.0),
        g: (bg.g + 0.15).min(1.0),
        b: (bg.b + 0.15).min(1.0),
        a: bg.a,
    };
    let text_color = if (bg.r + bg.g + bg.b) / 3.0 > 0.5 {
        Color::BLACK
    } else {
        Color::WHITE
    };
    let text_secondary = Color {
        r: text_color.r * 0.6,
        g: text_color.g * 0.6,
        b: text_color.b * 0.6,
        a: text_color.a,
    };

    let remaining_secs = if state.countdown_running {
        if let Some(target) = state.countdown_target {
            let elapsed = target.elapsed().as_secs();
            if elapsed >= state.countdown_duration_secs {
                0
            } else {
                state.countdown_duration_secs - elapsed
            }
        } else {
            state.countdown_duration_secs
        }
    } else {
        state.countdown_duration_secs
    };

    let time_string = format_countdown_time(remaining_secs);

    let is_finished = remaining_secs == 0 && !state.countdown_running;

    let time_display = text(time_string)
        .size(if remaining_secs >= 3600 { 40 } else { 52 })
        .color(if is_finished {
            Color::from_rgb(0.95, 0.3, 0.3)
        } else {
            text_color
        })
        .align_x(iced::Alignment::Center);

    let clock_size: f32 = 260.0;
    let clock_border_color = if is_finished {
        Color::from_rgb(0.9, 0.3, 0.3)
    } else {
        border_color
    };
    let clock_border_width = if is_finished { 3.0 } else { 2.0 };

    let clock = container(
        container(time_display)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x(Length::Fill)
            .center_y(Length::Fill),
    )
    .width(Length::Fixed(clock_size))
    .height(Length::Fixed(clock_size))
    .style(move |_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(iced::Background::Color(bg_dark)),
        border: iced::Border {
            color: clock_border_color,
            width: clock_border_width,
            radius: clock_size.into(),
        },
        ..iced::widget::container::Style::default()
    });

    let time_pickers: Element<Message> = if state.countdown_running || is_finished {
        container(text("")).into()
    } else {
        let hours = remaining_secs / 3600;
        let minutes = (remaining_secs % 3600) / 60;
        let seconds = remaining_secs % 60;

        let hour_col = column![
            container(
                button(text("+").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetHours((hours as u8 + 1).min(99)))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
            text(format!("{:02}", hours))
                .size(26)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
            container(
                button(text("-").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetHours(hours.saturating_sub(1) as u8))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
        ]
        .spacing(4);

        let min_col = column![
            container(
                button(text("+").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetMinutes(((minutes as u8 + 1) % 60)))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
            text(format!("{:02}", minutes))
                .size(26)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
            container(
                button(text("-").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetMinutes(minutes.saturating_sub(1) as u8))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
        ]
        .spacing(4);

        let sec_col = column![
            container(
                button(text("+").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetSeconds(((seconds as u8 + 1) % 60)))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
            text(format!("{:02}", seconds))
                .size(26)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
            container(
                button(text("-").size(24).align_x(iced::Alignment::Center))
                    .on_press(Message::CountdownSetSeconds(seconds.saturating_sub(1) as u8))
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                    .style(android_adjuster_style())
            ),
        ]
        .spacing(4);

        let labels = column![
            text("hours")
                .size(10)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
            text("").size(16),
            text("min")
                .size(10)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
            text("").size(16),
            text("sec")
                .size(10)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
        ]
        .spacing(4);

        container(
            column![
                row![
                    hour_col,
                    text(":").size(28).color(text_secondary),
                    min_col,
                    text(":").size(28).color(text_secondary),
                    sec_col
                ]
                .spacing(8)
                .align_y(iced::Alignment::Center),
                labels,
            ]
            .spacing(0),
        )
        .padding(iced::Padding {
            top: 16.0,
            ..Default::default()
        })
        .center_x(Length::Fill)
        .into()
    };

    let btn_start_stop = if state.countdown_running {
        container(
            button(
                text("Stop")
                    .size(22)
                    .color(Color::WHITE)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::CountdownStop)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_stop_button_style()),
        )
        .width(Length::Fixed(120.0))
        .height(Length::Fixed(56.0))
    } else {
        container(
            button(
                text("Start")
                    .size(22)
                    .color(Color::WHITE)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::CountdownStart)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_start_button_style()),
        )
        .width(Length::Fixed(120.0))
        .height(Length::Fixed(56.0))
    };

    let btn_reset = container(
        button(
            text("Reset")
                .size(18)
                .color(text_color)
                .align_x(iced::Alignment::Center),
        )
        .on_press(Message::CountdownReset)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(android_reset_button_style()),
    )
    .width(Length::Fixed(80.0))
    .height(Length::Fixed(40.0));

    let content = column![
        container(clock)
            .padding(iced::Padding {
                top: 24.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
        time_pickers,
        container(btn_start_stop)
            .padding(iced::Padding {
                top: 20.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
        container(btn_reset)
            .padding(iced::Padding {
                top: 12.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
    ]
    .spacing(0);

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(bg)),
            ..iced::widget::container::Style::default()
        })
        .into()
}

fn format_countdown_time(total_secs: u64) -> String {
    let hours = total_secs / 3600;
    let minutes = (total_secs % 3600) / 60;
    let seconds = total_secs % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

fn android_start_button_style(
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

fn android_stop_button_style(
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

fn android_adjuster_style(
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

fn android_reset_button_style(
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

use crate::components::buttons::{
    adjuster_button_style, centered_button_content, reset_button_style, start_button_style,
    stop_button_style,
};
use crate::messages::Message;
use crate::state::AppState;
use crate::theme::hex_to_color;
use iced::widget::{button, column, container, row, text};
use iced::{Color, Element, Length, Vector};

fn spinbox_col(
    value: u64,
    on_increment: Message,
    on_decrement: Message,
    max_val: u64,
) -> Element<'static, Message> {
    column![
        container(
            button(
                container(
                    text("+")
                        .size(20)
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill),
            )
            .on_press(on_increment)
            .width(Length::Fill)
            .height(Length::Fixed(28.0))
            .style(android_adjuster_style())
        ),
        container(
            text(format!("{:02}", value))
                .size(22)
                .color(Color::from_rgb(0.6, 0.6, 0.6))
                .align_x(iced::Alignment::Center),
        )
        .width(Length::Fill)
        .center_x(Length::Fill),
        container(
            button(
                container(
                    text("-")
                        .size(20)
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill),
            )
            .on_press(on_decrement)
            .width(Length::Fill)
            .height(Length::Fixed(28.0))
            .style(android_adjuster_style())
        ),
    ]
    .width(Length::Fixed(50.0))
    .spacing(4)
    .into()
}

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

    let time_pickers: Element<Message> = if state.countdown_running {
        container(text("")).into()
    } else {
        let hours = remaining_secs / 3600;
        let minutes = (remaining_secs % 3600) / 60;
        let seconds = remaining_secs % 60;

        let hour_col = spinbox_col(
            hours,
            Message::CountdownSetHours((hours as u8 + 1).min(99)),
            Message::CountdownSetHours(hours.saturating_sub(1) as u8),
            99,
        );
        let min_col = spinbox_col(
            minutes,
            Message::CountdownSetMinutes(((minutes as u8 + 1) % 60)),
            Message::CountdownSetMinutes(minutes.saturating_sub(1) as u8),
            59,
        );
        let sec_col = spinbox_col(
            seconds,
            Message::CountdownSetSeconds(((seconds as u8 + 1) % 60)),
            Message::CountdownSetSeconds(seconds.saturating_sub(1) as u8),
            59,
        );

        container(
            column![row![
                hour_col,
                text(":").size(22).color(text_secondary),
                min_col,
                text(":").size(22).color(text_secondary),
                sec_col
            ]
            .spacing(4)
            .align_y(iced::Alignment::Center),]
            .spacing(0),
        )
        .padding(iced::Padding {
            top: 16.0,
            left: 20.0,
            right: 20.0,
            bottom: 8.0,
        })
        .center_x(Length::Fill)
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(bg_dark)),
            border: iced::Border {
                color: border_color,
                width: 1.0,
                radius: 12.0.into(),
            },
            ..iced::widget::container::Style::default()
        })
        .into()
    };

    let btn_start_stop = if state.countdown_running {
        container(
            button(
                container(
                    text("Stop")
                        .size(22)
                        .color(Color::WHITE)
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill),
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
                container(
                    text("Start")
                        .size(22)
                        .color(Color::WHITE)
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill),
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
            container(
                text("Reset")
                    .size(18)
                    .color(text_color)
                    .align_x(iced::Alignment::Center)
                    .align_y(iced::Alignment::Center),
            )
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x(Length::Fill)
            .center_y(Length::Fill),
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

fn android_start_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    start_button_style()
}

fn android_stop_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    stop_button_style()
}

fn android_adjuster_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    adjuster_button_style()
}

fn android_reset_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    reset_button_style()
}

fn format_countdown_time(total_secs: u64) -> String {
    let hours = total_secs / 3600;
    let minutes = (total_secs % 3600) / 60;
    let seconds = total_secs % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

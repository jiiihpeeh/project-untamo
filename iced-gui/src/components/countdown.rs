use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style_colored, hex_to_color, COLORS};
use iced::widget::{button, column, container, row, text};
use iced::{Color, Element, Length};

fn format_countdown_time(total_secs: u64) -> String {
    let hours = total_secs / 3600;
    let minutes = (total_secs % 3600) / 60;
    let seconds = total_secs % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

pub fn countdown_view<'a>(state: &'a AppState) -> Element<'a, Message> {
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
    let time_display = text(time_string).size(72).color(COLORS.text);

    let hours = remaining_secs / 3600;
    let minutes = (remaining_secs % 3600) / 60;
    let seconds = remaining_secs % 60;

    let time_pickers = if state.countdown_running {
        column![
            text(format!("{:02}", hours)).size(32),
            text("hours").size(12).color(COLORS.text_secondary),
        ]
        .spacing(4)
    } else {
        column![time_adjuster(
            ":",
            0,
            99,
            hours as u8,
            Message::CountdownSetHours
        ),]
        .spacing(4)
    };

    let time_pickers2 = if state.countdown_running {
        column![
            text(format!("{:02}", minutes)).size(32),
            text("min").size(12).color(COLORS.text_secondary),
        ]
        .spacing(4)
    } else {
        column![time_adjuster(
            ":",
            0,
            59,
            minutes as u8,
            Message::CountdownSetMinutes
        ),]
        .spacing(4)
    };

    let time_pickers3 = if state.countdown_running {
        column![
            text(format!("{:02}", seconds)).size(32),
            text("sec").size(12).color(COLORS.text_secondary),
        ]
        .spacing(4)
    } else {
        column![time_adjuster(
            "",
            0,
            59,
            seconds as u8,
            Message::CountdownSetSeconds
        ),]
        .spacing(4)
    };

    let btn_start_stop = if state.countdown_running {
        button(text("Stop").size(20))
            .on_press(Message::CountdownStop)
            .style(countdown_button_style(true))
    } else {
        button(text("Start").size(20))
            .on_press(Message::CountdownStart)
            .style(countdown_button_style(false))
    };

    let btn_reset = button(text("Reset").size(20))
        .on_press(Message::CountdownReset)
        .style(reset_button_style());

    let controls = column![btn_start_stop, btn_reset]
        .spacing(12)
        .padding(iced::Padding {
            top: 20.0,
            right: 0.0,
            bottom: 0.0,
            left: 0.0,
        });

    let content = column![
        container(time_display).padding(iced::Padding {
            top: 40.0,
            right: 0.0,
            bottom: 10.0,
            left: 0.0,
        }),
        row![time_pickers, time_pickers2, time_pickers3].spacing(16),
        controls,
    ]
    .spacing(10);

    let bg = hex_to_color(&state.settings.card_colors.background);
    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(card_container_style_colored(bg))
        .into()
}

fn time_adjuster(
    separator: &str,
    _min: u8,
    _max: u8,
    value: u8,
    msg: fn(u8) -> Message,
) -> Element<'_, Message> {
    let btn_dec = button(text("-").size(24))
        .on_press(msg(value.saturating_sub(1)))
        .width(Length::Fixed(44.0))
        .height(Length::Fixed(44.0))
        .style(adjuster_button_style());

    let btn_inc = button(text("+").size(24))
        .on_press(msg(value.saturating_add(1)))
        .width(Length::Fixed(44.0))
        .height(Length::Fixed(44.0))
        .style(adjuster_button_style());

    let value_text = if separator.is_empty() {
        text(format!("{:02}", value)).size(32)
    } else {
        text(format!("{}{:02}", separator, value)).size(32)
    };

    row![
        btn_dec,
        container(value_text)
            .width(Length::Fixed(60.0))
            .center_x(Length::Fill),
        btn_inc
    ]
    .spacing(4)
    .into()
}

fn countdown_button_style(
    running: bool,
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered if running => Color::from_rgb(0.75, 0.15, 0.15),
            iced::widget::button::Status::Hovered => Color::from_rgb(0.15, 0.75, 0.25),
            iced::widget::button::Status::Pressed if running => Color::from_rgb(0.65, 0.10, 0.10),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.10, 0.65, 0.15),
            _ if running => Color::from_rgb(0.85, 0.20, 0.20),
            _ => Color::from_rgb(0.20, 0.85, 0.30),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 8.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

fn adjuster_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.30, 0.30, 0.30),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.40, 0.40, 0.40),
            _ => Color::from_rgb(0.25, 0.25, 0.25),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 8.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

fn reset_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.45, 0.45, 0.45),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.35, 0.35, 0.35),
            _ => Color::from_rgb(0.30, 0.30, 0.30),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 8.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

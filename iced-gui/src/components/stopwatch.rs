use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style_colored, hex_to_color, COLORS};
use iced::widget::{button, column, container, scrollable, text};
use iced::{Color, Element, Length};

fn format_lap_time(elapsed_ms: u64) -> String {
    let total_seconds = elapsed_ms / 1000;
    let minutes = (total_seconds / 60) % 60;
    let hours = total_seconds / 3600;
    let seconds = total_seconds % 60;
    let centiseconds = (elapsed_ms % 1000) / 10;

    if hours > 0 {
        format!(
            "{:02}:{:02}:{:02}.{:02}",
            hours, minutes, seconds, centiseconds
        )
    } else {
        format!("{:02}:{:02}.{:02}", minutes, seconds, centiseconds)
    }
}

pub fn stopwatch_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let elapsed_ms = if state.stopwatch_running {
        state.stopwatch_elapsed_ms
            + state
                .stopwatch_start
                .map(|s| s.elapsed().as_millis() as u64)
                .unwrap_or(0)
    } else {
        state.stopwatch_elapsed_ms
    };

    let time_string = format_lap_time(elapsed_ms);
    let time_display = text(time_string).size(72).color(COLORS.text);

    let btn_start_stop = if state.stopwatch_running {
        button(text("Stop").size(20))
            .on_press(Message::StopwatchStop)
            .style(stopwatch_button_style(true))
    } else {
        button(text("Start").size(20))
            .on_press(Message::StopwatchStart)
            .style(stopwatch_button_style(false))
    };

    let btn_lap = if state.stopwatch_running {
        button(text("Lap").size(20))
            .on_press(Message::StopwatchLap)
            .style(lap_button_style())
    } else {
        button(text("Lap").size(20)).style(lap_button_style_disabled())
    };

    let btn_reset = button(text("Reset").size(20))
        .on_press(Message::StopwatchReset)
        .style(reset_button_style());

    let lap_list: Element<Message> = if state.stopwatch_laps.is_empty() {
        container(
            text("No laps recorded")
                .size(14)
                .color(COLORS.text_secondary),
        )
        .padding(10)
        .into()
    } else {
        let lap_items: Vec<Element<Message>> = state
            .stopwatch_laps
            .iter()
            .enumerate()
            .rev()
            .map(|(i, &lap_ms)| {
                let lap_num = state.stopwatch_laps.len() - i;
                let prev_lap_ms = if i == 0 {
                    0
                } else {
                    state.stopwatch_laps[i - 1]
                };
                let lap_diff = lap_ms - prev_lap_ms;
                let lap_text = format!(
                    "Lap {:2}: {} (+{})",
                    lap_num,
                    format_lap_time(lap_ms),
                    format_lap_time(lap_diff)
                );
                container(text(lap_text).size(14).color(COLORS.text))
                    .padding(iced::Padding {
                        top: 4.0,
                        right: 0.0,
                        bottom: 4.0,
                        left: 0.0,
                    })
                    .into()
            })
            .collect();

        scrollable(column(lap_items).spacing(2))
            .height(Length::Fixed(200.0))
            .into()
    };

    let controls = column![btn_start_stop, btn_lap, btn_reset]
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
        controls,
        container(lap_list).padding(iced::Padding {
            top: 20.0,
            right: 0.0,
            bottom: 0.0,
            left: 0.0,
        }),
    ]
    .spacing(10);

    let bg = hex_to_color(&state.settings.card_colors.background);
    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(card_container_style_colored(bg))
        .into()
}

fn stopwatch_button_style(
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

fn lap_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.20, 0.60, 0.90),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.15, 0.50, 0.80),
            _ => Color::from_rgb(0.25, 0.65, 0.95),
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

fn lap_button_style_disabled(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, _status| iced::widget::button::Style {
        background: Some(iced::Background::Color(Color::from_rgb(0.40, 0.40, 0.40))),
        border: iced::Border {
            color: Color::TRANSPARENT,
            width: 0.0,
            radius: 8.0.into(),
        },
        shadow: iced::Shadow::default(),
        text_color: Color::from_rgb(0.60, 0.60, 0.60),
        snap: false,
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

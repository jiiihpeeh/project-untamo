use crate::messages::Message;
use crate::state::AppState;
use crate::theme::hex_to_color;
use chrono;
use iced::widget::{button, column, container, row, scrollable, text};
use iced::{Color, Element, Length, Vector};

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

    let elapsed_ms = if state.stopwatch_running {
        state.stopwatch_elapsed_ms
            + state
                .stopwatch_start
                .map(|s| s.elapsed().as_millis() as u64)
                .unwrap_or(0)
    } else {
        state.stopwatch_elapsed_ms
    };

    let total_seconds = elapsed_ms / 1000;
    let minutes = (total_seconds / 60) % 60;
    let hours = total_seconds / 3600;
    let seconds = total_seconds % 60;
    let centiseconds = (elapsed_ms % 1000) / 10;

    let time_string = if hours > 0 {
        format!(
            "{:02}:{:02}:{:02}.{:02}",
            hours, minutes, seconds, centiseconds
        )
    } else {
        format!("{:02}:{:02}.{:02}", minutes, seconds, centiseconds)
    };

    let time_display = container(text(time_string).size(52).color(text_color))
        .width(Length::Fill)
        .center_x(Length::Fill);

    let clock_size: f32 = 260.0;
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
            color: border_color,
            width: 2.0,
            radius: clock_size.into(),
        },
        ..iced::widget::container::Style::default()
    });

    let btn_start_stop = if state.stopwatch_running {
        container(
            button(
                text("Stop")
                    .size(22)
                    .color(Color::WHITE)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::StopwatchStop)
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
            .on_press(Message::StopwatchStart)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_start_button_style()),
        )
        .width(Length::Fixed(120.0))
        .height(Length::Fixed(56.0))
    };

    let btn_lap = if state.stopwatch_running {
        container(
            button(
                text("Lap")
                    .size(20)
                    .color(Color::WHITE)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::StopwatchLap)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_lap_button_style()),
        )
        .width(Length::Fixed(100.0))
        .height(Length::Fixed(48.0))
    } else {
        container(
            text("Lap")
                .size(20)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
        )
        .width(Length::Fixed(100.0))
        .height(Length::Fixed(48.0))
    };

    let btn_reset = if !state.stopwatch_running && elapsed_ms > 0 {
        container(
            button(
                text("Reset")
                    .size(18)
                    .color(text_color)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::StopwatchReset)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_reset_button_style()),
        )
        .width(Length::Fixed(80.0))
        .height(Length::Fixed(40.0))
    } else {
        container(
            text("Reset")
                .size(18)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
        )
        .width(Length::Fixed(80.0))
        .height(Length::Fixed(40.0))
    };

    let btn_save = if !state.stopwatch_laps.is_empty() && !state.stopwatch_running {
        container(
            button(
                text("Save")
                    .size(18)
                    .color(text_color)
                    .align_x(iced::Alignment::Center),
            )
            .on_press(Message::SaveTimer(format!(
                "Timer {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M")
            )))
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_save_button_style()),
        )
        .width(Length::Fixed(70.0))
        .height(Length::Fixed(40.0))
    } else {
        container(
            text("Save")
                .size(18)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
        )
        .width(Length::Fixed(70.0))
        .height(Length::Fixed(40.0))
    };

    let btn_load = container(
        button(
            text("Load")
                .size(18)
                .color(text_color)
                .align_x(iced::Alignment::Center),
        )
        .on_press(Message::ToggleSavedTimers)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(android_save_button_style()),
    )
    .width(Length::Fixed(70.0))
    .height(Length::Fixed(40.0));

    let lap_list: Element<Message> = if state.show_saved_timers {
        if state.timers.is_empty() {
            container(text("No saved timers").size(14).color(text_secondary))
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill)
                .into()
        } else {
            let timer_items: Vec<Element<Message>> = state
                .timers
                .iter()
                .map(|timer| {
                    let lap_count = timer.laps.len();
                    let total_time = timer.laps.last().copied().unwrap_or(0);
                    let timer_text = format!(
                        "{} ({} laps, {})",
                        timer.title,
                        lap_count,
                        format_lap_time(total_time)
                    );
                    let timer_id = timer.id.clone();
                    row![
                        container(
                            button(text(timer_text).size(14).color(text_color))
                                .on_press(Message::LoadTimer(timer_id.clone()))
                                .style(android_timer_item_button_style(text_color))
                        )
                        .width(Length::Fill),
                        button(text("XLSX").size(12).color(text_secondary))
                            .on_press(Message::ExportTimerCsv(timer_id.clone(), true))
                            .style(android_export_button_style()),
                        button(text("CSV").size(12).color(text_secondary))
                            .on_press(Message::ExportTimerCsv(timer_id, false))
                            .style(android_export_button_style())
                    ]
                    .spacing(8)
                    .into()
                })
                .collect();
            scrollable(column(timer_items).spacing(4).width(Length::Fill))
                .width(Length::Fill)
                .height(Length::Fill)
                .into()
        }
    } else if state.stopwatch_laps.is_empty() {
        container(
            text("Tap Lap to record times")
                .size(14)
                .color(text_secondary),
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .into()
    } else {
        let lap_items: Vec<Element<Message>> = state
            .stopwatch_laps
            .iter()
            .enumerate()
            .rev()
            .take(10)
            .map(|(i, &lap_ms)| {
                let lap_num = state.stopwatch_laps.len() - i;
                let prev_lap_ms = if i == 0 {
                    0
                } else {
                    state.stopwatch_laps[i - 1]
                };
                let lap_diff = lap_ms - prev_lap_ms;
                let lap_text = format!(
                    "Lap {}   {}   +{}",
                    lap_num,
                    format_lap_time(lap_ms),
                    format_lap_time(lap_diff)
                );
                container(text(lap_text).size(14).color(text_secondary))
                    .padding(iced::Padding {
                        top: 6.0,
                        right: 8.0,
                        bottom: 6.0,
                        left: 8.0,
                    })
                    .width(Length::Fill)
                    .into()
            })
            .collect();

        scrollable(column(lap_items).spacing(0).width(Length::Fill))
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
    };

    let laps_container_height = if state.show_saved_timers {
        300.0
    } else {
        150.0
    };
    let laps_container = container(container(lap_list).width(Length::Fill).height(Length::Fill))
        .width(Length::Fixed(320.0))
        .height(Length::Fixed(laps_container_height))
        .padding(15)
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: if state.show_saved_timers {
                Some(iced::Background::Color(Color {
                    r: 0.8,
                    g: 0.7,
                    b: 0.6,
                    a: bg.a,
                }))
            } else {
                Some(iced::Background::Color(bg_dark))
            },
            border: iced::Border {
                color: border_color,
                width: 1.0,
                radius: 12.0.into(),
            },
            ..iced::widget::container::Style::default()
        });

    let buttons_row = row![btn_lap, btn_start_stop,]
        .spacing(16)
        .align_y(iced::Alignment::Center);

    let buttons_row2 = row![btn_reset, btn_save, btn_load]
        .spacing(20)
        .align_y(iced::Alignment::Center);

    let content = column![
        container(clock)
            .padding(iced::Padding {
                top: 24.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
        container(buttons_row)
            .padding(iced::Padding {
                top: 20.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
        container(buttons_row2)
            .padding(iced::Padding {
                top: 12.0,
                ..Default::default()
            })
            .center_x(Length::Fill),
        container(laps_container)
            .padding(iced::Padding {
                top: 20.0,
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

fn android_lap_button_style(
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

fn android_save_button_style(
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

fn android_timer_item_button_style(
    text_color: Color,
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.5, 0.42, 0.35),
            _ => Color::TRANSPARENT,
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border::default(),
            shadow: iced::Shadow::default(),
            text_color,
            snap: false,
        }
    }
}

fn android_export_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.3, 0.5, 0.3),
            _ => Color::from_rgb(0.2, 0.4, 0.2),
        };
        iced::widget::button::Style {
            background: Some(iced::Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 12.0.into(),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

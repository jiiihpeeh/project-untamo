use crate::components::buttons::{
    lap_button_style, reset_button_style, save_button_style, start_button_style, stop_button_style,
};
use crate::messages::Message;
use crate::state::AppState;
use crate::theme::hex_to_color;
use chrono;
use iced::widget::{button, column, container, row, scrollable, text};
use iced::{Color, Element, Length, Vector};

fn centered_button_content<'a>(label: &'a str, size: f32) -> Element<'a, Message> {
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

fn action_btn<'a>(
    label: &'a str,
    on_press: Message,
    style: impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style + 'a,
) -> Element<'a, Message> {
    container(
        button(centered_button_content(label, 22.0))
            .on_press(on_press)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(style),
    )
    .width(Length::Fixed(120.0))
    .height(Length::Fixed(56.0))
    .into()
}

fn small_btn<'a>(
    label: &'a str,
    on_press: Message,
    style: impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style + 'a,
) -> Element<'a, Message> {
    container(
        button(centered_button_content(label, 18.0))
            .on_press(on_press)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(style),
    )
    .width(Length::Fixed(80.0))
    .height(Length::Fixed(40.0))
    .into()
}

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

    let (buttons_row, buttons_row2) = if state.stopwatch_running {
        let start_lap = action_btn("Lap", Message::StopwatchLap, android_lap_button_style());
        let stop = action_btn("Stop", Message::StopwatchStop, android_stop_button_style());
        (
            row![start_lap, stop]
                .spacing(16)
                .align_y(iced::Alignment::Center),
            row![].spacing(20).align_y(iced::Alignment::Center),
        )
    } else {
        let start_lap = action_btn(
            "Start",
            Message::StopwatchStart,
            android_start_button_style(),
        );
        let reset = if elapsed_ms > 0 || !state.stopwatch_laps.is_empty() {
            small_btn(
                "Reset",
                Message::StopwatchReset,
                android_reset_button_style(),
            )
        } else {
            container(text(""))
                .width(Length::Fixed(80.0))
                .height(Length::Fixed(40.0))
                .into()
        };
        (
            row![start_lap].spacing(16).align_y(iced::Alignment::Center),
            if elapsed_ms > 0 || !state.stopwatch_laps.is_empty() {
                row![reset].spacing(20).align_y(iced::Alignment::Center)
            } else {
                row![].spacing(20).align_y(iced::Alignment::Center)
            },
        )
    };

    let btn_save = if !state.stopwatch_laps.is_empty() && !state.stopwatch_running {
        container(
            button(
                text("Save")
                    .size(14)
                    .color(Color::WHITE)
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
        .width(Length::Fill)
        .height(Length::Fixed(36.0))
    } else {
        container(
            text("Save")
                .size(14)
                .color(text_secondary)
                .align_x(iced::Alignment::Center),
        )
        .width(Length::Fill)
        .height(Length::Fixed(36.0))
    };

    let has_old_session = state.selected_timer_id.is_some();
    let actual_tab = if has_old_session {
        state.timer_tab
    } else {
        state.timer_tab.min(2)
    };

    let lap_list: Element<Message> = if actual_tab == 0 {
        if state.stopwatch_laps.is_empty() {
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
                    container(
                        container(text(lap_text).size(14).color(text_secondary))
                            .padding(iced::Padding {
                                top: 6.0,
                                bottom: 6.0,
                                ..Default::default()
                            })
                            .width(Length::Fill),
                    )
                    .padding(iced::Padding {
                        left: 8.0,
                        right: 8.0,
                        ..Default::default()
                    })
                    .width(Length::Fill)
                    .into()
                })
                .collect();
            column![
                scrollable(column(lap_items).spacing(4).width(Length::Fill))
                    .width(Length::Fill)
                    .height(Length::Fill),
                container(btn_save)
                    .padding(iced::Padding {
                        top: 8.0,
                        left: 8.0,
                        right: 8.0,
                        bottom: 4.0,
                    })
                    .width(Length::Fill)
                    .height(Length::Fixed(44.0))
            ]
            .spacing(0)
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
        }
    } else if actual_tab == 1 && has_old_session {
        if let Some(ref timer_id) = state.selected_timer_id {
            if let Some(timer) = state.timers.iter().find(|t| &t.id == timer_id) {
                let lap_items: Vec<Element<Message>> = timer
                    .laps
                    .iter()
                    .enumerate()
                    .rev()
                    .map(|(i, &lap_ms)| {
                        let lap_num = timer.laps.len() - i;
                        let prev_lap_ms = if i == 0 { 0 } else { timer.laps[i - 1] };
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
                                bottom: 6.0,
                                left: 8.0,
                                right: 8.0,
                            })
                            .width(Length::Fill)
                            .into()
                    })
                    .collect();
                let btn_continue = if !state.stopwatch_running {
                    container(
                        button(text("Continue").size(14).color(Color::WHITE))
                            .on_press(Message::ContinueTimer(timer_id.clone()))
                            .width(Length::Fill)
                            .height(Length::Fill)
                            .style(android_continue_button_style()),
                    )
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                } else {
                    container(
                        button(text("Stop").size(14).color(Color::WHITE))
                            .on_press(Message::StopwatchStop)
                            .width(Length::Fill)
                            .height(Length::Fill)
                            .style(android_stop_button_style()),
                    )
                    .width(Length::Fill)
                    .height(Length::Fixed(36.0))
                };
                column![
                    scrollable(column(lap_items).spacing(0).width(Length::Fill))
                        .width(Length::Fill)
                        .height(Length::Fill),
                    container(btn_continue)
                        .padding(iced::Padding {
                            top: 8.0,
                            left: 8.0,
                            right: 8.0,
                            bottom: 4.0,
                        })
                        .width(Length::Fill)
                        .height(Length::Fixed(44.0))
                ]
                .spacing(0)
                .width(Length::Fill)
                .height(Length::Fill)
                .into()
            } else {
                container(text("Select a saved timer").size(14).color(text_secondary))
                    .width(Length::Fill)
                    .height(Length::Fill)
                    .center_x(Length::Fill)
                    .center_y(Length::Fill)
                    .into()
            }
        } else {
            container(text("Select a saved timer").size(14).color(text_secondary))
                .width(Length::Fill)
                .height(Length::Fill)
                .center_x(Length::Fill)
                .center_y(Length::Fill)
                .into()
        }
    } else {
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
                    container(
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
                        .spacing(8),
                    )
                    .padding(iced::Padding {
                        left: 8.0,
                        right: 8.0,
                        top: 6.0,
                        bottom: 6.0,
                    })
                    .width(Length::Fill)
                    .into()
                })
                .collect();
            scrollable(column(timer_items).spacing(4).width(Length::Fill))
                .width(Length::Fill)
                .height(Length::Fill)
                .into()
        }
    };

    let tab_laps = container(
        button(
            container(
                text("Current")
                    .size(14)
                    .color(if actual_tab == 0 {
                        Color::WHITE
                    } else {
                        text_secondary
                    })
                    .align_x(iced::Alignment::Center)
                    .align_y(iced::Alignment::Center),
            )
            .width(Length::Fill)
            .height(Length::Fill),
        )
        .on_press(Message::SetTimerTab(0))
        .width(Length::Fill)
        .height(Length::Fill)
        .style(android_tab_button_style(actual_tab == 0)),
    )
    .width(Length::Fixed(100.0))
    .height(Length::Fixed(36.0));

    let tab_bar: Element<Message> = if has_old_session {
        let tab_old_session = container(
            button(
                container(
                    text("Old Session Data")
                        .size(14)
                        .color(if actual_tab == 1 {
                            Color::WHITE
                        } else {
                            text_secondary
                        })
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill),
            )
            .on_press(Message::SetTimerTab(1))
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_tab_button_style(actual_tab == 1)),
        )
        .width(Length::Fixed(140.0))
        .height(Length::Fixed(36.0));

        let tab_saved = container(
            button(
                container(
                    text("Saved")
                        .size(14)
                        .color(if actual_tab == 2 {
                            Color::WHITE
                        } else {
                            text_secondary
                        })
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill),
            )
            .on_press(Message::SetTimerTab(2))
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_tab_button_style(actual_tab == 2)),
        )
        .width(Length::Fill)
        .height(Length::Fixed(36.0));

        row![tab_laps, tab_old_session, tab_saved]
            .spacing(4)
            .align_y(iced::Alignment::Center)
            .into()
    } else {
        let tab_saved = container(
            button(
                container(
                    text("Saved")
                        .size(14)
                        .color(if actual_tab == 1 {
                            Color::WHITE
                        } else {
                            text_secondary
                        })
                        .align_x(iced::Alignment::Center)
                        .align_y(iced::Alignment::Center),
                )
                .width(Length::Fill)
                .height(Length::Fill),
            )
            .on_press(Message::SetTimerTab(1))
            .width(Length::Fill)
            .height(Length::Fill)
            .style(android_tab_button_style(actual_tab == 1)),
        )
        .width(Length::Fill)
        .height(Length::Fixed(36.0));

        row![tab_laps, tab_saved]
            .spacing(4)
            .align_y(iced::Alignment::Center)
            .into()
    };

    let tab_header = container(
        container(tab_bar)
            .padding(iced::Padding {
                top: 8.0,
                bottom: 8.0,
                left: 4.0,
                right: 4.0,
            })
            .width(Length::Fill),
    )
    .width(Length::Fill)
    .style(move |_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(iced::Background::Color(Color {
            r: 0.55,
            g: 0.45,
            b: 0.35,
            a: 1.0,
        })),
        border: iced::Border::default(),
        ..iced::widget::container::Style::default()
    });

    let laps_container = container(
        column![
            tab_header,
            container(lap_list)
                .width(Length::Fill)
                .height(Length::Fill)
                .padding(8)
        ]
        .spacing(0)
        .width(Length::Fill)
        .height(Length::Fill),
    )
    .width(Length::Fixed(420.0))
    .height(Length::Fixed(300.0))
    .padding(15)
    .style(move |_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(iced::Background::Color(Color {
            r: 0.8,
            g: 0.7,
            b: 0.6,
            a: bg.a,
        })),
        border: iced::Border {
            color: border_color,
            width: 1.0,
            radius: 12.0.into(),
        },
        ..iced::widget::container::Style::default()
    });

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
    start_button_style()
}

fn android_stop_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    stop_button_style()
}

fn android_lap_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    lap_button_style()
}

fn android_reset_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    reset_button_style()
}

fn android_save_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    save_button_style()
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

fn android_tab_button_style(
    active: bool,
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = if active {
            Color::from_rgb(0.35, 0.3, 0.25)
        } else {
            match status {
                iced::widget::button::Status::Hovered => Color::from_rgb(0.4, 0.35, 0.3),
                _ => Color::from_rgb(0.25, 0.22, 0.18),
            }
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

fn android_continue_button_style(
) -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style {
    move |_theme, status| {
        let bg = match status {
            iced::widget::button::Status::Hovered => Color::from_rgb(0.3, 0.6, 0.3),
            iced::widget::button::Status::Pressed => Color::from_rgb(0.2, 0.5, 0.2),
            _ => Color::from_rgb(0.25, 0.55, 0.25),
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

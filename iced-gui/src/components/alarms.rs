use crate::components::icons::{icon_svg, Icon};
use crate::messages::Message;
use crate::state::{Alarm, AppState, Device};
use crate::theme::{
    circle_fab_button, danger_button, hex_to_color, secondary_button, COLORS,
};
use chrono::{Datelike, Duration, Local, NaiveDateTime, NaiveTime};
use iced::widget::svg::{Handle, Svg};
use iced::{
    widget::{
        button, column, container, mouse_area, row, scrollable, stack, text, toggler, Column,
    },
    Background, Border, Color, Element, Length,
};
use iced_widget::rule;

// ── text helpers ──────────────────────────────────────────────────────────────

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
    }
}

fn format_time(time: &[u8], clock24: bool) -> String {
    if time.len() >= 2 {
        let h = time[0];
        let m = time[1];
        if clock24 {
            format!("{:02}:{:02}", h, m)
        } else {
            let period = if h < 12 { "AM" } else { "PM" };
            let h12 = match h % 12 {
                0 => 12,
                x => x,
            };
            format!("{:02}:{:02} {}", h12, m, period)
        }
    } else {
        "00:00".to_string()
    }
}

fn device_names(ids: &[String], all: &[Device]) -> String {
    let names: Vec<&str> = ids
        .iter()
        .filter_map(|id| all.iter().find(|d| &d.id == id))
        .map(|d| d.device_name.as_str())
        .collect();
    if names.is_empty() {
        "—".to_string()
    } else {
        names.join(", ")
    }
}

fn weekdays_string(weekdays: u8) -> String {
    let names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let active: Vec<&str> = names
        .iter()
        .enumerate()
        .filter(|(i, _)| weekdays & (1 << i) != 0)
        .map(|(_, n)| *n)
        .collect();
    if active.is_empty() {
        "—".to_string()
    } else {
        active.join(", ")
    }
}

fn format_date(date: &[u16]) -> String {
    if date.len() >= 3 {
        format!("{:04}-{:02}-{:02}", date[0], date[1], date[2])
    } else {
        "—".to_string()
    }
}

fn occurrence_label(alarm: &Alarm) -> (&'static str, String) {
    match alarm.occurrence.to_lowercase().as_str() {
        "once" | "yearly" => ("DATE", format_date(&alarm.date)),
        "daily" => ("WEEKDAYS", weekdays_string(0b0111_1111)),
        _ => ("WEEKDAYS", weekdays_string(alarm.weekdays)),
    }
}

// ── next-alarm calculation ────────────────────────────────────────────────────

/// Returns seconds until the next firing of this alarm (None if it cannot fire).
fn seconds_to_next_alarm(alarm: &Alarm) -> Option<i64> {
    if alarm.time.len() < 2 {
        return None;
    }
    let h = alarm.time[0] as u32;
    let m = alarm.time[1] as u32;
    let alarm_time = NaiveTime::from_hms_opt(h, m, 0)?;

    let now = Local::now().naive_local();
    let today = now.date();

    let next: NaiveDateTime = match alarm.occurrence.to_lowercase().as_str() {
        "once" => {
            if alarm.date.len() < 3 {
                return None;
            }
            let d = chrono::NaiveDate::from_ymd_opt(
                alarm.date[0] as i32,
                alarm.date[1] as u32,
                alarm.date[2] as u32,
            )?;
            d.and_time(alarm_time)
        }
        "daily" => {
            let candidate = today.and_time(alarm_time);
            if candidate > now {
                candidate
            } else {
                (today + Duration::days(1)).and_time(alarm_time)
            }
        }
        "weekly" => {
            // bit 0 = Mon, bit 6 = Sun;  chrono num_days_from_monday: Mon=0..Sun=6
            let weekdays_set: Vec<u32> = (0..7u32)
                .filter(|i| alarm.weekdays & (1 << i) != 0)
                .collect();
            if weekdays_set.is_empty() {
                return None;
            }
            let today_wd = today.weekday().num_days_from_monday(); // 0=Mon
            let mut best: Option<NaiveDateTime> = None;
            for &bit in &weekdays_set {
                let mut diff = bit as i64 - today_wd as i64;
                if diff < 0 {
                    diff += 7;
                }
                let candidate = (today + Duration::days(diff)).and_time(alarm_time);
                let candidate = if candidate <= now {
                    candidate + Duration::days(7)
                } else {
                    candidate
                };
                best = Some(best.map_or(candidate, |b: NaiveDateTime| b.min(candidate)));
            }
            best?
        }
        "yearly" => {
            if alarm.date.len() < 3 {
                return None;
            }
            let month = alarm.date[1] as u32;
            let day = alarm.date[2] as u32;
            let year = today.year();
            let this_year = chrono::NaiveDate::from_ymd_opt(year, month, day)?.and_time(alarm_time);
            if this_year > now {
                this_year
            } else {
                chrono::NaiveDate::from_ymd_opt(year + 1, month, day)?.and_time(alarm_time)
            }
        }
        _ => return None,
    };

    let secs = (next - now).num_seconds();
    if secs < 0 {
        None
    } else {
        Some(secs)
    }
}

fn format_countdown(secs: i64) -> String {
    let d = secs / 86400;
    let h = (secs % 86400) / 3600;
    let m = (secs % 3600) / 60;
    let s = secs % 60;
    if d > 0 {
        format!("in {}d {:02}:{:02}:{:02}", d, h, m, s)
    } else {
        format!("in {:02}:{:02}:{:02}", h, m, s)
    }
}

// ── card ──────────────────────────────────────────────────────────────────────

fn alarm_card<'a>(
    alarm: &'a Alarm,
    all_devices: &'a [Device],
    clock24: bool,
    hovered: bool,
    card_color: Color,
) -> Element<'a, Message> {
    // --- Header row ---
    let mut header = row![
        text(format!("{}: ", capitalize(&alarm.occurrence)))
            .size(13)
            .color(COLORS.text_secondary),
        text(alarm.label.clone()).size(13).color(COLORS.text),
    ]
    .spacing(0);

    if hovered {
        let timing = seconds_to_next_alarm(alarm)
            .map(format_countdown)
            .unwrap_or_default();
        header = header.push(
            text(format!("  {}", timing))
                .size(12)
                .color(COLORS.text_secondary),
        );
    }

    // --- Middle: time | devices | occurrence  (each column takes equal 1/3 width) ---
    let time_col = container(
        column![text(format_time(&alarm.time, clock24))
            .size(28)
            .color(COLORS.text),]
        .align_x(iced::Alignment::Center),
    )
    .width(Length::Fill)
    .center_x(Length::Fill);

    let dev_col = container(
        column![
            text("DEVICES").size(11).color(COLORS.text_secondary),
            text(device_names(&alarm.devices, all_devices))
                .size(13)
                .color(COLORS.text),
        ]
        .spacing(2),
    )
    .width(Length::Fill);

    let (occ_label, occ_val) = occurrence_label(alarm);
    let occ_col = container(
        column![
            text(occ_label).size(11).color(COLORS.text_secondary),
            text(occ_val).size(13).color(COLORS.text),
        ]
        .spacing(2),
    )
    .width(Length::Fill);

    let middle = row![time_col, dev_col, occ_col]
        .align_y(iced::Alignment::Center)
        .width(Length::Fill);

    // --- Hover action row ---
    let mut card_col = column![header, middle]
        .spacing(6)
        .padding(10)
        .width(Length::Fill);

    if hovered {
        let edit_col = container(
            column![
                text("EDIT").size(10).color(COLORS.text_secondary),
                button(icon_svg(Icon::Pencil, COLORS.text, 14.0))
                    .on_press(Message::EditAlarm(alarm.id.clone()))
                    .style(secondary_button()),
            ]
            .spacing(4)
            .align_x(iced::Alignment::Center),
        )
        .width(Length::Fill)
        .center_x(Length::Fill);

        let active_col = container(
            column![
                text("ACTIVE").size(10).color(COLORS.text_secondary),
                toggler(alarm.active).on_toggle(|_| Message::ToggleAlarmActive(alarm.id.clone())),
            ]
            .spacing(4)
            .align_x(iced::Alignment::Center),
        )
        .width(Length::Fill)
        .center_x(Length::Fill);

        let delete_col = container(
            column![
                text("DELETE").size(10).color(COLORS.text_secondary),
                button(icon_svg(Icon::Trash2, COLORS.danger, 14.0))
                    .on_press(Message::DeleteAlarm(alarm.id.clone()))
                    .style(danger_button()),
            ]
            .spacing(4)
            .align_x(iced::Alignment::Center),
        )
        .width(Length::Fill)
        .center_x(Length::Fill);

        let actions = row![edit_col, active_col, delete_col]
            .padding(iced::Padding {
                top: 6.0,
                right: 0.0,
                bottom: 0.0,
                left: 0.0,
            })
            .align_y(iced::Alignment::Center)
            .width(Length::Fill);

        card_col = card_col.push(rule::horizontal(1)).push(actions);
    }

    let id = alarm.id.clone();
    mouse_area(
        container(card_col)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| iced::widget::container::Style {
                background: Some(Background::Color(card_color)),
                border: Border {
                    color: Color::from_rgba(0.0, 0.0, 0.0, 0.10),
                    width: 1.0,
                    radius: 8.0.into(),
                },
                ..Default::default()
            }),
    )
    .on_enter(Message::AlarmHovered(id))
    .on_exit(Message::AlarmUnhovered)
    .into()
}

// ── view ──────────────────────────────────────────────────────────────────────

pub fn alarms_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = Svg::new(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(48.0))
        .height(Length::Fixed(48.0));

    let header = row![logo, text("Alarms").size(20).color(COLORS.text)]
        .spacing(10)
        .align_y(iced::Alignment::Center)
        .padding([10, 16]);

    let alarms_list: Element<Message> = if state.alarms.is_empty() {
        container(text("No alarms yet.").size(14).color(COLORS.text_secondary))
            .padding([24, 16])
            .into()
    } else {
        let mut col = Column::new();
        let clock24 = state.settings.clock24;
        let colors = &state.settings.card_colors;
        for (i, alarm) in state.alarms.iter().enumerate() {
            let hovered = state.hovered_alarm.as_deref() == Some(alarm.id.as_str());
            let card_color = if !alarm.active {
                hex_to_color(&colors.inactive)
            } else if i % 2 == 0 {
                hex_to_color(&colors.even)
            } else {
                hex_to_color(&colors.odd)
            };
            col = col.push(alarm_card(
                alarm,
                &state.devices,
                clock24,
                hovered,
                card_color,
            ));
        }
        col.spacing(6)
            .padding(iced::Padding {
                top: 0.0,
                right: 16.0,
                bottom: 16.0,
                left: 16.0,
            })
            .into()
    };

    let list_area = scrollable(column![alarms_list].width(Length::Fill)).height(Length::Fill);

    let fab = button(
        container(text("+").size(32).color(iced::Color::WHITE))
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x(Length::Fill)
            .center_y(Length::Fill),
    )
    .on_press(Message::ToggleAddAlarm)
    .width(Length::Fixed(56.0))
    .height(Length::Fixed(56.0))
    .padding(0)
    .style(circle_fab_button());

    let fab_overlay = container(container(fab).padding(iced::Padding {
        top: 0.0,
        right: 20.0,
        bottom: 24.0,
        left: 0.0,
    }))
    .width(Length::Fill)
    .height(Length::Fill)
    .align_right(Length::Fill)
    .align_bottom(Length::Fill);

    let main_stack = stack([column![header, list_area].into(), fab_overlay.into()]);

    let bg = hex_to_color(&state.settings.card_colors.background);
    container(main_stack)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(Background::Color(bg)),
            ..iced::widget::container::Style::default()
        })
        .into()
}

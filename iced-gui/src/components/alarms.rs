use crate::components::icons::{icon_svg, Icon};
use crate::messages::Message;
use crate::state::{Alarm, AppState, Device};
use crate::theme::{
    card_container_style, circle_fab_button, danger_button, flat_container_style, secondary_button,
    COLORS,
};
use iced::widget::svg::{Handle, Svg};
use iced::{
    widget::{button, column, container, row, scrollable, stack, text, toggler, Column, Space},
    Element, Length,
};

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().collect::<String>() + chars.as_str(),
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
            let h12 = match h % 12 { 0 => 12, x => x };
            format!("{:02}:{:02} {}", h12, m, period)
        }
    } else {
        "00:00".to_string()
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

fn device_names(device_ids: &[String], all_devices: &[Device]) -> String {
    let names: Vec<&str> = device_ids
        .iter()
        .filter_map(|id| all_devices.iter().find(|d| &d.id == id))
        .map(|d| d.device_name.as_str())
        .collect();
    if names.is_empty() {
        "—".to_string()
    } else {
        names.join(", ")
    }
}

fn occurrence_info(alarm: &Alarm) -> String {
    match alarm.occurrence.to_lowercase().as_str() {
        "weekly" => weekdays_string(alarm.weekdays),
        "once" | "yearly" => format_date(&alarm.date),
        "daily" => weekdays_string(0b0111_1111),
        _ => weekdays_string(alarm.weekdays),
    }
}

fn occurrence_info_label(alarm: &Alarm) -> &'static str {
    match alarm.occurrence.to_lowercase().as_str() {
        "once" | "yearly" => "DATE",
        _ => "WEEKDAYS",
    }
}

fn alarm_card<'a>(alarm: &'a Alarm, all_devices: &'a [Device], clock24: bool) -> Element<'a, Message> {
    let occ_label = format!("{}: ", capitalize(&alarm.occurrence));
    let inactive_note = if !alarm.active {
        " (inactive)".to_string()
    } else {
        String::new()
    };

    let header = row![
        text(occ_label).size(13).color(COLORS.text_secondary),
        text(alarm.label.clone()).size(13).color(COLORS.text),
        text(inactive_note).size(12).color(COLORS.text_secondary),
    ]
    .spacing(0);

    let time_col = column![
        text(format_time(&alarm.time, clock24)).size(28).color(COLORS.text),
    ]
    .align_x(iced::Alignment::Center);

    let dev_names = device_names(&alarm.devices, all_devices);
    let devices_col = column![
        text("DEVICES").size(11).color(COLORS.text_secondary),
        text(dev_names).size(13).color(COLORS.text),
    ]
    .spacing(2);

    let occ_col = column![
        text(occurrence_info_label(alarm)).size(11).color(COLORS.text_secondary),
        text(occurrence_info(alarm)).size(13).color(COLORS.text),
    ]
    .spacing(2);

    let middle = row![time_col, devices_col, occ_col]
        .spacing(20)
        .align_y(iced::Alignment::Center);

    let edit_btn = button(
        row![
            icon_svg(Icon::Pencil, COLORS.text, 13.0),
            text("Edit").size(12),
        ]
        .spacing(4)
        .align_y(iced::Alignment::Center),
    )
    .on_press(Message::EditAlarm(alarm.id.clone()))
    .style(secondary_button());

    let active_toggle = column![
        text("ACTIVE").size(10).color(COLORS.text_secondary),
        toggler(alarm.active)
            .on_toggle(|_| Message::ToggleAlarmActive(alarm.id.clone())),
    ]
    .spacing(2)
    .align_x(iced::Alignment::Center);

    let delete_btn = button(
        row![
            icon_svg(Icon::Trash2, COLORS.danger, 13.0),
            text("Delete").size(12),
        ]
        .spacing(4)
        .align_y(iced::Alignment::Center),
    )
    .on_press(Message::DeleteAlarm(alarm.id.clone()))
    .style(danger_button());

    let actions = row![edit_btn, active_toggle, delete_btn]
        .spacing(12)
        .align_y(iced::Alignment::Center);

    let card_col = column![header, middle, actions].spacing(6).padding(12);

    container(card_col)
        .width(Length::Fill)
        .style(card_container_style())
        .into()
}

pub fn alarms_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = Svg::new(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(48.0))
        .height(Length::Fixed(48.0));

    let header = row![logo, text("Alarms").size(20).color(COLORS.text)]
        .spacing(10)
        .align_y(iced::Alignment::Center)
        .padding([10, 16]);

    let alarms_list: Element<Message> = if state.alarms.is_empty() {
        container(
            text("No alarms yet.")
                .size(14)
                .color(COLORS.text_secondary),
        )
        .padding([24, 16])
        .into()
    } else {
        let mut col = Column::new();
        let clock24 = state.settings.clock24;
        for alarm in &state.alarms {
            col = col.push(alarm_card(alarm, &state.devices, clock24));
        }
        col.spacing(8).padding(iced::Padding { top: 0.0, right: 16.0, bottom: 16.0, left: 16.0 }).into()
    };

    let list_area = scrollable(
        column![alarms_list].width(Length::Fill),
    )
    .height(Length::Fill);

    // FAB — round "+" button, bottom-right corner
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

    let fab_overlay = container(
        container(fab).padding(iced::Padding { top: 0.0, right: 20.0, bottom: 24.0, left: 0.0 }),
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .align_right(Length::Fill)
    .align_bottom(Length::Fill);

    let main_stack = stack([
        column![header, list_area].into(),
        fab_overlay.into(),
    ]);

    container(main_stack)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(flat_container_style())
        .into()
}

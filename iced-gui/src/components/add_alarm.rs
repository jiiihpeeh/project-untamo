use crate::messages::Message;
use crate::state::AddAlarmState;
use crate::theme::{
    card_container_style, danger_button, primary_button, secondary_button, text_input_style, COLORS,
};
use iced::{
    widget::{button, column, container, row, slider, text, text_input},
    Element, Length,
};

pub fn add_alarm_dialog<'a>(state: &'a AddAlarmState) -> Element<'a, Message> {
    let title = text("Add Alarm").size(24).color(COLORS.text);

    let label_input = text_input("Alarm label", &state.label)
        .on_input(Message::SetAlarmLabel)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let time_display = text(format!("{:02}:{:02}", state.time_hour, state.time_minute))
        .size(48)
        .color(COLORS.primary);

    let hour_slider = slider(0.0..=23.0, state.time_hour as f32, |v| {
        Message::SetAlarmHour(v as u8)
    })
    .width(Length::Fixed(250.0));

    let minute_slider = slider(0.0..=59.0, state.time_minute as f32, |v| {
        Message::SetAlarmMinute(v as u8)
    })
    .width(Length::Fixed(250.0));

    let weekdays_label = text("Repeat:").size(14).color(COLORS.text);

    let weekday_btn_style = |active: bool| {
        if active {
            primary_button()
        } else {
            secondary_button()
        }
    };

    let mon_active = (state.weekdays & 1) != 0;
    let tue_active = (state.weekdays & 2) != 0;
    let wed_active = (state.weekdays & 4) != 0;
    let thu_active = (state.weekdays & 8) != 0;
    let fri_active = (state.weekdays & 16) != 0;
    let sat_active = (state.weekdays & 32) != 0;
    let sun_active = (state.weekdays & 64) != 0;

    let mon_btn = button(text("Mon"))
        .on_press(Message::SetAlarmWeekday(1))
        .style(weekday_btn_style(mon_active));
    let tue_btn = button(text("Tue"))
        .on_press(Message::SetAlarmWeekday(2))
        .style(weekday_btn_style(tue_active));
    let wed_btn = button(text("Wed"))
        .on_press(Message::SetAlarmWeekday(4))
        .style(weekday_btn_style(wed_active));
    let thu_btn = button(text("Thu"))
        .on_press(Message::SetAlarmWeekday(8))
        .style(weekday_btn_style(thu_active));
    let fri_btn = button(text("Fri"))
        .on_press(Message::SetAlarmWeekday(16))
        .style(weekday_btn_style(fri_active));
    let sat_btn = button(text("Sat"))
        .on_press(Message::SetAlarmWeekday(32))
        .style(weekday_btn_style(sat_active));
    let sun_btn = button(text("Sun"))
        .on_press(Message::SetAlarmWeekday(64))
        .style(weekday_btn_style(sun_active));

    let submit_btn = button(text("Add Alarm"))
        .on_press(Message::SubmitAddAlarm)
        .style(primary_button());

    let cancel_btn = button(text("Cancel"))
        .on_press(Message::CancelAddAlarm)
        .style(danger_button());

    let content = column![
        title,
        text("").size(16),
        time_display,
        text("").size(12),
        hour_slider,
        text(format!("Hour: {}", state.time_hour))
            .size(12)
            .color(COLORS.text_secondary),
        text("").size(8),
        minute_slider,
        text(format!("Minute: {:02}", state.time_minute))
            .size(12)
            .color(COLORS.text_secondary),
        text("").size(16),
        weekdays_label,
        text("").size(8),
        row![mon_btn, tue_btn, wed_btn, thu_btn, fri_btn, sat_btn, sun_btn].spacing(6),
        text("").size(8),
        label_input,
        text("").size(24),
        row![submit_btn, cancel_btn].spacing(12),
    ]
    .spacing(4)
    .padding(24)
    .align_x(iced::Alignment::Center);

    container(content)
        .max_width(400)
        .padding(20)
        .style(card_container_style())
        .into()
}

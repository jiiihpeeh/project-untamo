use crate::messages::Message;
use crate::state::AddAlarmState;
use crate::theme::{
    card_container_style, danger_button, primary_button, secondary_button, text_input_style, COLORS,
};
use iced::widget::{button, column, container, row, text, text_input};
use iced::Element;
use iced_aw::helpers::{date_picker, time_picker};

pub fn add_alarm_dialog<'a>(state: &'a AddAlarmState) -> Element<'a, Message> {
    let is_editing = state.editing_alarm_id.is_some();
    let title_text = if is_editing {
        "Edit Alarm"
    } else {
        "Add Alarm"
    };
    let title = text(title_text).size(24).color(COLORS.text);
    let submit_text = if is_editing {
        "Save Changes"
    } else {
        "Add Alarm"
    };

    let label_input = text_input("Alarm label", &state.label)
        .on_input(Message::SetAlarmLabel)
        .padding(10)
        .width(iced::Length::Fixed(250.0))
        .style(text_input_style());

    let time_display = text(format!("{:02}:{:02}", state.time_hour, state.time_minute))
        .size(48)
        .color(COLORS.primary);

    let time_btn = button(text("Set Time"))
        .on_press(Message::OpenTimePicker)
        .style(primary_button());

    let time_picker_overlay = time_picker(
        state.show_time_picker,
        state.time_picker_value,
        time_btn,
        Message::CancelTimePicker,
        |t| Message::SubmitTimePicker(t),
    );

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

    let date_btn = button(text("Set Date"))
        .on_press(Message::OpenDatePicker)
        .style(secondary_button());

    let date_picker_overlay = date_picker(
        state.show_date_picker,
        state.date_picker_value,
        date_btn,
        Message::CancelDatePicker,
        |d| Message::SubmitDatePicker(d),
    );

    let submit_btn = button(text(submit_text))
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
        time_picker_overlay,
        text("").size(16),
        weekdays_label,
        text("").size(8),
        row![mon_btn, tue_btn, wed_btn, thu_btn, fri_btn, sat_btn, sun_btn].spacing(6),
        text("").size(8),
        date_picker_overlay,
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

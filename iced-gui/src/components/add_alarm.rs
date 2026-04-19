use crate::components::icons::{icon_svg, Icon};
use crate::messages::Message;
use crate::state::{AddAlarmState, AlarmOccurrence, Device};
use crate::theme::{
    card_container_style_colored, danger_button, menu_style, pick_list_style, primary_button,
    secondary_button, text_input_style, COLORS,
};
use iced::widget::{
    button, checkbox, column, container, pick_list, row, scrollable, text, text_input, toggler,
};
use iced::Element;
use iced_aw::helpers::{date_picker, time_picker};

pub fn add_alarm_dialog<'a>(
    state: &'a AddAlarmState,
    devices: &'a [Device],
    available_tunes: &'a [String],
    clock24: bool,
    bg: iced::Color,
) -> Element<'a, Message> {
    let is_editing = state.editing_alarm_id.is_some();
    let title_text = if is_editing {
        "Edit Alarm"
    } else {
        "Add Alarm"
    };
    let submit_text = if is_editing {
        "Save Changes"
    } else {
        "Add Alarm"
    };

    let title = text(title_text).size(20).color(COLORS.text);

    // --- Time ---
    let time_display = text(format!("{:02}:{:02}", state.time_hour, state.time_minute))
        .size(48)
        .color(COLORS.primary);

    let time_btn = button(text("Set Time"))
        .on_press(Message::OpenTimePicker)
        .style(secondary_button());

    let tp = iced_aw::TimePicker::new(
        state.show_time_picker,
        state.time_picker_value,
        time_btn,
        Message::CancelTimePicker,
        Message::SubmitTimePicker,
    );
    let time_picker_overlay = if clock24 { tp.use_24h() } else { tp };

    // --- Occurrence ---
    let occ_label = text("Type:").size(13).color(COLORS.text);
    let occ_btn = |occ: AlarmOccurrence| {
        let label = format!("{}", occ);
        let active = state.occurrence == occ;
        button(text(label))
            .on_press(Message::SetAlarmOccurrence(occ))
            .style(if active {
                primary_button()
            } else {
                secondary_button()
            })
    };
    let occ_row = row![
        occ_btn(AlarmOccurrence::Once),
        occ_btn(AlarmOccurrence::Daily),
        occ_btn(AlarmOccurrence::Weekly),
        occ_btn(AlarmOccurrence::Yearly),
    ]
    .spacing(6);

    // --- Weekdays (Weekly only) ---
    let weekday_btn_style = |active: bool| {
        if active {
            primary_button()
        } else {
            secondary_button()
        }
    };

    // Front uses 0-indexed bits: Mon=bit0, Tue=bit1, ..., Sun=bit6
    let weekdays_row = {
        let days: &[(&str, u8)] = &[
            ("Mon", 0),
            ("Tue", 1),
            ("Wed", 2),
            ("Thu", 3),
            ("Fri", 4),
            ("Sat", 5),
            ("Sun", 6),
        ];
        let mut r = row![].spacing(4);
        for (label, bit) in days {
            let mask = 1u8 << bit;
            let active = (state.weekdays & mask) != 0;
            r = r.push(
                button(text(*label))
                    .on_press(Message::SetAlarmWeekday(mask))
                    .style(weekday_btn_style(active))
                    .width(iced::Length::Fixed(46.0)),
            );
        }
        r
    };

    // --- Date (Once / Yearly) ---
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

    let date_display = {
        let d = state.date_picker_value;
        text(format!("{:04}-{:02}-{:02}", d.year, d.month, d.day))
            .size(14)
            .color(COLORS.text)
    };

    // --- Label ---
    let label_input = text_input("Alarm label", &state.label)
        .on_input(Message::SetAlarmLabel)
        .padding(10)
        .width(iced::Length::Fill)
        .style(text_input_style());

    // --- Devices ---
    let devices_label = text("Devices:").size(13).color(COLORS.text);
    let device_list: Element<'a, Message> = if devices.is_empty() {
        text("No devices").size(13).color(COLORS.text).into()
    } else {
        let mut col = column![].spacing(4);
        for device in devices {
            let checked = state.devices.contains(&device.id);
            let id = device.id.clone();
            let label = format!("{} ({})", device.device_name, device.device_type);
            col = col.push(
                checkbox(checked)
                    .label(label)
                    .on_toggle(move |_| Message::ToggleAlarmDevice(id.clone()))
                    .size(16),
            );
        }
        scrollable(col).height(iced::Length::Fixed(80.0)).into()
    };

    // --- Tune ---
    let tune_label = text("Tune:").size(13).color(COLORS.text);
    let tune_selected = Some(state.tune.clone());
    let tune_picker = pick_list(available_tunes, tune_selected, Message::SetAlarmTune)
        .width(iced::Length::Fill)
        .placeholder("Select tune")
        .style(pick_list_style())
        .menu_style(menu_style());

    let is_previewing = state.previewing_tune.is_some();
    let preview_btn = button(icon_svg(
        if is_previewing {
            Icon::Square
        } else {
            Icon::Play
        },
        if is_previewing {
            COLORS.danger
        } else {
            COLORS.primary
        },
        16.0,
    ))
    .on_press(if is_previewing {
        Message::StopPreviewTune
    } else {
        Message::PreviewTune(state.tune.clone())
    })
    .style(secondary_button());

    let tune_row: Element<'a, Message> = row![tune_picker, preview_btn]
        .spacing(6)
        .align_y(iced::Alignment::Center)
        .into();

    // --- Toggles ---
    let active_toggler = toggler(state.active)
        .label("Active")
        .on_toggle(Message::SetAlarmActive);

    let close_task_toggler = toggler(state.close_task)
        .label("Closing Task")
        .on_toggle(Message::SetAlarmCloseTask);

    let toggles_row = row![active_toggler, close_task_toggler]
        .spacing(24)
        .align_y(iced::Alignment::Center);

    // --- Buttons ---
    let submit_btn = button(text(submit_text))
        .on_press(Message::SubmitAddAlarm)
        .style(primary_button());

    let cancel_btn = button(text("Cancel"))
        .on_press(Message::CancelAddAlarm)
        .style(danger_button());

    // --- Assemble content based on occurrence ---
    let mut content = column![
        title,
        row![time_display, text("  "), time_picker_overlay].align_y(iced::Alignment::Center),
        occ_label,
        occ_row,
    ]
    .spacing(8)
    .padding(20)
    .align_x(iced::Alignment::Start);

    if state.occurrence.shows_weekdays() {
        content = content.push(weekdays_row);
    }

    if state.occurrence.shows_date() {
        content = content.push(
            row![date_display, text("  "), date_picker_overlay]
                .spacing(8)
                .align_y(iced::Alignment::Center),
        );
    }

    content = content
        .push(label_input)
        .push(devices_label)
        .push(device_list)
        .push(tune_label)
        .push(tune_row)
        .push(toggles_row)
        .push(row![submit_btn, cancel_btn].spacing(12));

    container(content)
        .max_width(560)
        .padding(8)
        .style(card_container_style_colored(bg))
        .into()
}

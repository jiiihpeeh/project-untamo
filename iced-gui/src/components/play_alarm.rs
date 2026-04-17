use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style, danger_button, primary_button, COLORS};
use iced::{
    widget::{button, column, container, text},
    Element, Length,
};

pub fn play_alarm_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let alarm = state.playing_alarm.as_ref();

    let label = alarm
        .map(|a| a.label.clone())
        .unwrap_or_else(|| "Alarm".to_string());
    let time_str = alarm
        .map(|a| {
            let hour = a.time.get(0).copied().unwrap_or(8);
            let minute = a.time.get(1).copied().unwrap_or(0);
            if state.settings.clock24 {
                format!("{:02}:{:02}", hour, minute)
            } else {
                let is_pm = hour >= 12;
                let display_hour = if hour == 0 {
                    12
                } else if hour > 12 {
                    hour - 12
                } else {
                    hour
                };
                format!(
                    "{:02}:{:02} {}",
                    display_hour,
                    minute,
                    if is_pm { "PM" } else { "AM" }
                )
            }
        })
        .unwrap_or_else(|| "08:00".to_string());

    let title = text(format!("{}", label)).size(32).color(COLORS.text);
    let subtitle = text(format!("({})", time_str))
        .size(20)
        .color(COLORS.text_secondary);

    let clock_text = text("ALARM").size(48).color(COLORS.danger);
    let snooze_text = text("Hold to Snooze").size(14).color(COLORS.text);

    let snooze_btn = button(
        column![clock_text, snooze_text]
            .spacing(5)
            .align_x(iced::Alignment::Center),
    )
    .width(Length::Fixed(200.0))
    .height(Length::Fixed(200.0))
    .on_press(Message::SnoozeAlarm)
    .style(primary_button());

    let turn_off_label = if state.turn_off {
        "Turn OFF (On)"
    } else {
        "Turn OFF (Off)"
    };
    let turn_off_btn = button(text(turn_off_label))
        .on_press(Message::SetTurnOff(!state.turn_off))
        .style(primary_button());

    let dismiss_btn = button(text("Dismiss"))
        .on_press(Message::DismissAlarm)
        .style(danger_button());

    let content = column![
        title,
        subtitle,
        text("").size(20),
        snooze_btn,
        text("").size(20),
        turn_off_btn,
        text("").size(12),
        dismiss_btn,
    ]
    .spacing(10)
    .padding(30)
    .align_x(iced::Alignment::Center);

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(card_container_style())
        .into()
}

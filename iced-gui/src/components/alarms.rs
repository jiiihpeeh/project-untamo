use crate::messages::Message;
use crate::state::{Alarm, AppState};
use crate::theme::{
    card_container_style, flat_container_style, primary_button, secondary_button, COLORS,
};
use iced::widget::svg::{Handle, Svg};
use iced::{
    widget::{button, container, row, text, Column},
    Element, Length,
};

fn format_time(time: &[u8]) -> String {
    if time.len() >= 2 {
        format!("{:02}:{:02}", time[0], time[1])
    } else {
        "00:00".to_string()
    }
}

fn alarm_card<'a>(alarm: &'a Alarm) -> Element<'a, Message> {
    let toggle_text = if alarm.active { "ON" } else { "OFF" };
    let toggle_btn = button(text(toggle_text))
        .on_press(Message::ToggleAlarmActive(alarm.id.clone()))
        .style(if alarm.active {
            primary_button()
        } else {
            secondary_button()
        });

    let header = row![
        text(format!("{}: {}", alarm.occurrence, alarm.label))
            .size(14)
            .color(COLORS.text),
        if !alarm.active {
            text(" (inactive)").size(12).color(COLORS.text_secondary)
        } else {
            text("")
        },
    ];

    let time_display = text(format_time(&alarm.time)).size(24).color(COLORS.text);

    let edit_btn = button(text("Edit"))
        .on_press(Message::EditAlarm(alarm.id.clone()))
        .style(secondary_button());

    let delete_btn = button(text("Delete"))
        .on_press(Message::DeleteAlarm(alarm.id.clone()))
        .style(secondary_button());

    let inner_col = Column::with_children([
        row![toggle_btn, header].into(),
        row![
            time_display,
            iced::widget::Space::new(),
            edit_btn,
            delete_btn,
        ]
        .spacing(10)
        .into(),
    ])
    .spacing(8);

    container(inner_col.padding(12))
        .max_width(500)
        .padding(10)
        .style(card_container_style())
        .into()
}

pub fn alarms_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = Svg::new(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(60.0))
        .height(Length::Fixed(60.0));

    let title = text("Alarms").size(20).color(COLORS.text);

    let add_alarm_btn = button(text("+ Add Alarm"))
        .on_press(Message::ToggleAddAlarm)
        .style(primary_button());

    let alarms_list: Element<Message> = if state.alarms.is_empty() {
        text("No alarms yet. Add your first alarm!")
            .size(14)
            .color(COLORS.text_secondary)
            .into()
    } else {
        let cards: Vec<Element<Message>> = state.alarms.iter().map(|a| alarm_card(a)).collect();

        let mut col = Column::new();
        for card in cards {
            col = col.push(card);
        }
        col.spacing(10).into()
    };

    let content = Column::with_children([
        logo.into(),
        title.into(),
        add_alarm_btn.into(),
        text("").size(8).into(),
        alarms_list,
    ])
    .spacing(10)
    .padding(15);

    container(content.align_x(iced::Alignment::Center))
        .width(Length::Fill)
        .height(Length::Fill)
        .style(flat_container_style())
        .into()
}

use crate::messages::Message;
use crate::state::Notification;
use crate::theme::{card_container_style, danger_button, COLORS};
use iced::{
    widget::{button, container, row, text, Column, Space},
    Element, Length,
};

pub fn notifications_view<'a>(notifications: &'a [Notification]) -> Element<'a, Message> {
    if notifications.is_empty() {
        return container(text(""))
            .width(Length::Fill)
            .height(Length::Fixed(0.0))
            .into();
    }

    let items: Vec<Element<Message>> = notifications
        .iter()
        .enumerate()
        .map(|(i, n)| {
            let title_text = text(&n.title).size(14).color(COLORS.text);
            let msg_text = text(&n.message).size(12).color(COLORS.text_secondary);
            let dismiss_btn = button(text("x"))
                .on_press(Message::DismissNotification(i))
                .style(danger_button());

            container(
                Column::with_children([
                    row![title_text, Space::new(), dismiss_btn].into(),
                    msg_text.into(),
                ])
                .spacing(4)
                .padding(10),
            )
            .style(card_container_style())
            .into()
        })
        .collect();

    container(make_column(items).spacing(5).padding(10))
        .width(Length::Fixed(300.0))
        .style(card_container_style())
        .into()
}

fn make_column<'a>(children: Vec<Element<'a, Message>>) -> Column<'a, Message> {
    let mut col = Column::new();
    for child in children {
        col = col.push(child);
    }
    col
}

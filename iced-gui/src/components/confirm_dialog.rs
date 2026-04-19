use crate::messages::Message;
use crate::state::PendingDelete;
use crate::theme::{card_container_style_colored, danger_button, secondary_button, COLORS};
use iced::{
    widget::{button, column, container, row, text},
    Element, Length,
};

pub fn confirm_dialog<'a>(pending: &'a PendingDelete, bg: iced::Color) -> Element<'a, Message> {
    let (title, body) = match pending {
        PendingDelete::Alarm(_) => (
            "Delete Alarm",
            "Are you sure you want to delete this alarm? This action cannot be undone.",
        ),
        PendingDelete::Device(_) => (
            "Delete Device",
            "Are you sure you want to delete this device? This action cannot be undone.",
        ),
    };

    let header = row![
        text(title).size(20).color(COLORS.text).width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::CancelDelete)
            .style(secondary_button()),
    ]
    .align_y(iced::Alignment::Center)
    .spacing(8);

    let body_text = text(body).size(14).color(COLORS.text_secondary);

    let actions = row![
        button(text("Cancel").size(14))
            .on_press(Message::CancelDelete)
            .style(secondary_button()),
        button(text("Delete").size(14))
            .on_press(Message::ConfirmDelete)
            .style(danger_button()),
    ]
    .spacing(8);

    let card = column![header, body_text, actions]
        .spacing(20)
        .padding(24)
        .width(Length::Fixed(360.0));

    container(card).style(card_container_style_colored(bg)).into()
}

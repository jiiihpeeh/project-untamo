use crate::messages::Message;
use crate::theme::{card_container_style_colored, primary_button, COLORS};
use iced::{
    widget::{button, column, container, text},
    Element, Length,
};

pub fn about_view<'a>(bg: iced::Color) -> Element<'a, Message> {
    let title = text("About Untamo").size(20).color(COLORS.text);

    let description = text("This project aims to implement a cross device alarm clock with synchronization capabilities.")
        .size(14)
        .color(COLORS.text)
        .width(Length::Fixed(280.0));

    let card = column![
        title,
        description,
        button(text("OK").size(14))
            .on_press(Message::ToggleAbout)
            .style(primary_button()),
    ]
    .spacing(16)
    .padding(24)
    .width(Length::Fixed(320.0));

    container(card)
        .style(card_container_style_colored(bg))
        .into()
}

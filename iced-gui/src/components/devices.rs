use crate::messages::Message;
use crate::state::{AppState, Device};
use crate::theme::{
    card_container_style, flat_container_style, primary_button, secondary_button, COLORS,
};
use iced::{
    widget::{button, container, row, text, Column},
    Element, Length,
};

fn device_card<'a>(device: &'a Device) -> Element<'a, Message> {
    let device_info = row![
        text(&device.device_name).size(16).color(COLORS.text),
        text(format!(" ({})", device.device_type))
            .size(12)
            .color(COLORS.text_secondary),
    ];

    let edit_btn = button(text("Edit"))
        .on_press(Message::EditDevice(device.id.clone()))
        .style(secondary_button());

    let delete_btn = button(text("Delete"))
        .on_press(Message::DeleteDevice(device.id.clone()))
        .style(secondary_button());

    let inner_col = Column::with_children([
        device_info.into(),
        row![edit_btn, delete_btn].spacing(10).into(),
    ])
    .spacing(8);

    container(inner_col.padding(12))
        .max_width(500)
        .padding(10)
        .style(card_container_style())
        .into()
}

pub fn devices_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = iced::widget::svg::Svg::new(iced::widget::svg::Handle::from_memory(include_bytes!(
        "../assets/logo.svg"
    )))
    .width(Length::Fixed(60.0))
    .height(Length::Fixed(60.0));

    let title = text("Devices").size(20).color(COLORS.text);

    let add_device_btn = button(text("+ Add Device"))
        .on_press(Message::AddDevice)
        .style(primary_button());

    let devices_list: Element<Message> = if state.devices.is_empty() {
        text("No devices registered. Add your first device!")
            .size(14)
            .color(COLORS.text_secondary)
            .into()
    } else {
        let cards: Vec<Element<Message>> = state.devices.iter().map(|d| device_card(d)).collect();

        let mut col = Column::new();
        for card in cards {
            col = col.push(card);
        }
        col.spacing(10).into()
    };

    let content = Column::with_children([
        logo.into(),
        title.into(),
        add_device_btn.into(),
        text("").size(8).into(),
        devices_list,
    ])
    .spacing(10)
    .padding(15);

    container(content.align_x(iced::Alignment::Center))
        .width(Length::Fill)
        .height(Length::Fill)
        .style(flat_container_style())
        .into()
}

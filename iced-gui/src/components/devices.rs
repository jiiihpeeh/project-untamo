use crate::components::icons::{icon_svg, Icon};
use crate::messages::Message;
use crate::state::{AppState, Device, DeviceType};
use crate::theme::{
    card_container_style, flat_container_style, menu_style, pick_list_style, primary_button,
    secondary_button, text_input_style, COLORS,
};
use iced::{
    widget::{button, container, pick_list, row, text, text_input, Column},
    Alignment, Element, Length,
};

#[derive(Clone)]
pub struct EditDeviceState {
    pub device_name: String,
    pub device_type: String,
}

impl Default for EditDeviceState {
    fn default() -> Self {
        Self {
            device_name: String::new(),
            device_type: String::new(),
        }
    }
}

fn device_card<'a>(device: &'a Device) -> Element<'a, Message> {
    let device_info = row![
        text(&device.device_name).size(16).color(COLORS.text),
        text(format!(" ({})", device.device_type))
            .size(12)
            .color(COLORS.text_secondary),
    ];

    let edit_btn = button(
        row![icon_svg(Icon::Pencil, COLORS.text, 14.0), text("Edit")]
            .spacing(4)
            .align_y(iced::Alignment::Center),
    )
    .on_press(Message::EditDevice(device.id.clone()))
    .style(secondary_button());

    let delete_btn = button(
        row![icon_svg(Icon::Trash2, COLORS.danger, 14.0), text("Delete")]
            .spacing(4)
            .align_y(iced::Alignment::Center),
    )
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

pub fn edit_device_dialog<'a>(
    device_id: &str,
    name: &str,
    device_type: &DeviceType,
) -> Element<'a, Message> {
    let title = text("Edit Device").size(20).color(COLORS.text);

    let name_input = text_input("Device Name", name)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style())
        .on_input(Message::SetEditingDeviceName);

    let device_types = vec![
        DeviceType::Browser,
        DeviceType::Tablet,
        DeviceType::Phone,
        DeviceType::Desktop,
        DeviceType::IoT,
        DeviceType::Other,
    ];

    let type_picker = pick_list(
        device_types,
        Some(device_type.clone()),
        Message::SetEditingDeviceType,
    )
    .width(Length::Fixed(300.0))
    .style(pick_list_style())
    .menu_style(menu_style());

    let buttons = row![
        button(text("Save"))
            .on_press(Message::SaveDeviceEdit)
            .style(primary_button()),
        button(text("Cancel"))
            .on_press(Message::CloseDeviceEdit)
            .style(secondary_button()),
    ]
    .spacing(10);

    let content = Column::with_children([
        title.into(),
        text("").size(8).into(),
        text("Name").size(12).color(COLORS.text_secondary).into(),
        name_input.into(),
        text("").size(4).into(),
        text("Type").size(12).color(COLORS.text_secondary).into(),
        type_picker.into(),
        text("").size(16).into(),
        buttons.into(),
    ])
    .spacing(10)
    .padding(20);

    container(content)
        .width(Length::Fixed(350.0))
        .style(flat_container_style())
        .into()
}

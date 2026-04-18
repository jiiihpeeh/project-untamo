use crate::components::icons::{icon_svg, Icon};
use crate::messages::Message;
use crate::state::{AppState, DeviceSelect, DeviceType};
use crate::theme::{
    card_container_style, danger_button, flat_container_style, menu_style, pick_list_style,
    primary_button, secondary_button, text_input_style, COLORS,
};
use iced::{
    widget::{
        button, checkbox, column, container, radio, row, scrollable, text, text_input, Column,
    },
    Alignment, Color, Element, Length,
};

// ── table header ─────────────────────────────────────────────────────────────

fn header_cell(label: &'static str, width: Length) -> Element<'static, Message> {
    container(text(label).size(11).color(COLORS.text_secondary))
        .width(width)
        .center_x(width)
        .into()
}

fn device_type_icon(typ: &str) -> Icon {
    match typ {
        "Phone" => Icon::Smartphone,
        "Tablet" => Icon::Tablet,
        "Browser" => Icon::Globe,
        "Desktop" => Icon::Monitor,
        "IoT" => Icon::Cpu,
        _ => Icon::LayoutGrid,
    }
}

// ── one device row ────────────────────────────────────────────────────────────

fn device_row<'a>(
    device: &'a crate::state::Device,
    idx: usize,
    is_viewable: bool,
    selected_idx: Option<usize>,
) -> Element<'a, Message> {
    let icon = device_type_icon(&device.device_type);
    let name_col = container(
        row![
            icon_svg(icon, COLORS.text_secondary, 14.0),
            text(&device.device_name)
                .size(13)
                .color(COLORS.text)
                .width(Length::Fill),
        ]
        .spacing(6)
        .align_y(Alignment::Center),
    )
    .width(Length::Fill);

    let id = device.id.clone();
    let show_col = container(
        checkbox(is_viewable).on_toggle(move |_| Message::ToggleViewableDevice(id.clone())),
    )
    .width(Length::Fixed(52.0))
    .center_x(Length::Fixed(52.0));

    let id2 = device.id.clone();
    let name2 = device.device_name.clone();
    let typ2 = device.device_type.clone();
    let opt_col = container(radio("", idx, selected_idx, move |_| {
        Message::SelectWelcomeDevice(DeviceSelect::Device(crate::state::Device {
            id: id2.clone(),
            device_name: name2.clone(),
            device_type: typ2.clone(),
        }))
    }))
    .width(Length::Fixed(44.0))
    .center_x(Length::Fixed(44.0));

    let edit_btn = container(
        button(icon_svg(Icon::Pencil, COLORS.text, 13.0))
            .on_press(Message::EditDevice(device.id.clone()))
            .style(secondary_button()),
    )
    .width(Length::Fixed(44.0))
    .center_x(Length::Fixed(44.0));

    let delete_btn = container(
        button(icon_svg(Icon::Trash2, COLORS.danger, 13.0))
            .on_press(Message::DeleteDevice(device.id.clone()))
            .style(danger_button()),
    )
    .width(Length::Fixed(44.0))
    .center_x(Length::Fixed(44.0));

    row![name_col, show_col, opt_col, edit_btn, delete_btn]
        .align_y(Alignment::Center)
        .padding([6, 0])
        .into()
}

// ── main view ─────────────────────────────────────────────────────────────────

pub fn devices_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let header_row = row![
        header_cell("DEVICE", Length::Fill),
        header_cell("SHOW", Length::Fixed(52.0)),
        header_cell("OPT", Length::Fixed(44.0)),
        header_cell("EDIT", Length::Fixed(44.0)),
        header_cell("DEL", Length::Fixed(44.0)),
    ]
    .align_y(Alignment::Center);

    let current_id = state.saved_device_id.as_deref().unwrap_or("");
    let selected_idx = state.devices.iter().position(|d| d.id == current_id);

    let rows: Vec<Element<Message>> = state
        .devices
        .iter()
        .enumerate()
        .map(|(idx, d)| {
            let viewable = state.viewable_devices.contains(&d.id);
            device_row(d, idx, viewable, selected_idx)
        })
        .collect();

    let body: Element<Message> = if rows.is_empty() {
        text("No devices yet.")
            .size(13)
            .color(COLORS.text_secondary)
            .into()
    } else {
        let mut col = Column::new().spacing(0);
        for r in rows {
            col = col.push(r);
        }
        scrollable(col).height(Length::Shrink).into()
    };

    let title_row = row![
        text("Device Options")
            .size(18)
            .color(COLORS.text)
            .width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::ToggleDevicesModal)
            .style(secondary_button()),
    ]
    .align_y(Alignment::Center)
    .spacing(8);

    let bottom_btns = column![button(text("Add a device").size(13).width(Length::Fill))
        .on_press(Message::AddDevice)
        .width(Length::Fill)
        .style(secondary_button()),]
    .spacing(8);

    let card = Column::with_children([
        title_row.into(),
        text("").size(6).into(),
        header_row.into(),
        body,
        text("").size(6).into(),
        bottom_btns.into(),
    ])
    .spacing(4)
    .padding(20)
    .width(Length::Fixed(460.0));

    container(card).style(card_container_style()).into()
}

// ── add / edit dialog ─────────────────────────────────────────────────────────

pub fn edit_device_dialog<'a>(
    is_add: bool,
    _device_id: &str,
    name: &str,
    device_type: &DeviceType,
) -> Element<'a, Message> {
    let title_str = if is_add { "Add Device" } else { "Edit Device" };
    let title = text(title_str).size(18).color(COLORS.text);

    let name_input = text_input("Device name", name)
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

    let type_picker = iced::widget::pick_list(
        device_types,
        Some(device_type.clone()),
        Message::SetEditingDeviceType,
    )
    .width(Length::Fixed(300.0))
    .style(pick_list_style())
    .menu_style(menu_style());

    let save_label = if is_add { "Add" } else { "Save" };
    let can_save = !name.is_empty();

    let mut save_btn = button(text(save_label)).style(primary_button());
    if can_save {
        save_btn = save_btn.on_press(Message::SaveDeviceEdit);
    }

    let buttons = row![
        save_btn,
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
        text("").size(12).into(),
        buttons.into(),
    ])
    .spacing(6)
    .padding(20);

    container(content)
        .width(Length::Fixed(350.0))
        .style(flat_container_style())
        .into()
}

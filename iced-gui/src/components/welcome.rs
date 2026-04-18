use crate::messages::Message;
use crate::state::{AppPage, Device, DeviceSelect, LoginState, WelcomeState};
use crate::theme::{flat_container_style, menu_style, pick_list_style, secondary_button, COLORS};
use iced::widget::svg::{Handle, Svg};
use iced::{
    widget::{button, column, container, pick_list, radio, row, text},
    Element, Length,
};

pub fn welcome_view<'a>(
    login: &'a LoginState,
    welcome: &'a WelcomeState,
    devices: &'a [Device],
) -> Element<'a, Message> {
    let screen_name = login
        .user_info
        .as_ref()
        .map(|u| u.screen_name.clone())
        .unwrap_or_default();

    let greeting = if screen_name.is_empty() {
        text("Welcome!").size(24).color(COLORS.text)
    } else {
        text(format!("Welcome, {}!", screen_name))
            .size(24)
            .color(COLORS.text)
    };

    let logo = Svg::new(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(80.0))
        .height(Length::Fixed(80.0));

    let time_format_label = text("Time Format").size(16).color(COLORS.text);

    let clock24_option = row![
        radio("24 Hour", true, Some(welcome.clock24), |_| {
            Message::ToggleClock24
        }),
        radio("12 Hour", false, Some(welcome.clock24), |_| {
            Message::ToggleClock24
        }),
    ]
    .spacing(20);

    let device_section: Element<'a, Message> = if devices.is_empty() {
        column![
            text("Add your first device to get started")
                .size(14)
                .color(COLORS.text_secondary),
            button(text("Add Device"))
                .on_press(Message::NavigateTo(AppPage::Devices))
                .style(secondary_button()),
        ]
        .spacing(8)
        .into()
    } else {
        let device_options: Vec<DeviceSelect> = devices
            .iter()
            .map(|d| DeviceSelect::Device(d.clone()))
            .collect();

        let selected = match &welcome.selected_device {
            DeviceSelect::Device(d) => devices
                .iter()
                .find(|dev| dev.id == d.id)
                .map(|dev| DeviceSelect::Device(dev.clone())),
            DeviceSelect::None => None,
        };

        let device_dropdown = pick_list(device_options, selected, |selection: DeviceSelect| {
            Message::SelectWelcomeDevice(selection)
        })
        .width(Length::Fixed(200.0))
        .style(pick_list_style())
        .menu_style(menu_style());

        let edit_btn = if let DeviceSelect::Device(ref d) = welcome.selected_device {
            button(text("Edit Device"))
                .on_press(Message::EditDevice(d.id.clone()))
                .style(secondary_button())
        } else {
            button(text("Edit Device")).style(secondary_button())
        };

        column![
            text("Your Devices").size(14).color(COLORS.text),
            device_dropdown,
            edit_btn,
            button(text("Add Device"))
                .on_press(Message::NavigateTo(AppPage::Devices))
                .style(secondary_button()),
        ]
        .spacing(8)
        .into()
    };

    let content: Element<'a, Message> = column![
        logo,
        text("").size(8),
        greeting,
        text("").size(16),
        time_format_label,
        clock24_option,
        text("").size(16),
        device_section,
    ]
    .spacing(12)
    .padding(20)
    .align_x(iced::Alignment::Center)
    .into();

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(flat_container_style())
        .into()
}

use crate::messages::Message;
use crate::state::{AppPage, LoginState, WelcomeState};
use crate::theme::{flat_container_style, secondary_button, COLORS};
use iced::widget::svg::{Handle, Svg};
use iced::{
    widget::{button, column, container, radio, row, text},
    Element, Length,
};

pub fn welcome_view<'a>(login: &'a LoginState, welcome: &'a WelcomeState) -> Element<'a, Message> {
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

    let content = column![
        logo,
        text("").size(8),
        greeting,
        text("").size(16),
        time_format_label,
        clock24_option,
        text("").size(16),
        text("Add your first device to get started")
            .size(14)
            .color(COLORS.text_secondary),
        button(text("Add Device"))
            .on_press(Message::NavigateTo(AppPage::Alarms))
            .style(secondary_button()),
    ]
    .spacing(12)
    .padding(20)
    .align_x(iced::Alignment::Center);

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(flat_container_style())
        .into()
}

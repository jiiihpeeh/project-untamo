use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style, danger_button, primary_button, secondary_button, COLORS};
use iced::{
    widget::{button, column, container, row, text},
    Alignment, Element, Length,
};

pub fn user_menu_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = iced::widget::svg::Svg::new(iced::widget::svg::Handle::from_memory(include_bytes!(
        "../assets/logo.svg"
    )))
    .width(Length::Fixed(52.0))
    .height(Length::Fixed(52.0));

    let header = row![
        logo,
        text("Profile")
            .size(20)
            .color(COLORS.text)
            .width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::ToggleUserMenu)
            .padding([4, 8]),
    ]
    .align_y(Alignment::Center)
    .spacing(12);

    let user_info: Element<Message> = if let Some(ref user) = state.login.user_info {
        column![
            text(format!("{} {}", user.first_name, user.last_name))
                .size(16)
                .color(COLORS.text),
            text(format!("@{}", user.screen_name))
                .size(13)
                .color(COLORS.text_secondary),
            text(format!("{}", user.email))
                .size(13)
                .color(COLORS.text_secondary),
        ]
        .spacing(4)
        .into()
    } else {
        text("Not logged in")
            .size(14)
            .color(COLORS.text_secondary)
            .into()
    };

    let edit_profile = button(text("Edit Profile").size(14))
        .on_press(Message::ToggleEditProfile)
        .width(Length::Fill)
        .style(secondary_button());

    let logout = button(text("Log Out").size(14))
        .on_press(Message::GoToLogout)
        .width(Length::Fill)
        .style(danger_button());

    let refresh = button(text("Check & Refresh Session").size(14))
        .on_press(Message::RefreshSession)
        .width(Length::Fill)
        .style(secondary_button());

    let about = button(text("About Untamo").size(14))
        .on_press(Message::ToggleAbout)
        .width(Length::Fill)
        .style(primary_button());

    let actions: Element<Message> = if state
        .login
        .user_info
        .as_ref()
        .map(|u| u.admin)
        .unwrap_or(false)
    {
        let admin_btn = button(text("Admin Log In").size(14))
            .on_press(Message::ToggleDevicesModal)
            .width(Length::Fill)
            .style(secondary_button());

        column![edit_profile, admin_btn, logout, refresh, about]
            .spacing(8)
            .into()
    } else {
        column![edit_profile, logout, refresh, about]
            .spacing(8)
            .into()
    };

    let card = column![header, user_info, actions]
        .spacing(20)
        .padding(24)
        .width(Length::Fixed(280.0));

    container(card).style(card_container_style()).into()
}

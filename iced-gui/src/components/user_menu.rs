use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{danger_button, flat_container_style, secondary_button, COLORS};
use iced::{
    widget::{button, column, container, row, text},
    Alignment, Element, Length,
};

pub fn user_menu_view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logo = iced::widget::svg::Svg::new(iced::widget::svg::Handle::from_memory(include_bytes!(
        "../assets/logo.svg"
    )))
    .width(Length::Fixed(60.0))
    .height(Length::Fixed(60.0));

    let title = text("User").size(20).color(COLORS.text);

    let user_info: Element<Message> = if let Some(ref user) = state.login.user_info {
        let info_col = column![
            text(format!("Email: {}", user.email))
                .size(14)
                .color(COLORS.text),
            text(format!("Name: {} {}", user.first_name, user.last_name))
                .size(14)
                .color(COLORS.text),
            text(format!("Screen Name: {}", user.screen_name))
                .size(14)
                .color(COLORS.text),
            if user.admin {
                text("Admin").size(12).color(COLORS.primary)
            } else {
                text("").size(12)
            },
            if user.owner {
                text("Owner").size(12).color(COLORS.primary)
            } else {
                text("").size(12)
            },
        ]
        .spacing(8)
        .padding(10);
        info_col.into()
    } else {
        text("Not logged in")
            .size(14)
            .color(COLORS.text_secondary)
            .into()
    };

    let logout_btn = button(text("Logout"))
        .on_press(Message::GoToLogout)
        .style(danger_button());

    let edit_profile_btn = button(text("Edit Profile"))
        .on_press(Message::ToggleEditProfile)
        .style(secondary_button());

    let back_btn = button(text("Back to Alarms"))
        .on_press(Message::NavigateTo(crate::state::AppPage::Alarms))
        .style(secondary_button());

    container(
        column![
            logo,
            text("").size(8),
            title,
            text("").size(10),
            user_info,
            text("").size(20),
            edit_profile_btn,
            text("").size(10),
            row![logout_btn, back_btn].spacing(10),
        ]
        .spacing(10)
        .padding(15)
        .align_x(Alignment::Center),
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .style(flat_container_style())
    .into()
}

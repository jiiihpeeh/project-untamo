use crate::messages::Message;
use crate::state::AppState;
use crate::theme::{card_container_style, danger_button, secondary_button, COLORS};
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
        text("Profile").size(20).color(COLORS.text).width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::ToggleUserMenu)
            .style(secondary_button()),
    ]
    .align_y(Alignment::Center)
    .spacing(12);

    let user_info: Element<Message> = if let Some(ref user) = state.login.user_info {
        column![
            text(format!("{} {}", user.first_name, user.last_name))
                .size(16)
                .color(COLORS.text),
            text(format!("{}", user.screen_name))
                .size(13)
                .color(COLORS.text_secondary),
            text(format!("{}", user.email))
                .size(13)
                .color(COLORS.text_secondary),
            {
                let mut badges: Vec<&str> = Vec::new();
                if user.admin { badges.push("Admin"); }
                if user.owner { badges.push("Owner"); }
                let label: Element<Message> = text(badges.join("  ")).size(11).color(COLORS.primary).into();
                label
            },
        ]
        .spacing(4)
        .into()
    } else {
        text("Not logged in")
            .size(14)
            .color(COLORS.text_secondary)
            .into()
    };

    let actions = row![
        button(text("Edit Profile").size(14))
            .on_press(Message::ToggleEditProfile)
            .style(secondary_button()),
        button(text("Logout").size(14))
            .on_press(Message::GoToLogout)
            .style(danger_button()),
    ]
    .spacing(8);

    let card = column![header, user_info, actions]
        .spacing(20)
        .padding(24)
        .width(Length::Fixed(320.0));

    container(card).style(card_container_style()).into()
}

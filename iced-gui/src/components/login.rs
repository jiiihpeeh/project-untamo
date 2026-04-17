use crate::messages::Message;
use crate::state::LoginState;
use crate::theme::{
    card_container_style, error_container_style, primary_button, secondary_button,
    text_input_style, COLORS,
};
use iced::{
    widget::{button, column, container, row, text, text_input},
    Element, Length,
};

pub fn login_form<'a>(state: &'a LoginState, server_address: &'a str) -> Element<'a, Message> {
    let logo = iced::widget::svg::Svg::new(iced::widget::svg::Handle::from_memory(include_bytes!(
        "../assets/logo.svg"
    )))
    .width(Length::Fixed(80.0))
    .height(Length::Fixed(80.0));

    let title = text("Untamo").size(28).color(COLORS.text);

    let server_label = text("Server Address").size(14).color(COLORS.text);

    let server_input = text_input("http://localhost:3001", server_address)
        .on_input(Message::ServerAddressChanged)
        .padding(12)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let email_label = text("Email").size(14).color(COLORS.text);

    let email_input = text_input("email@example.com", &state.email)
        .on_input(Message::EmailChanged)
        .padding(12)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let password_label = text("Password").size(14).color(COLORS.text);

    let password_input = text_input("password", &state.password)
        .on_input(Message::PasswordChanged)
        .padding(12)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let submit_button = button(text("Log In"))
        .width(Length::Fixed(300.0))
        .on_press(Message::Submit)
        .style(primary_button());

    let error_display: Element<Message> = if let Some(ref err) = state.error_message {
        container(row![text("⚠").size(14), text(err).size(14),].spacing(6))
            .padding([8, 12])
            .style(error_container_style())
            .into()
    } else {
        text("").size(14).into()
    };

    let divider = container(
        row![
            container(iced::widget::Space::new())
                .width(Length::Fixed(1.0))
                .height(Length::Fixed(1.0))
                .style(|_: &iced::Theme| iced::widget::container::Style {
                    background: Some(iced::Background::Color(COLORS.border)),
                    ..iced::widget::container::Style::default()
                }),
            text("or").size(12).color(COLORS.text_secondary),
            container(iced::widget::Space::new())
                .width(Length::Fixed(1.0))
                .height(Length::Fixed(1.0))
                .style(|_: &iced::Theme| iced::widget::container::Style {
                    background: Some(iced::Background::Color(COLORS.border)),
                    ..iced::widget::container::Style::default()
                }),
        ]
        .spacing(12),
    )
    .padding(iced::Padding::from([8, 0]));

    let qr_button = button(text("Scan QR Code"))
        .width(Length::Fixed(300.0))
        .on_press(Message::ToggleQrScanner)
        .style(secondary_button());

    let content = column![
        logo,
        text("").size(12),
        title,
        text("").size(16),
        server_label,
        text("").size(6),
        server_input,
        text("").size(16),
        email_label,
        text("").size(6),
        email_input,
        text("").size(16),
        password_label,
        text("").size(6),
        password_input,
        text("").size(16),
        submit_button,
        text("").size(8),
        error_display,
        text("").size(8),
        divider,
        qr_button,
    ]
    .spacing(4)
    .padding(24);

    container(content)
        .max_width(480)
        .padding(20)
        .style(card_container_style())
        .into()
}

use crate::messages::Message;
use crate::state::RegisterState;
use crate::theme::{
    card_container_style, error_container_style, primary_button, secondary_button,
    text_input_style, COLORS,
};
use iced::{
    widget::{button, column, container, row, text, text_input},
    Element, Length,
};

fn success_bg() -> iced::Background {
    iced::Background::Color(iced::Color {
        r: COLORS.success.r * 0.15,
        g: COLORS.success.g * 0.15,
        b: COLORS.success.b * 0.15,
        a: 1.0,
    })
}

fn danger_bg() -> iced::Background {
    iced::Background::Color(iced::Color {
        r: COLORS.danger.r * 0.15,
        g: COLORS.danger.g * 0.15,
        b: COLORS.danger.b * 0.15,
        a: 1.0,
    })
}

pub fn register_form<'a>(state: &'a RegisterState) -> Element<'a, Message> {
    let logo = iced::widget::svg::Svg::new(iced::widget::svg::Handle::from_memory(include_bytes!(
        "../assets/logo.svg"
    )))
    .width(Length::Fixed(60.0))
    .height(Length::Fixed(60.0));

    let title = text("Register").size(24).color(COLORS.text);

    let first_name_label = text("First Name (Optional)").size(12).color(COLORS.text);
    let first_name_input = text_input("First name", &state.first_name)
        .on_input(Message::RegisterFirstNameChanged)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let last_name_label = text("Last Name (Optional)").size(12).color(COLORS.text);
    let last_name_input = text_input("Last name", &state.last_name)
        .on_input(Message::RegisterLastNameChanged)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let email_label = text("Email (Required)").size(12).color(COLORS.text);
    let email_input = text_input("email@example.com", &state.email)
        .on_input(Message::RegisterEmailChanged)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let password_label = text("Password").size(12).color(COLORS.text);
    let password_input = text_input("password", &state.password)
        .on_input(Message::RegisterPasswordChanged)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let confirm_label = text("Confirm Password").size(12).color(COLORS.text);
    let confirm_input = text_input("confirm password", &state.confirm_password)
        .on_input(Message::RegisterConfirmPasswordChanged)
        .padding(10)
        .width(Length::Fixed(300.0))
        .style(text_input_style());

    let password_match_text: Element<'a, Message> =
        if state.password == state.confirm_password && !state.password.is_empty() {
            container(text("Passwords match").size(12).color(COLORS.success))
                .padding([4, 8])
                .style(|_: &iced::Theme| iced::widget::container::Style {
                    background: Some(success_bg()),
                    ..iced::widget::container::Style::default()
                })
                .into()
        } else if !state.confirm_password.is_empty() {
            container(text("Passwords do not match").size(12).color(COLORS.danger))
                .padding([4, 8])
                .style(|_: &iced::Theme| iced::widget::container::Style {
                    background: Some(danger_bg()),
                    ..iced::widget::container::Style::default()
                })
                .into()
        } else {
            text("").size(12).into()
        };

    let error_display: Element<Message> = if let Some(ref err) = state.error_message {
        container(
            row![
                text("⚠").size(14).color(COLORS.danger),
                text(err).size(14).color(COLORS.text),
            ]
            .spacing(6),
        )
        .padding([8, 12])
        .style(error_container_style())
        .into()
    } else {
        text("").size(12).into()
    };

    let submit_button = button(text("Register"))
        .width(Length::Fixed(300.0))
        .on_press(Message::SubmitRegister)
        .style(primary_button());

    let login_link = button(text("Already have an account? Log In"))
        .on_press(Message::GoToLogin)
        .style(secondary_button());

    let content = column![
        logo,
        text("").size(8),
        title,
        text("").size(12),
        first_name_label,
        first_name_input,
        text("").size(8),
        last_name_label,
        last_name_input,
        text("").size(8),
        email_label,
        email_input,
        text("").size(8),
        password_label,
        password_input,
        text("").size(8),
        confirm_label,
        confirm_input,
        text("").size(8),
        password_match_text,
        text("").size(8),
        error_display,
        text("").size(8),
        submit_button,
        text("").size(8),
        login_link,
    ]
    .spacing(4)
    .padding(20);

    container(content)
        .max_width(400)
        .padding(20)
        .style(card_container_style())
        .into()
}

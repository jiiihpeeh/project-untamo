use crate::messages::Message;
use crate::state::EditProfileState;
use crate::theme::{
    card_container_style, danger_button, primary_button, secondary_button, text_input_style, COLORS,
};
use iced::{
    widget::{button, container, row, text, text_input, Column},
    Alignment, Element, Length,
};

pub fn edit_profile_dialog<'a>(state: &'a EditProfileState) -> Element<'a, Message> {
    let title = text("Edit Profile").size(20).color(COLORS.text);

    let screen_name_input = text_input("Screen Name", &state.screen_name)
        .on_input(Message::SetEditScreenName)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let first_name_input = text_input("First Name", &state.first_name)
        .on_input(Message::SetEditFirstName)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let last_name_input = text_input("Last Name", &state.last_name)
        .on_input(Message::SetEditLastName)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let email_input = text_input("Email", &state.email)
        .on_input(Message::SetEditEmail)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let current_password_input = text_input("Current Password", &state.password)
        .on_input(Message::SetEditPassword)
        .padding(10)
        .width(Length::Fixed(250.0))
        .style(text_input_style());

    let change_password_text = text("Change Password:").size(14).color(COLORS.text);
    let change_password_toggle = button(if state.change_password { "ON" } else { "OFF" })
        .on_press(Message::ToggleEditChangePassword)
        .style(if state.change_password {
            primary_button()
        } else {
            secondary_button()
        });

    let (new_password_input, confirm_password_input) = if state.change_password {
        (
            Some(
                text_input("New Password", &state.new_password)
                    .on_input(Message::SetEditNewPassword)
                    .padding(10)
                    .width(Length::Fixed(250.0))
                    .style(text_input_style()),
            ),
            Some(
                text_input("Confirm Password", &state.confirm_password)
                    .on_input(Message::SetEditConfirmPassword)
                    .padding(10)
                    .width(Length::Fixed(250.0))
                    .style(text_input_style()),
            ),
        )
    } else {
        (None, None)
    };

    let validation_text: Element<'a, Message> = if !state.form_valid {
        container(
            text("Please fill all required fields correctly")
                .size(12)
                .color(COLORS.danger),
        )
        .padding([4, 8])
        .style(|_: &iced::Theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(iced::Color {
                r: COLORS.danger.r * 0.15,
                g: COLORS.danger.g * 0.15,
                b: COLORS.danger.b * 0.15,
                a: 1.0,
            })),
            ..iced::widget::container::Style::default()
        })
        .into()
    } else {
        text("").size(12).into()
    };

    let save_btn = button(text("Save"))
        .on_press(Message::SubmitEditProfile)
        .style(primary_button());

    let cancel_btn = button(text("Cancel"))
        .on_press(Message::CancelEditProfile)
        .style(danger_button());

    let mut content = Column::new().spacing(8);
    content = content.push(title);
    content = content.push(text("").size(8));
    content = content.push(screen_name_input);
    content = content.push(first_name_input);
    content = content.push(last_name_input);
    content = content.push(email_input);
    content = content.push(text("").size(8));
    content = content.push(current_password_input);
    content = content.push(text("").size(8));
    content = content.push(row![change_password_text, change_password_toggle].spacing(10));

    if let Some(np) = new_password_input {
        content = content.push(text("").size(8));
        content = content.push(np);
    }

    if let Some(cp) = confirm_password_input {
        content = content.push(text("").size(8));
        content = content.push(cp);
    }

    content = content.push(text("").size(8));
    content = content.push(validation_text);
    content = content.push(text("").size(8));
    content = content.push(row![save_btn, cancel_btn].spacing(10));

    container(content.padding(20).align_x(Alignment::Center))
        .width(Length::Fixed(350.0))
        .padding(20)
        .style(card_container_style())
        .into()
}

use crate::messages::Message;
use crate::state::EditProfileState;
use crate::theme::{
    card_container_style, danger_button, primary_button, secondary_button, text_input_style, COLORS,
};
use iced::{
    widget::{button, column, container, row, text, text_input, Column},
    Element, Length,
};

fn section_label<'a>(label: &str) -> Element<'a, Message> {
    text(label.to_string()).size(12).color(COLORS.text_secondary).into()
}

pub fn edit_profile_dialog<'a>(state: &'a EditProfileState) -> Element<'a, Message> {
    let title_row = row![
        text("Edit Profile").size(20).color(COLORS.text).width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::CancelEditProfile)
            .style(secondary_button())
            .padding([4, 8]),
    ]
    .align_y(iced::Alignment::Center);

    let screen_name_input = text_input("Screen Name", &state.screen_name)
        .on_input(Message::SetEditScreenName)
        .padding(10)
        .width(Length::Fill)
        .style(text_input_style());

    let first_name_input = text_input("First Name", &state.first_name)
        .on_input(Message::SetEditFirstName)
        .padding(10)
        .width(Length::Fill)
        .style(text_input_style());

    let last_name_input = text_input("Last Name", &state.last_name)
        .on_input(Message::SetEditLastName)
        .padding(10)
        .width(Length::Fill)
        .style(text_input_style());

    let email_input = text_input("Email", &state.email)
        .on_input(Message::SetEditEmail)
        .padding(10)
        .width(Length::Fill)
        .style(text_input_style());

    let password_input = text_input("Current Password", &state.password)
        .on_input(Message::SetEditPassword)
        .secure(true)
        .padding(10)
        .width(Length::Fill)
        .style(text_input_style());

    let pwd_toggle_label = if state.change_password { "Change Password: ON" } else { "Change Password: OFF" };
    let pwd_toggle_btn = button(text(pwd_toggle_label).size(13))
        .on_press(Message::ToggleEditChangePassword)
        .style(if state.change_password { primary_button() } else { secondary_button() });

    let save_btn = button(text("Save"))
        .on_press(Message::SubmitEditProfile)
        .style(if state.form_valid { primary_button() } else { secondary_button() });

    let cancel_btn = button(text("Cancel"))
        .on_press(Message::CancelEditProfile)
        .style(danger_button());

    let mut content: Column<'a, Message> = column![
        title_row,
        text("").size(6),
        section_label("SCREEN NAME"),
        screen_name_input,
        section_label("FIRST NAME"),
        first_name_input,
        section_label("LAST NAME"),
        last_name_input,
        section_label("EMAIL"),
        email_input,
        text("").size(4),
        section_label("CURRENT PASSWORD (required to save)"),
        password_input,
        text("").size(4),
        pwd_toggle_btn,
    ]
    .spacing(6);

    if state.change_password {
        let new_password_input = text_input("New Password", &state.new_password)
            .on_input(Message::SetEditNewPassword)
            .secure(true)
            .padding(10)
            .width(Length::Fill)
            .style(text_input_style());

        let confirm_password_input = text_input("Confirm Password", &state.confirm_password)
            .on_input(Message::SetEditConfirmPassword)
            .secure(true)
            .padding(10)
            .width(Length::Fill)
            .style(text_input_style());

        content = content
            .push(section_label("NEW PASSWORD"))
            .push(new_password_input)
            .push(section_label("CONFIRM PASSWORD"))
            .push(confirm_password_input);
    }

    if !state.form_valid {
        content = content.push(
            text("Please fill all required fields correctly")
                .size(12)
                .color(COLORS.danger),
        );
    }

    content = content.push(text("").size(4));
    content = content.push(row![save_btn, cancel_btn].spacing(10));

    container(content.padding(24))
        .max_width(440)
        .style(card_container_style())
        .into()
}

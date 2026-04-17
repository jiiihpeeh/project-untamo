use crate::messages::Message;
use crate::state::AppPage;
use crate::theme::{flat_container_style, secondary_button, COLORS};
use iced::widget::{button, container, row, text, Space};
use iced::{Element, Length};

pub fn navbar<'a>(_current_page: &AppPage, logged_in: bool) -> Element<'a, Message> {
    let brand = text("Untamo").size(18).color(COLORS.text);

    let alarms_btn = button(text("Alarms"))
        .on_press(Message::NavigateTo(AppPage::Alarms))
        .style(secondary_button());

    let devices_btn = button(text("Devices"))
        .on_press(Message::NavigateTo(AppPage::Devices))
        .style(secondary_button());

    let user_btn = button(text("User"))
        .on_press(Message::NavigateTo(AppPage::User))
        .style(secondary_button());

    let settings_btn = button(text("Settings"))
        .on_press(Message::ToggleSettings)
        .style(secondary_button());

    let login_btn = button(text("Login"))
        .on_press(Message::GoToLogin)
        .style(secondary_button());

    let register_btn = button(text("Register"))
        .on_press(Message::NavigateTo(AppPage::Register))
        .style(secondary_button());

    let nav_items: Vec<Element<Message>> = if logged_in {
        vec![
            alarms_btn.into(),
            devices_btn.into(),
            user_btn.into(),
            settings_btn.into(),
        ]
    } else {
        vec![login_btn.into(), register_btn.into()]
    };

    let content = row![brand, Space::new(),].extend(nav_items).spacing(10);

    container(content)
        .padding([10, 15])
        .width(Length::Fill)
        .height(iced::Length::Fixed(50.0))
        .style(flat_container_style())
        .into()
}

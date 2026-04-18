use crate::messages::Message;
use crate::state::{AppPage, UserInfo};
use crate::theme::{nav_active_button, nav_ghost_button, navbar_container_style, COLORS};
use iced::widget::{button, container, row, svg, text, Space};
use iced::widget::svg::Handle;
use iced::{Element, Length};

fn initials(screen_name: &str) -> String {
    screen_name
        .split_whitespace()
        .filter_map(|w| w.chars().next())
        .take(2)
        .map(|c| c.to_uppercase().next().unwrap_or(c))
        .collect()
}

fn nav_btn<'a>(
    label: impl Into<String>,
    msg: Message,
    active: bool,
) -> iced::widget::Button<'a, Message> {
    button(text(label.into()).size(14).color(iced::Color::WHITE))
        .on_press(msg)
        .padding([6, 14])
        .style(if active {
            nav_active_button()
        } else {
            nav_ghost_button()
        })
}

pub fn navbar<'a>(
    current_page: &AppPage,
    logged_in: bool,
    user_info: Option<&'a UserInfo>,
    panel_size: u32,
) -> Element<'a, Message> {
    let logo = svg(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(32.0))
        .height(Length::Fixed(32.0));

    let brand_btn = button(
        row![logo, text("Untamo").size(16).color(iced::Color::WHITE)]
            .spacing(8)
            .align_y(iced::Alignment::Center),
    )
    .on_press(Message::ToggleSettings)
    .padding([4, 10])
    .style(nav_ghost_button());

    let user_initials = user_info
        .map(|u| initials(&u.screen_name))
        .unwrap_or_else(|| "U".to_string());

    let right_items: Vec<Element<Message>> = if logged_in {
        let alarms_active = matches!(current_page, AppPage::Alarms);
        let devices_active = matches!(current_page, AppPage::Devices);
        let user_active = matches!(current_page, AppPage::User);
        vec![
            nav_btn("Alarms", Message::NavigateTo(AppPage::Alarms), alarms_active).into(),
            nav_btn("Devices", Message::NavigateTo(AppPage::Devices), devices_active).into(),
            nav_btn(&user_initials, Message::NavigateTo(AppPage::User), user_active).into(),
        ]
    } else {
        let login_active = matches!(current_page, AppPage::Login);
        let reg_active = matches!(current_page, AppPage::Register);
        vec![
            nav_btn("Login", Message::GoToLogin, login_active).into(),
            nav_btn("Register", Message::NavigateTo(AppPage::Register), reg_active).into(),
        ]
    };

    let right = right_items
        .into_iter()
        .fold(row![].spacing(4), |r, item| r.push(item))
        .align_y(iced::Alignment::Center);

    let nav_row = row![brand_btn, Space::new().width(Length::Fill), right]
        .align_y(iced::Alignment::Center)
        .padding([0, 12]);

    container(nav_row)
        .width(Length::Fill)
        .height(Length::Fixed(panel_size as f32))
        .style(navbar_container_style())
        .into()
}

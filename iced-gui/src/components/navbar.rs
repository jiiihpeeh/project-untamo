use crate::messages::Message;
use crate::state::{AppPage, UserInfo};
use crate::theme::navbar_container_style;
use iced::widget::svg::Handle;
use iced::widget::{button, column, container, row, svg, text, Space};
use iced::{Background, Border, Color, Element, Length, Shadow};
use iced_widget::rule;

// ── link-style button factories ───────────────────────────────────────────────

fn link_style() -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style
{
    move |_theme, status| {
        let alpha = match status {
            iced::widget::button::Status::Hovered | iced::widget::button::Status::Pressed => 0.12,
            _ => 0.0,
        };
        iced::widget::button::Style {
            background: Some(Background::Color(Color::from_rgba(1.0, 1.0, 1.0, alpha))),
            border: Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 4.0.into(),
            },
            shadow: Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

/// Label + optional underline rule, all sizes driven by `font_size`.
fn nav_link<'a>(
    label: impl Into<String> + 'a,
    msg: Message,
    active: bool,
    font_size: f32,
) -> Element<'a, Message> {
    let t = text(label.into()).size(font_size).color(Color::WHITE);
    let pad_v = (font_size * 0.4).round() as u16;
    let pad_h = (font_size * 0.9).round() as u16;

    let inner: Element<Message> = if active {
        container(
            row![
                t,
                rule::horizontal(2).style(|_theme| iced_widget::rule::Style {
                    color: Color::WHITE,
                    radius: 0.0.into(),
                    fill_mode: iced_widget::rule::FillMode::Full,
                    snap: false,
                })
            ]
            .spacing(2)
            .align_y(iced::Alignment::Center),
        )
        .width(Length::Shrink)
        .into()
    } else {
        t.into()
    };

    button(
        container(inner)
            .align_y(iced::Alignment::Center)
            .align_x(iced::Alignment::Center),
    )
    .on_press(msg)
    .padding([pad_v, pad_h / 2])
    .style(link_style())
    .into()
}

// ── public navbar ─────────────────────────────────────────────────────────────

pub fn navbar<'a>(
    current_page: &AppPage,
    logged_in: bool,
    user_info: Option<&'a UserInfo>,
    panel_size: u32,
    devices_modal_open: bool,
) -> Element<'a, Message> {
    let ps = panel_size as f32;
    let logo_size = (ps * 0.55).round();
    let brand_font = (ps * 0.28).round();
    let nav_font = (ps * 0.25).round();

    let logo = svg(Handle::from_memory(include_bytes!("../assets/logo.svg")))
        .width(Length::Fixed(logo_size))
        .height(Length::Fixed(logo_size));

    let brand_btn = button(
        row![logo, text("Untamo").size(brand_font).color(Color::WHITE)]
            .spacing((ps * 0.14).round())
            .align_y(iced::Alignment::Center),
    )
    .on_press(Message::ToggleSettings)
    .padding([(ps * 0.07).round(), (ps * 0.18).round()])
    .style(link_style());

    let user_initials = user_info
        .map(|u| initials(&u.screen_name))
        .unwrap_or_else(|| "U".to_string());

    let right_items: Vec<Element<Message>> = if logged_in {
        let alarms_active = matches!(current_page, AppPage::Alarms);
        vec![
            nav_link(
                "Alarms",
                Message::NavigateTo(AppPage::Alarms),
                alarms_active,
                nav_font,
            ),
            nav_link(
                "Devices",
                Message::ToggleDevicesModal,
                devices_modal_open,
                nav_font,
            ),
            nav_link(user_initials, Message::ToggleUserMenu, false, nav_font),
        ]
    } else {
        let login_active = matches!(current_page, AppPage::Login);
        let reg_active = matches!(current_page, AppPage::Register);
        vec![
            nav_link("Login", Message::GoToLogin, login_active, nav_font),
            nav_link(
                "Register",
                Message::NavigateTo(AppPage::Register),
                reg_active,
                nav_font,
            ),
        ]
    };

    let right = right_items
        .into_iter()
        .fold(row![].spacing((ps * 0.07).round()), |r, item| r.push(item))
        .align_y(iced::Alignment::Center);

    let nav_row = row![brand_btn, Space::new().width(Length::Fill), right]
        .align_y(iced::Alignment::Center)
        .height(Length::Fill)
        .padding(iced::Padding::from([0.0, (ps * 0.21).round()]));

    container(nav_row)
        .width(Length::Fill)
        .height(Length::Fixed(ps))
        .style(navbar_container_style())
        .into()
}

fn initials(screen_name: &str) -> String {
    screen_name
        .split_whitespace()
        .filter_map(|w| w.chars().next())
        .take(2)
        .map(|c| c.to_uppercase().next().unwrap_or(c))
        .collect()
}

use crate::components::{
    add_alarm_dialog, alarms_view, colors_dialog, devices_view, edit_device_dialog,
    edit_profile_dialog, login_form, navbar, notifications_view, play_alarm_view, qr_scanner,
    register_form, settings_dialog, user_menu_view, welcome_view,
};
use crate::messages::Message;
use crate::state::{AppPage, AppState, SessionStatus};
use iced::{
    widget::{container, scrollable, stack},
    Background, Color, Element, Length,
};

fn is_logged_in(state: &AppState) -> bool {
    state.login.session_status == SessionStatus::Valid && state.login.user_info.is_some()
}

fn current_page(state: &AppState) -> AppPage {
    match state.login.session_status {
        SessionStatus::Valid if state.login.user_info.is_some() => {
            if state.page == AppPage::Welcome
                || state.page == AppPage::Login
                || state.page == AppPage::Register
            {
                AppPage::Welcome
            } else {
                state.page.clone()
            }
        }
        _ => state.page.clone(),
    }
}

/// Full-screen modal: dimmed backdrop + vertically/horizontally centered scrollable dialog.
fn modal<'a>(dialog: Element<'a, Message>) -> Element<'a, Message> {
    let backdrop = container(iced::widget::Space::new().width(Length::Fill).height(Length::Fill))
        .width(Length::Fill)
        .height(Length::Fill)
        .style(|_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(Background::Color(Color::from_rgba(0.0, 0.0, 0.0, 0.48))),
            ..iced::widget::container::Style::default()
        });

    let centered = container(scrollable(dialog).height(Length::Shrink))
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .padding(24);

    stack([backdrop.into(), centered.into()]).into()
}

pub fn view<'a>(state: &'a AppState) -> Element<'a, Message> {
    let page = current_page(state);
    let logged_in = is_logged_in(state);

    if state.show_qr_scanner {
        return container(qr_scanner(
            state.qr_error.as_ref(),
            state.qr_scanning,
            &state.qr_token_input,
            state.qr_frame_count,
            state.qr_frame_data.as_ref(),
            state.qr_refresh_toggle,
        ))
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .width(Length::Fill)
        .height(Length::Fill)
        .into();
    }

    let nav = navbar(&page, logged_in, state.login.user_info.as_ref(), state.settings.panel_size);

    let main_content: Element<Message> = match page {
        AppPage::Login => container(login_form(&state.login, &state.server_address))
            .center_x(Length::Fill)
            .into(),
        AppPage::Register => container(register_form(&state.register))
            .center_x(Length::Fill)
            .into(),
        AppPage::Welcome => welcome_view(&state.login, &state.welcome, &state.devices).into(),
        AppPage::Alarms => alarms_view(state).into(),
        AppPage::Devices => devices_view(state).into(),
        AppPage::User => user_menu_view(state).into(),
        AppPage::PlayAlarm => play_alarm_view(state).into(),
    };

    // Base layer: navbar + page content (nav position from settings)
    let base_col = if state.settings.nav_bar_top {
        iced::widget::Column::new().push(nav).push(main_content)
    } else {
        iced::widget::Column::new().push(main_content).push(nav)
    };
    let base: Element<Message> = container(base_col.height(Length::Fill))
        .width(Length::Fill)
        .height(Length::Fill)
        .into();

    // Collect stack layers
    let mut layers: Vec<Element<Message>> = vec![base];

    // Modal dialogs — each replaces previous so only one shows at a time
    if state.settings.show_settings {
        layers.push(modal(settings_dialog(&state.settings)));
    }

    if state.settings.show_colors {
        layers.push(modal(colors_dialog(&state.settings)));
    }

    if state.show_add_alarm {
        layers.push(modal(add_alarm_dialog(
            &state.add_alarm,
            &state.devices,
            &state.available_tunes,
        )));
    }

    if state.edit_profile.show {
        layers.push(modal(edit_profile_dialog(&state.edit_profile)));
    }

    if state.editing_device.is_some() {
        layers.push(modal(edit_device_dialog(
            &state
                .editing_device
                .as_ref()
                .map(|d| d.id.clone())
                .unwrap_or_default(),
            &state.editing_device_name,
            &state.editing_device_type,
        )));
    }

    // Toast notifications — top-right overlay (always on top)
    if !state.notifications.is_empty() {
        let toasts = container(notifications_view(&state.notifications))
            .width(Length::Fill)
            .height(Length::Fill)
            .align_right(Length::Fill)
            .align_top(Length::Fill)
            .padding(iced::Padding {
                top: 64.0,
                right: 16.0,
                bottom: 0.0,
                left: 0.0,
            });
        layers.push(toasts.into());
    }

    stack(layers).into()
}

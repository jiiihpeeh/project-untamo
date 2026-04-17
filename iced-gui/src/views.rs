use crate::components::{
    add_alarm_dialog, alarms_view, colors_dialog, devices_view, edit_device_dialog,
    edit_profile_dialog, login_form, navbar, notifications_view, play_alarm_view, qr_scanner,
    register_form, settings_dialog, user_menu_view, welcome_view,
};
use crate::messages::Message;
use crate::state::{AppPage, AppState, SessionStatus};
use iced::{widget::container, Element, Length};

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

    let nav = navbar(&page, logged_in);

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

    let mut column_content: Vec<Element<Message>> = vec![nav.into(), main_content];

    if state.settings.show_settings {
        column_content.push(settings_dialog(&state.settings).into());
    }

    if state.settings.show_colors {
        column_content.push(colors_dialog(&state.settings).into());
    }

    if state.show_add_alarm {
        column_content.push(add_alarm_dialog(&state.add_alarm).into());
    }

    if state.edit_profile.show {
        column_content.push(edit_profile_dialog(&state.edit_profile).into());
    }

    if state.editing_device.is_some() {
        column_content.push(
            edit_device_dialog(
                &state
                    .editing_device
                    .as_ref()
                    .map(|d| d.id.clone())
                    .unwrap_or_default(),
                &state.editing_device_name,
                &state.editing_device_type,
            )
            .into(),
        );
    }

    if !state.notifications.is_empty() {
        column_content.push(notifications_view(&state.notifications).into());
    }

    container(iced::widget::Column::with_children(
        column_content.into_iter(),
    ))
    .width(Length::Fill)
    .height(Length::Fill)
    .into()
}

use crate::messages::Message;
use crate::state::{AppPage, AppState, PendingDelete};
use iced::Task;
use super::helpers::*;

pub fn toggle_viewable_device(state: &mut AppState, id: String) -> Task<Message> {
    if let Some(pos) = state.viewable_devices.iter().position(|v| v == &id) {
        state.viewable_devices.remove(pos);
    } else {
        state.viewable_devices.push(id);
    }
    save_settings_from_state(state);
    Task::none()
}

pub fn select_welcome_device(state: &mut AppState, selection: crate::state::DeviceSelect) -> Task<Message> {
    // Persist the chosen device so we skip the welcome screen next launch.
    let device_id = match &selection {
        crate::state::DeviceSelect::Device(d) => Some(d.id.clone()),
        crate::state::DeviceSelect::None => None,
    };
    state.saved_device_id = device_id.clone();
    state.welcome.selected_device = selection;

    let mut s = crate::storage::load_settings();
    s.device_id = device_id;
    if let Err(e) = crate::storage::save_settings(&s) {
        eprintln!("Failed to save settings: {}", e);
    }

    // Navigate straight to alarms once a device is picked.
    state.page = AppPage::Alarms;
    Task::none()
}

pub fn add_device(state: &mut AppState) -> Task<Message> {
    state.adding_device = true;
    state.editing_device = None;
    state.editing_device_name = String::new();
    state.editing_device_type = crate::state::DeviceType::default();
    Task::none()
}

pub fn edit_device(state: &mut AppState, id: String) -> Task<Message> {
    if let Some(device) = state.devices.iter().find(|d| d.id == id) {
        let device_type = crate::state::DeviceType::from(device.device_type.as_str());
        state.editing_device = Some(device.clone());
        state.editing_device_name = device.device_name.clone();
        state.editing_device_type = device_type;
    }
    Task::none()
}

pub fn set_editing_device_name(state: &mut AppState, name: String) -> Task<Message> {
    state.editing_device_name = name;
    Task::none()
}

pub fn set_editing_device_type(state: &mut AppState, device_type: crate::state::DeviceType) -> Task<Message> {
    state.editing_device_type = device_type;
    Task::none()
}

pub fn save_device_edit(state: &mut AppState) -> Task<Message> {
    #[derive(serde::Serialize)]
    struct DeviceOut {
        id: String,
        #[serde(rename = "deviceName")]
        device_name: String,
        #[serde(rename = "type")]
        device_type: String,
    }
    let new_name = state.editing_device_name.clone();
    let new_type = String::from(state.editing_device_type.clone());
    let server = state.server_address.clone();
    let token = state.ws.token.clone();

    if state.adding_device {
        // POST new device
        state.adding_device = false;
        let payload = DeviceOut { id: String::new(), device_name: new_name, device_type: new_type };
        return iced::Task::perform(
            async move {
                let client = reqwest::Client::new();
                match client
                    .post(format!("{}/api/device", server))
                    .header("token", &token)
                    .json(&payload)
                    .send()
                    .await
                {
                    Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                    Ok(resp) => Message::DeviceAddResult(Err(format!("HTTP {}", resp.status()))),
                    Err(e) => Message::DeviceAddResult(Err(e.to_string())),
                }
            },
            |m| m,
        );
    } else if let Some(ref device) = state.editing_device {
        // PUT existing device
        let id = device.id.clone();
        if let Some(d) = state.devices.iter_mut().find(|d| d.id == id) {
            d.device_name = new_name.clone();
            d.device_type = new_type.clone();
        }
        state.editing_device = None;
        let payload = DeviceOut { id: id.clone(), device_name: new_name, device_type: new_type };
        return iced::Task::perform(
            async move {
                let client = reqwest::Client::new();
                match client
                    .put(format!("{}/api/device/{}", server, id))
                    .header("token", &token)
                    .json(&payload)
                    .send()
                    .await
                {
                    Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                    Ok(resp) => Message::UpdateError(format!("HTTP {}", resp.status())),
                    Err(e) => Message::UpdateError(e.to_string()),
                }
            },
            |m| m,
        );
    }
    Task::none()
}

pub fn close_device_edit(state: &mut AppState) -> Task<Message> {
    state.editing_device = None;
    state.adding_device = false;
    Task::none()
}

pub fn device_add_result(state: &mut AppState, result: Result<(), String>) -> Task<Message> {
    if let Err(e) = result {
        add_notification_kind(state, "Device Error", format!("Failed to add device: {}", e), crate::state::NotificationKind::Error);
    }
    Task::none()
}

pub fn delete_device(state: &mut AppState, id: String) -> Task<Message> {
    state.pending_delete = Some(PendingDelete::Device(id));
    Task::none()
}

pub fn toggle_devices_modal(state: &mut AppState) -> Task<Message> {
    state.show_devices_modal = !state.show_devices_modal;
    Task::none()
}

pub fn toggle_edit_profile(state: &mut AppState) -> Task<Message> {
    state.edit_profile.show = !state.edit_profile.show;
    if state.edit_profile.show {
        state.show_user_menu = false;
        if let Some(ref user) = state.login.user_info {
            state.edit_profile.screen_name = user.screen_name.clone();
            state.edit_profile.first_name = user.first_name.clone();
            state.edit_profile.last_name = user.last_name.clone();
            state.edit_profile.email = user.email.clone();
        }
        state.edit_profile.password = String::new();
        state.edit_profile.new_password = String::new();
        state.edit_profile.confirm_password = String::new();
        state.edit_profile.change_password = false;
        state.edit_profile.validate();
    }
    Task::none()
}

pub fn toggle_about(state: &mut AppState) -> Task<Message> {
    state.show_about = !state.show_about;
    Task::none()
}

pub fn logo_hovered(state: &mut AppState) -> Task<Message> {
    state.logo_anim_start = Some(std::time::Instant::now());
    Task::none()
}

pub fn logo_unhovered(_state: &mut AppState) -> Task<Message> {
    // Let the animation finish naturally; FrameTick clears it after 2s
    Task::none()
}

pub fn toggle_user_menu(state: &mut AppState) -> Task<Message> {
    state.show_user_menu = !state.show_user_menu;
    Task::none()
}

pub fn go_to_logout(state: &mut AppState) -> Task<Message> {
    state.show_user_menu = false;
    let server = state.server_address.clone();
    let token = state.ws.token.clone();

    crate::websocket::disconnect();
    crate::storage::clear_session();

    state.login.session_status = crate::state::SessionStatus::NotValid;
    state.login.user_info = None;
    state.login.email = String::new();
    state.login.password = String::new();
    state.page = AppPage::Login;
    state.alarms.clear();
    state.devices.clear();
    state.ws.token = String::new();
    state.ws.ws_token = String::new();
    state.ws.ws_pair = String::new();
    state.ws.connected = false;

    Task::perform(
        async move {
            let client = reqwest::Client::new();
            let _ = client
                .post(format!("{}/logout", server))
                .header("token", token)
                .send()
                .await;
        },
        |_| Message::ClearError,
    )
}

pub fn set_edit_screen_name(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.screen_name = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_first_name(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.first_name = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_last_name(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.last_name = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_email(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.email = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_password(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.password = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_new_password(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.new_password = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn set_edit_confirm_password(state: &mut AppState, val: String) -> Task<Message> {
    state.edit_profile.confirm_password = val;
    state.edit_profile.validate();
    Task::none()
}

pub fn toggle_edit_change_password(state: &mut AppState) -> Task<Message> {
    state.edit_profile.change_password = !state.edit_profile.change_password;
    state.edit_profile.validate();
    Task::none()
}

pub fn submit_edit_profile(state: &mut AppState) -> Task<Message> {
    if !state.edit_profile.form_valid {
        return Task::none();
    }
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    let email = state.edit_profile.email.clone();
    let first_name = state.edit_profile.first_name.clone();
    let last_name = state.edit_profile.last_name.clone();
    let screen_name = state.edit_profile.screen_name.clone();
    let password = state.edit_profile.password.clone();
    let change_password = if state.edit_profile.change_password {
        Some(state.edit_profile.new_password.clone())
    } else {
        None
    };
    // Optimistic local update
    if let Some(ref mut user) = state.login.user_info {
        user.email = email.clone();
        user.first_name = first_name.clone();
        user.last_name = last_name.clone();
        user.screen_name = screen_name.clone();
    }
    state.edit_profile.show = false;
    iced::Task::perform(
        async move {
            #[derive(serde::Serialize)]
            struct EditUser {
                email: String,
                #[serde(rename = "firstName")]
                first_name: String,
                #[serde(rename = "lastName")]
                last_name: String,
                #[serde(rename = "screenName")]
                screen_name: String,
                password: String,
                #[serde(rename = "changePassword", skip_serializing_if = "Option::is_none")]
                change_password: Option<String>,
            }
            let payload = EditUser {
                email: email.clone(),
                first_name,
                last_name,
                screen_name,
                password,
                change_password,
            };
            let client = reqwest::Client::new();
            match client
                .put(format!("{}/api/edit-user/{}", server, email))
                .header("token", &token)
                .json(&payload)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    Message::ShowNotification(
                        "Profile Updated".to_string(),
                        "Your profile has been updated".to_string(),
                    )
                }
                Ok(resp) => Message::ShowNotification(
                    "Profile Error".to_string(),
                    format!("Failed to save: HTTP {}", resp.status()),
                ),
                Err(e) => Message::ShowNotification(
                    "Profile Error".to_string(),
                    format!("Failed to save: {}", e),
                ),
            }
        },
        |m| m,
    )
}

pub fn cancel_edit_profile(state: &mut AppState) -> Task<Message> {
    state.edit_profile.show = false;
    Task::none()
}

pub fn refresh_session(state: &mut AppState) -> Task<Message> {
    let token = state.ws.token.clone();
    let server = state.server_address.clone();
    Task::perform(
        async move {
            let client = reqwest::Client::new();
            let resp = client
                .get(format!("{}/api/session", server))
                .header("token", token)
                .send()
                .await;
            match resp {
                Ok(r) if r.status().is_success() => Message::ClearError,
                _ => Message::ClearError,
            }
        },
        |_| Message::ClearError,
    )
}

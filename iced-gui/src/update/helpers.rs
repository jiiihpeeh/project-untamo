use crate::state::{Alarm, AppState, Device, UserInfo, WebColors};
use crate::websocket::WsMessage as WsMsg;
use std::time::Duration;

pub(super) fn http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .connect_timeout(Duration::from_secs(5))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new())
}

pub(super) fn add_notification(state: &mut AppState, title: &str, message: String) {
    add_notification_kind(state, title, message, crate::state::NotificationKind::Info);
}

pub(super) fn add_notification_kind(
    state: &mut AppState,
    title: &str,
    message: String,
    kind: crate::state::NotificationKind,
) {
    if state.settings.desktop_notifications {
        let t = title.to_string();
        let m = message.clone();
        std::thread::spawn(move || {
            let _ = notify_rust::Notification::new().summary(&t).body(&m).show();
        });
    }
    if state.settings.notifications_enabled {
        let notif = crate::state::Notification {
            title: title.to_string(),
            message,
            kind,
            timestamp: std::time::Instant::now(),
        };
        state.notifications.push(notif);
        if state.notifications.len() > 5 {
            state.notifications.remove(0);
        }
    }
}

pub(super) fn save_settings_from_state(state: &AppState) {
    let s = crate::storage::AppSettings {
        clock24: state.settings.clock24,
        volume: state.settings.volume,
        nav_bar_top: state.settings.nav_bar_top,
        panel_size: state.settings.panel_size,
        device_id: state.saved_device_id.clone(),
        viewable_devices: state.viewable_devices.clone(),
        notifications_enabled: state.settings.notifications_enabled,
        desktop_notifications: state.settings.desktop_notifications,
    };
    if let Err(e) = crate::storage::save_settings(&s) {
        eprintln!("Failed to save settings: {}", e);
    }
}

pub(super) fn handle_ws_message(state: &mut AppState, msg: WsMsg) {
    use crate::websocket::WsMessageType;

    match msg.msg_type {
        WsMessageType::AlarmAdd => {
            if let Some(alarm) = parse_alarm(&msg.data) {
                if !state.alarms.iter().any(|a| a.id == alarm.id) {
                    state.alarms.push(alarm);
                }
            }
        }
        WsMessageType::AlarmDelete => {
            if let Some(id) = msg.data.as_str() {
                state.alarms.retain(|a| a.id != id);
            }
        }
        WsMessageType::AlarmEdit => {
            if let Some(alarm) = parse_alarm(&msg.data) {
                if let Some(existing) = state.alarms.iter_mut().find(|a| a.id == alarm.id) {
                    *existing = alarm;
                }
            }
        }
        WsMessageType::DeviceAdd => {
            if let Some(device) = parse_device(&msg.data) {
                if !state.devices.iter().any(|d| d.id == device.id) {
                    let id = device.id.clone();
                    state.devices.push(device);
                    if !state.viewable_devices.contains(&id) {
                        state.viewable_devices.push(id);
                        save_settings_from_state(state);
                    }
                }
            }
        }
        WsMessageType::DeviceDelete => {
            if let Some(id) = msg.data.as_str() {
                state.devices.retain(|d| d.id != id);
                state.viewable_devices.retain(|v| v != id);
                save_settings_from_state(state);
            }
        }
        WsMessageType::DeviceEdit => {
            if let Some(device) = parse_device(&msg.data) {
                if let Some(existing) = state.devices.iter_mut().find(|d| d.id == device.id) {
                    *existing = device;
                }
            }
        }
        WsMessageType::UserEdit => {
            if let Some(user) = parse_user_info(&msg.data) {
                state.login.user_info = Some(user);
            }
        }
        WsMessageType::WebColors => {
            if let Some(colors) = parse_web_colors(&msg.data) {
                state.settings.web_colors = colors;
            }
        }
    }
}

pub(super) fn parse_alarm(value: &serde_json::Value) -> Option<Alarm> {
    Some(Alarm {
        id: value.get("id")?.as_str()?.to_string(),
        occurrence: value.get("occurrence")?.as_str()?.to_string(),
        time: value
            .get("time")?
            .as_array()?
            .iter()
            .filter_map(|v| v.as_u64())
            .map(|n| n as u8)
            .collect(),
        weekdays: value.get("weekdays")?.as_u64()? as u8,
        date: value
            .get("date")?
            .as_array()?
            .iter()
            .filter_map(|v| v.as_u64())
            .map(|n| n as u16)
            .collect(),
        label: value.get("label")?.as_str()?.to_string(),
        devices: value
            .get("devices")?
            .as_array()?
            .iter()
            .filter_map(|v| v.as_str())
            .map(|s| s.to_string())
            .collect(),
        snooze: value
            .get("snooze")?
            .as_array()?
            .iter()
            .filter_map(|v| v.as_i64())
            .collect(),
        active: value.get("active")?.as_bool()?,
        tune: value.get("tune")?.as_str()?.to_string(),
        modified: value.get("modified")?.as_i64().unwrap_or(0),
        fingerprint: value.get("fingerprint")?.as_str()?.to_string(),
        close_task: value.get("closeTask")?.as_bool().unwrap_or(false),
    })
}

pub(super) fn parse_device(value: &serde_json::Value) -> Option<Device> {
    Some(Device {
        id: value.get("id")?.as_str()?.to_string(),
        device_name: value
            .get("deviceName")
            .or_else(|| value.get("device_name"))?
            .as_str()?
            .to_string(),
        device_type: value
            .get("type")
            .or_else(|| value.get("deviceType"))?
            .as_str()?
            .to_string(),
    })
}

pub(super) fn parse_user_info(value: &serde_json::Value) -> Option<UserInfo> {
    Some(UserInfo {
        user: value.get("user")?.as_str()?.to_string(),
        email: value.get("email")?.as_str()?.to_string(),
        screen_name: value
            .get("screenName")
            .or_else(|| value.get("screen_name"))?
            .as_str()?
            .to_string(),
        first_name: value
            .get("firstName")
            .or_else(|| value.get("first_name"))?
            .as_str()?
            .to_string(),
        last_name: value
            .get("lastName")
            .or_else(|| value.get("last_name"))?
            .as_str()?
            .to_string(),
        admin: value.get("admin")?.as_bool()?,
        owner: value.get("owner")?.as_bool()?,
        active: value.get("active")?.as_bool()?,
        registered: value.get("registered")?.as_i64().unwrap_or(0),
    })
}

pub(super) fn parse_web_colors(value: &serde_json::Value) -> Option<WebColors> {
    Some(WebColors {
        even: value.get("even")?.as_str()?.to_string(),
        odd: value.get("odd")?.as_str()?.to_string(),
        inactive: value.get("inactive")?.as_str()?.to_string(),
        background: value.get("background")?.as_str()?.to_string(),
    })
}

pub(super) fn alarm_should_fire_now(
    alarm: &crate::state::Alarm,
    now: &chrono::DateTime<chrono::Local>,
) -> bool {
    use chrono::{Datelike, Timelike};
    if alarm.time.len() < 2 {
        return false;
    }
    let h = alarm.time[0] as u32;
    let m = alarm.time[1] as u32;
    if now.hour() != h || now.minute() != m {
        return false;
    }
    match alarm.occurrence.to_lowercase().as_str() {
        "daily" => true,
        "weekly" => {
            let today_wd = now.weekday().num_days_from_monday(); // Mon=0..Sun=6
            alarm.weekdays & (1 << today_wd) != 0
        }
        "once" => {
            if alarm.date.len() >= 3 {
                alarm.date[0] as i32 == now.year()
                    && alarm.date[1] as u32 == now.month()
                    && alarm.date[2] as u32 == now.day()
            } else {
                false
            }
        }
        "yearly" => {
            if alarm.date.len() >= 3 {
                alarm.date[1] as u32 == now.month() && alarm.date[2] as u32 == now.day()
            } else {
                false
            }
        }
        _ => false,
    }
}

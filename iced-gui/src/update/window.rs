use crate::messages::Message;
use crate::state::{AppPage, AppState};
use iced::Task;
use super::helpers::*;

pub fn window_id_received(state: &mut AppState, id: Option<iced::window::Id>) -> Task<Message> {
    state.window_id = id;
    if let Some(wid) = id {
        if let Ok(icon) = iced::window::icon::from_file_data(
            super::ICON_BYTES,
            Some(image::ImageFormat::Png),
        ) {
            return iced::window::set_icon(wid, icon);
        }
    }
    Task::none()
}

pub fn close_requested(state: &mut AppState, id: iced::window::Id) -> Task<Message> {
    state.window_id = None;
    iced::window::close(id)
}

pub fn window_closed(state: &mut AppState, id: iced::window::Id) -> Task<Message> {
    if state.window_id == Some(id) {
        state.window_id = None;
    }
    Task::none()
}

pub fn tray_show_window(state: &mut AppState) -> Task<Message> {
    if let Some(id) = state.window_id {
        iced::window::gain_focus(id)
    } else {
        let (id, open_task) = iced::window::open(super::new_window_settings());
        state.window_id = Some(id);
        Task::batch([
            open_task.map(|id| Message::WindowIdReceived(Some(id))),
            iced::window::gain_focus(id),
        ])
    }
}

pub fn tray_toggle(state: &mut AppState) -> Task<Message> {
    if let Some(id) = state.window_id {
        state.window_id = None;
        iced::window::close(id)
    } else {
        let (id, open_task) = iced::window::open(super::new_window_settings());
        state.window_id = Some(id);
        Task::batch([
            open_task.map(|id| Message::WindowIdReceived(Some(id))),
            iced::window::gain_focus(id),
        ])
    }
}

pub fn tray_quit(_state: &mut AppState) -> Task<Message> {
    std::process::exit(0);
}

pub fn frame_tick(state: &mut AppState) -> Task<Message> {
    if let Ok(mut guard) = crate::websocket::WS_MSG_QUEUE.lock() {
        let messages: Vec<_> = guard.drain(..).collect();
        for result in messages {
            if let Ok(msg) = result {
                handle_ws_message(state, msg);
            }
        }
    }
    
    // Check countdown timer - it handles alarm triggering when done
    crate::update::countdown::tick(state);
    
    // Auto-dismiss notifications after 4 seconds
    let now = std::time::Instant::now();
    state.notifications.retain(|n| {
        now.duration_since(n.timestamp).as_millis() < 4000
    });
    // Reset preview button when track finishes naturally
    if state.add_alarm.preview_started && !crate::audio::is_audio_playing() {
        state.add_alarm.previewing_tune = None;
        state.add_alarm.preview_started = false;
    }
    // Clear logo animation after 2s
    if let Some(start) = state.logo_anim_start {
        if start.elapsed().as_secs_f32() >= 2.0 {
            state.logo_anim_start = None;
        }
    }
    // Ensure alarm animation start is set when on PlayAlarm page
    if state.page == AppPage::PlayAlarm && state.alarm_anim_start.is_none() {
        state.alarm_anim_start = Some(std::time::Instant::now());
    }

    // ── Toggle switch animations ──────────────────────────────────────
    {
        const K: f32 = 0.35;
        const SNAP: f32 = 0.005;
        for alarm in &state.alarms {
            let target = if alarm.active { 1.0f32 } else { 0.0 };
            let e = state.toggle_anims.entry(alarm.id.clone()).or_insert(target);
            if (*e - target).abs() > SNAP { *e += (target - *e) * K; } else { *e = target; }
        }
        for (key, target) in [
            ("settings_notif",         if state.settings.notifications_enabled { 1.0f32 } else { 0.0 }),
            ("settings_desktop_notif", if state.settings.desktop_notifications { 1.0f32 } else { 0.0 }),
            ("add_active",     if state.add_alarm.active { 1.0 } else { 0.0 }),
            ("add_close_task", if state.add_alarm.close_task { 1.0 } else { 0.0 }),
            ("play_turn_off",  if state.turn_off { 1.0 } else { 0.0 }),
        ] {
            let e = state.toggle_anims.entry(key.to_string()).or_insert(target);
            if (*e - target).abs() > SNAP { *e += (target - *e) * K; } else { *e = target; }
        }
    }

    // ── Alarm scheduler: check once per minute ────────────────────────
    let mut alarm_to_fire: Option<String> = None;
    if state.page != AppPage::PlayAlarm && state.login.session_status == crate::state::SessionStatus::Valid {
        use chrono::Timelike;
        let chrono_now = chrono::Local::now();
        let current_minute = (chrono_now.hour(), chrono_now.minute());
        if state.last_alarm_minute != Some(current_minute) {
            state.last_alarm_minute = Some(current_minute);
            let selected_device_id = match &state.welcome.selected_device {
                crate::state::DeviceSelect::Device(d) => Some(d.id.clone()),
                crate::state::DeviceSelect::None => None,
            };
            for alarm in &state.alarms {
                if !alarm.active { continue; }
                if let Some(ref dev_id) = selected_device_id {
                    if !alarm.devices.contains(dev_id) { continue; }
                }
                if alarm_should_fire_now(alarm, &chrono_now) {
                    alarm_to_fire = Some(alarm.id.clone());
                    break;
                }
            }
        }
    }

    if let Some(alarm_id) = alarm_to_fire {
        return Task::perform(async move { alarm_id }, Message::TriggerAlarm);
    }

    Task::none()
}

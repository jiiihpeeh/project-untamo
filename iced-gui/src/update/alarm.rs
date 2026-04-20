use crate::messages::Message;
use crate::state::{Alarm, AlarmOccurrence, AppPage, AppState, PendingDelete};
use iced::Task;
use super::helpers::*;

fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{:x}{:x}", duration.as_secs(), duration.subsec_nanos())
}

pub fn set_alarm_label(state: &mut AppState, label: String) -> Task<Message> {
    state.add_alarm.label = label;
    Task::none()
}

pub fn set_alarm_hour(state: &mut AppState, hour: u8) -> Task<Message> {
    state.add_alarm.time_hour = hour;
    Task::none()
}

pub fn set_alarm_minute(state: &mut AppState, minute: u8) -> Task<Message> {
    state.add_alarm.time_minute = minute;
    Task::none()
}

pub fn set_alarm_weekday(state: &mut AppState, bit: u8) -> Task<Message> {
    state.add_alarm.weekdays ^= bit;
    Task::none()
}

pub fn set_alarm_occurrence(state: &mut AppState, occ: AlarmOccurrence) -> Task<Message> {
    state.add_alarm.occurrence = occ;
    Task::none()
}

pub fn set_alarm_tune(state: &mut AppState, tune: String) -> Task<Message> {
    state.add_alarm.tune = tune;
    Task::none()
}

pub fn set_alarm_active(state: &mut AppState, val: bool) -> Task<Message> {
    state.add_alarm.active = val;
    Task::none()
}

pub fn set_alarm_close_task(state: &mut AppState, val: bool) -> Task<Message> {
    state.add_alarm.close_task = val;
    Task::none()
}

pub fn toggle_alarm_device(state: &mut AppState, id: String) -> Task<Message> {
    if state.add_alarm.devices.contains(&id) {
        state.add_alarm.devices.retain(|d| d != &id);
    } else {
        state.add_alarm.devices.push(id);
    }
    Task::none()
}

pub fn fetch_alarm_tunes(state: &mut AppState) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    Task::perform(
        async move {
            let client = http_client();
            match client
                .get(format!("{}/audio-resources/resource_list.json", server))
                .header("token", &token)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<Vec<String>>().await {
                        Ok(tunes) => Message::AlarmTunesReceived(tunes),
                        Err(_) => Message::AlarmTunesReceived(vec![]),
                    }
                }
                _ => Message::AlarmTunesReceived(vec![]),
            }
        },
        |m| m,
    )
}

pub fn alarm_tunes_received(state: &mut AppState, tunes: Vec<String>) -> Task<Message> {
    if !tunes.is_empty() {
        state.available_tunes = tunes;
    }
    Task::none()
}

pub fn submit_add_alarm(state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    state.add_alarm.previewing_tune = None;
    state.add_alarm.preview_started = false;
    let is_edit = state.add_alarm.editing_alarm_id.is_some();
    let occ_str = state.add_alarm.occurrence.as_str().to_string();
    let date_vec: Vec<u16> = {
        let d = state.add_alarm.date_picker_value;
        vec![d.year as u16, d.month as u16, d.day as u16]
    };
    let new_alarm = if let Some(ref edit_id) = state.add_alarm.editing_alarm_id {
        if let Some(existing) = state.alarms.iter().find(|a| a.id == *edit_id) {
            let mut updated = existing.clone();
            updated.occurrence = occ_str.clone();
            updated.time = vec![state.add_alarm.time_hour, state.add_alarm.time_minute];
            updated.weekdays = state.add_alarm.weekdays;
            updated.date = date_vec.clone();
            updated.label = state.add_alarm.label.clone();
            updated.tune = state.add_alarm.tune.clone();
            updated.active = state.add_alarm.active;
            updated.close_task = state.add_alarm.close_task;
            updated.devices = state.add_alarm.devices.clone();
            updated
        } else {
            Alarm {
                id: edit_id.clone(),
                occurrence: occ_str.clone(),
                time: vec![state.add_alarm.time_hour, state.add_alarm.time_minute],
                weekdays: state.add_alarm.weekdays,
                date: date_vec.clone(),
                label: state.add_alarm.label.clone(),
                devices: state.add_alarm.devices.clone(),
                snooze: vec![],
                tune: state.add_alarm.tune.clone(),
                active: state.add_alarm.active,
                modified: 0,
                fingerprint: String::new(),
                close_task: state.add_alarm.close_task,
            }
        }
    } else {
        Alarm {
            id: uuid_simple(),
            occurrence: occ_str,
            time: vec![state.add_alarm.time_hour, state.add_alarm.time_minute],
            weekdays: state.add_alarm.weekdays,
            date: date_vec,
            label: state.add_alarm.label.clone(),
            devices: state.add_alarm.devices.clone(),
            snooze: vec![],
            tune: state.add_alarm.tune.clone(),
            active: state.add_alarm.active,
            modified: 0,
            fingerprint: String::new(),
            close_task: state.add_alarm.close_task,
        }
    };

    state.show_add_alarm = false;
    state.add_alarm = crate::state::AddAlarmState::new();

    if is_edit {
        if let Some(existing) = state.alarms.iter_mut().find(|a| a.id == new_alarm.id) {
            *existing = new_alarm.clone();
        }
        add_notification_kind(state, "Alarm", "Alarm updated".to_string(), crate::state::NotificationKind::Success);
    } else {
        state.alarms.push(new_alarm.clone());
        add_notification_kind(state, "Alarm", "Alarm added".to_string(), crate::state::NotificationKind::Success);
    }

    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    let alarm_id = new_alarm.id.clone();
    let body_alarm = new_alarm;
    iced::Task::perform(
        async move {
            let client = http_client();
            let url = if is_edit {
                format!("{}/api/alarm/{}", server, alarm_id)
            } else {
                format!("{}/api/alarm", server)
            };
            let req = if is_edit {
                client.put(&url).header("token", &token).json(&body_alarm)
            } else {
                client.post(&url).header("token", &token).json(&body_alarm)
            };
            match req.send().await {
                Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                Ok(resp) => {
                    eprintln!("Alarm save failed: HTTP {}", resp.status());
                    Message::AlarmAddResult(Err(format!("HTTP {}", resp.status())))
                }
                Err(e) => {
                    eprintln!("Alarm save failed: {}", e);
                    Message::AlarmAddResult(Err(e.to_string()))
                }
            }
        },
        |m| m,
    )
}

pub fn cancel_add_alarm(state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    state.show_add_alarm = false;
    state.add_alarm = crate::state::AddAlarmState::new();
    Task::none()
}

pub fn toggle_alarm_pop(state: &mut AppState) -> Task<Message> {
    state.show_alarm_pop = !state.show_alarm_pop;
    Task::none()
}

pub fn reset_snooze(state: &mut AppState, alarm_id: String) -> Task<Message> {
    if let Some(alarm) = state.alarms.iter_mut().find(|a| a.id == alarm_id) {
        alarm.snooze.clear();
        let updated = alarm.clone();
        let server = state.server_address.clone();
        let token = state.ws.token.clone();
        return iced::Task::perform(
            async move {
                let client = http_client();
                match client
                    .put(format!("{}/api/alarm/{}", server, updated.id))
                    .header("token", &token)
                    .json(&updated)
                    .send()
                    .await
                {
                    Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                    Ok(resp) => Message::AlarmEditResult(Err(format!("HTTP {}", resp.status()))),
                    Err(e) => Message::AlarmEditResult(Err(e.to_string())),
                }
            },
            |m| m,
        );
    }
    Task::none()
}

pub fn trigger_alarm(state: &mut AppState, alarm_id: String) -> Task<Message> {
    if let Some(alarm) = state.alarms.iter().find(|a| a.id == alarm_id) {
        let tune = alarm.tune.clone();
        let alarm_id_clone = alarm_id.clone();
        state.playing_alarm = Some(alarm.clone());
        state.alarm_anim_start = Some(std::time::Instant::now());
        state.page = AppPage::PlayAlarm;

        let window_task = if let Some(id) = state.window_id {
            iced::window::gain_focus(id)
        } else {
            let (id, open_task) = iced::window::open(super::new_window_settings());
            state.window_id = Some(id);
            Task::batch([
                open_task.map(|id| Message::WindowIdReceived(Some(id))),
                iced::window::gain_focus(id),
            ])
        };

        let server = state.server_address.clone();
        let token = state.ws.token.clone();
        let audio_task = Task::perform(
            async move {
                let client = http_client();
                for ext in &["wav", "opus", "flac"] {
                    let url = format!("{}/audio-resources/{}.{}", server, tune, ext);
                    if let Ok(resp) = client.get(&url).header("token", &token).send().await {
                        if resp.status().is_success() {
                            if let Ok(bytes) = resp.bytes().await {
                                let tmp = std::env::temp_dir()
                                    .join(format!("untamo_alarm_{}.{}", alarm_id_clone, ext));
                                if std::fs::write(&tmp, &bytes).is_ok() {
                                    return Ok(tmp.to_string_lossy().into_owned());
                                }
                            }
                        }
                    }
                }
                Err(())
            },
            |result| match result {
                Ok(path) => Message::PlayAlarmAudio(path),
                Err(_) => Message::StopAudio,
            },
        );
        return Task::batch([window_task, audio_task]);
    }
    Task::none()
}

pub fn play_alarm_audio(state: &mut AppState, path: String) -> Task<Message> {
    let volume = state.settings.volume;
    if let Err(e) = crate::audio::play_audio_file(&path, volume, true) {
        eprintln!("Alarm audio play error: {}", e);
    }
    Task::none()
}

pub fn snooze_alarm(state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    let snoozed = state.playing_alarm.take();
    state.alarm_anim_start = None;
    state.snooze_press_start = None;
    state.page = AppPage::Alarms;

    if let Some(mut alarm) = snoozed {
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as i64;
        // Keep only snooze timestamps from the last hour (mirrors frontend)
        let one_hour_ago = now_ms - 3_600_000;
        alarm.snooze.retain(|&s| s > one_hour_ago);
        alarm.snooze.push(now_ms);
        if let Some(existing) = state.alarms.iter_mut().find(|a| a.id == alarm.id) {
            existing.snooze.clone_from(&alarm.snooze);
        }
        add_notification(state, "Alarm", "Snoozed".to_string());
        let server = state.server_address.clone();
        let token = state.ws.token.clone();
        return iced::Task::perform(
            async move {
                let client = http_client();
                match client
                    .put(format!("{}/api/alarm/{}", server, alarm.id))
                    .header("token", &token)
                    .json(&alarm)
                    .send()
                    .await
                {
                    Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                    Ok(resp) => Message::AlarmEditResult(Err(format!("HTTP {}", resp.status()))),
                    Err(e) => Message::AlarmEditResult(Err(e.to_string())),
                }
            },
            |m| m,
        );
    }
    Task::none()
}

pub fn snooze_press_start(state: &mut AppState) -> Task<Message> {
    state.snooze_press_start = Some(std::time::Instant::now());
    Task::none()
}

pub fn snooze_press_end(state: &mut AppState) -> Task<Message> {
    if let Some(start) = state.snooze_press_start.take() {
        let required = std::time::Duration::from_millis(state.settings.snooze_press_ms as u64);
        if start.elapsed() >= required {
            return Task::perform(async {}, |_| Message::SnoozeAlarm);
        }
    }
    Task::none()
}

pub fn dismiss_alarm(state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    let dismissed_alarm = state.playing_alarm.take();
    let turn_off = state.turn_off;
    state.turn_off = false;
    state.alarm_anim_start = Some(std::time::Instant::now());
    state.snooze_press_start = None;
    state.page = AppPage::Alarms;

    // If "Turn alarm OFF" was checked, deactivate the alarm on the server.
    if turn_off {
        if let Some(mut alarm) = dismissed_alarm {
            alarm.active = false;
            if let Some(existing) = state.alarms.iter_mut().find(|a| a.id == alarm.id) {
                existing.active = false;
            }
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            return iced::Task::perform(
                async move {
                    let client = http_client();
                    match client
                        .put(format!("{}/api/alarm/{}", server, alarm.id))
                        .header("token", &token)
                        .json(&alarm)
                        .send()
                        .await
                    {
                        Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                        Ok(resp) => Message::AlarmEditResult(Err(format!("HTTP {}", resp.status()))),
                        Err(e) => Message::AlarmEditResult(Err(e.to_string())),
                    }
                },
                |m| m,
            );
        }
    }
    Task::none()
}

pub fn set_turn_off(state: &mut AppState, value: bool) -> Task<Message> {
    state.turn_off = value;
    if value {
        return Task::perform(
            async {
                tokio::time::sleep(std::time::Duration::from_millis(300)).await;
            },
            |_| Message::DismissAlarm,
        );
    }
    Task::none()
}

pub fn set_snooze_minutes(state: &mut AppState, minutes: u32) -> Task<Message> {
    state.snooze_minutes = minutes;
    Task::none()
}

pub fn alarm_hovered(state: &mut AppState, id: String) -> Task<Message> {
    state.hovered_alarm = Some(id);
    Task::none()
}

pub fn alarm_unhovered(state: &mut AppState) -> Task<Message> {
    state.hovered_alarm = None;
    Task::none()
}

pub fn edit_alarm(state: &mut AppState, id: String) -> Task<Message> {
    if let Some(alarm) = state.alarms.iter().find(|a| a.id == id) {
        state.add_alarm = crate::state::AddAlarmState::from_alarm(alarm);
        state.show_add_alarm = true;
        return Task::perform(async {}, |_| Message::FetchAlarmTunes);
    }
    Task::none()
}

pub fn delete_alarm(state: &mut AppState, id: String) -> Task<Message> {
    state.pending_delete = Some(PendingDelete::Alarm(id));
    Task::none()
}

pub fn toggle_alarm_active(state: &mut AppState, id: String) -> Task<Message> {
    if let Some(alarm) = state.alarms.iter_mut().find(|a| a.id == id) {
        alarm.active = !alarm.active;
        let updated = alarm.clone();
        let server = state.server_address.clone();
        let token = state.ws.token.clone();
        iced::Task::perform(
            async move {
                let client = http_client();
                match client
                    .put(format!("{}/api/alarm/{}", server, updated.id))
                    .header("token", token)
                    .json(&updated)
                    .send()
                    .await
                {
                    Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                    Ok(resp) => Message::AlarmEditResult(Err(format!("HTTP {}", resp.status()))),
                    Err(e) => Message::AlarmEditResult(Err(e.to_string())),
                }
            },
            |m| m,
        )
    } else {
        Task::none()
    }
}

pub fn alarm_add_result(state: &mut AppState, result: Result<Option<Alarm>, String>) -> Task<Message> {
    if let Err(e) = result {
        add_notification_kind(state, "Alarm Error", format!("Failed to add alarm: {}", e), crate::state::NotificationKind::Error);
    }
    Task::none()
}

pub fn alarm_edit_result(state: &mut AppState, result: Result<Option<Alarm>, String>) -> Task<Message> {
    if let Err(e) = result {
        add_notification_kind(state, "Alarm Error", format!("Failed to update alarm: {}", e), crate::state::NotificationKind::Error);
    }
    Task::none()
}

pub fn alarm_delete_result(state: &mut AppState, result: Result<(), String>) -> Task<Message> {
    if let Err(e) = result {
        add_notification_kind(state, "Alarm Error", format!("Failed to delete alarm: {}", e), crate::state::NotificationKind::Error);
    }
    Task::none()
}

pub fn request_delete(state: &mut AppState, pending: PendingDelete) -> Task<Message> {
    state.pending_delete = Some(pending);
    Task::none()
}

pub fn cancel_delete(state: &mut AppState) -> Task<Message> {
    state.pending_delete = None;
    Task::none()
}

pub fn confirm_delete(state: &mut AppState) -> Task<Message> {
    let pending = state.pending_delete.take();
    match pending {
        Some(PendingDelete::Alarm(id)) => {
            state.alarms.retain(|a| a.id != id);
            state.toggle_anims.remove(&id);
            add_notification(state, "Alarm Deleted", "Alarm removed successfully".to_string());
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            iced::Task::perform(
                async move {
                    let client = http_client();
                    match client
                        .delete(format!("{}/api/alarm/{}", server, id))
                        .header("token", token)
                        .send()
                        .await
                    {
                        Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                        Ok(resp) => Message::AlarmDeleteResult(Err(format!("HTTP {}", resp.status()))),
                        Err(e) => Message::AlarmDeleteResult(Err(e.to_string())),
                    }
                },
                |m| m,
            )
        }
        Some(PendingDelete::Device(id)) => {
            if let Some(pos) = state.devices.iter().position(|d| d.id == id) {
                state.devices.remove(pos);
                add_notification_kind(state, "Device Deleted", "Device removed".to_string(), crate::state::NotificationKind::Success);
            }
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            iced::Task::perform(
                async move {
                    let client = http_client();
                    let _ = client
                        .delete(format!("{}/api/device/{}", server, id))
                        .header("token", &token)
                        .send()
                        .await;
                },
                |_| Message::FetchUpdate,
            )
        }
        None => Task::none(),
    }
}

pub fn preview_tune(state: &mut AppState, tune: String) -> Task<Message> {
    if state.add_alarm.previewing_tune.as_deref() == Some(tune.as_str()) {
        // Toggle off
        crate::audio::stop_audio();
        state.add_alarm.previewing_tune = None;
        state.add_alarm.preview_started = false;
        return Task::none();
    }
    crate::audio::stop_audio();
    state.add_alarm.previewing_tune = Some(tune.clone());
    state.add_alarm.preview_started = false;
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    Task::perform(
        async move {
            let client = http_client();
            for ext in &["wav", "opus", "flac"] {
                let url = format!("{}/audio-resources/{}.{}", server, tune, ext);
                if let Ok(resp) = client.get(&url).header("token", &token).send().await {
                    if resp.status().is_success() {
                        if let Ok(bytes) = resp.bytes().await {
                            let tmp = std::env::temp_dir()
                                .join(format!("untamo_preview.{}", ext));
                            if std::fs::write(&tmp, &bytes).is_ok() {
                                return Ok(tmp.to_string_lossy().into_owned());
                            }
                        }
                    }
                }
            }
            Err(())
        },
        |result| match result {
            Ok(path) => Message::PlayPreviewAudio(path),
            Err(_) => Message::StopPreviewTune,
        },
    )
}

pub fn stop_preview_tune(state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    state.add_alarm.previewing_tune = None;
    state.add_alarm.preview_started = false;
    Task::none()
}

pub fn play_preview_audio(state: &mut AppState, path: String) -> Task<Message> {
    let volume = state.settings.volume;
    if let Err(e) = crate::audio::play_audio_file(&path, volume, false) {
        eprintln!("Preview play error: {}", e);
        state.add_alarm.previewing_tune = None;
    }
    state.add_alarm.preview_started = true;
    Task::none()
}

pub fn play_audio(state: &mut AppState, path: String) -> Task<Message> {
    let volume = state.settings.volume;
    if let Err(e) = crate::audio::play_audio_file(&path, volume, false) {
        eprintln!("Audio play error: {}", e);
    }
    Task::none()
}

pub fn stop_audio(_state: &mut AppState) -> Task<Message> {
    crate::audio::stop_audio();
    Task::none()
}

pub fn toggle_add_alarm(state: &mut AppState) -> Task<Message> {
    state.show_add_alarm = !state.show_add_alarm;
    if state.show_add_alarm {
        state.add_alarm = crate::state::AddAlarmState::new();
        return Task::perform(async {}, |_| Message::FetchAlarmTunes);
    }
    Task::none()
}

pub fn open_time_picker(state: &mut AppState) -> Task<Message> {
    state.add_alarm.show_time_picker = true;
    Task::none()
}

pub fn cancel_time_picker(state: &mut AppState) -> Task<Message> {
    state.add_alarm.show_time_picker = false;
    Task::none()
}

pub fn submit_time_picker(state: &mut AppState, time: iced_aw::time_picker::Time) -> Task<Message> {
    state.add_alarm.show_time_picker = false;
    use iced_aw::time_picker::Time as IcedTime;
    let (h, m) = match time {
        IcedTime::Hm { hour, minute, .. } => (hour as u8, minute as u8),
        IcedTime::Hms { hour, minute, .. } => (hour as u8, minute as u8),
    };
    state.add_alarm.time_hour = h;
    state.add_alarm.time_minute = m;
    state.add_alarm.time_picker_value = time;
    Task::none()
}

pub fn open_date_picker(state: &mut AppState) -> Task<Message> {
    state.add_alarm.show_date_picker = true;
    Task::none()
}

pub fn cancel_date_picker(state: &mut AppState) -> Task<Message> {
    state.add_alarm.show_date_picker = false;
    Task::none()
}

pub fn submit_date_picker(state: &mut AppState, date: iced_aw::date_picker::Date) -> Task<Message> {
    state.add_alarm.show_date_picker = false;
    state.add_alarm.date_picker_value = date;
    Task::none()
}

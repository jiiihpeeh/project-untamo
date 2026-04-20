use super::helpers::*;
use crate::messages::Message;
use crate::state::{AppState, CardColors};
use iced::Task;

// ── Color picker helpers ──────────────────────────────────────────────────────

pub(super) fn current_color_hex(settings: &crate::state::SettingsState) -> String {
    match settings.color_mode {
        crate::state::ColorMode::EvenIndex => settings.card_colors.even.clone(),
        crate::state::ColorMode::OddIndex => settings.card_colors.odd.clone(),
        crate::state::ColorMode::Inactive => settings.card_colors.inactive.clone(),
        crate::state::ColorMode::Background => settings.card_colors.background.clone(),
    }
}

pub(super) fn apply_current_color(settings: &mut crate::state::SettingsState, hex: String) {
    match settings.color_mode {
        crate::state::ColorMode::EvenIndex => settings.card_colors.even = hex,
        crate::state::ColorMode::OddIndex => settings.card_colors.odd = hex,
        crate::state::ColorMode::Inactive => settings.card_colors.inactive = hex,
        crate::state::ColorMode::Background => settings.card_colors.background = hex,
    }
}

pub(super) fn hex_to_rgb_f(hex: &str) -> (f32, f32, f32) {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255) as f32 / 255.0;
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255) as f32 / 255.0;
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255) as f32 / 255.0;
        (r, g, b)
    } else {
        (1.0, 1.0, 1.0)
    }
}

pub(super) fn hex_to_hsv(hex: &str) -> (f32, f32, f32) {
    let (r, g, b) = hex_to_rgb_f(hex);
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let delta = max - min;
    let v = max;
    let s = if max > 0.001 { delta / max } else { 0.0 };
    let h = if delta < 0.001 {
        0.0
    } else if (max - r).abs() < 0.001 {
        let h = 60.0 * ((g - b) / delta);
        if h < 0.0 {
            h + 360.0
        } else {
            h
        }
    } else if (max - g).abs() < 0.001 {
        60.0 * ((b - r) / delta + 2.0)
    } else {
        60.0 * ((r - g) / delta + 4.0)
    };
    (h, s, v)
}

pub(super) fn hex_to_hue(hex: &str) -> f32 {
    hex_to_hsv(hex).0
}

pub(super) fn hsv_to_hex(h: f32, s: f32, v: f32) -> String {
    let h = h % 360.0;
    let c = v * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = v - c;
    let (r, g, b) = if h < 60.0 {
        (c, x, 0.0)
    } else if h < 120.0 {
        (x, c, 0.0)
    } else if h < 180.0 {
        (0.0, c, x)
    } else if h < 240.0 {
        (0.0, x, c)
    } else if h < 300.0 {
        (x, 0.0, c)
    } else {
        (c, 0.0, x)
    };
    format!(
        "#{:02x}{:02x}{:02x}",
        ((r + m) * 255.0).round() as u8,
        ((g + m) * 255.0).round() as u8,
        ((b + m) * 255.0).round() as u8,
    )
}

pub(super) fn hex_to_color(hex: &str) -> iced::Color {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255) as f32 / 255.0;
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255) as f32 / 255.0;
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255) as f32 / 255.0;
        iced::Color::from_rgb(r, g, b)
    } else {
        iced::Color::WHITE
    }
}

pub(super) fn color_to_hex(color: iced::Color) -> String {
    let r = (color.r * 255.0).round() as u8;
    let g = (color.g * 255.0).round() as u8;
    let b = (color.b * 255.0).round() as u8;
    format!("#{:02X}{:02X}{:02X}", r, g, b)
}

// ── Handlers ─────────────────────────────────────────────────────────────────

pub fn toggle_settings(state: &mut AppState) -> Task<Message> {
    state.settings.show_settings = !state.settings.show_settings;
    Task::none()
}

pub fn toggle_clock24(state: &mut AppState) -> Task<Message> {
    state.settings.clock24 = !state.settings.clock24;
    state.welcome.clock24 = state.settings.clock24;
    save_settings_from_state(state);
    Task::none()
}

pub fn set_nav_bar_top(state: &mut AppState, value: bool) -> Task<Message> {
    state.settings.nav_bar_top = value;
    save_settings_from_state(state);
    Task::none()
}

pub fn set_panel_size(state: &mut AppState, size: u32) -> Task<Message> {
    state.settings.panel_size = size;
    save_settings_from_state(state);
    Task::none()
}

pub fn set_volume(state: &mut AppState, volume: f32) -> Task<Message> {
    state.settings.volume = volume;
    crate::audio::set_audio_volume(volume);
    save_settings_from_state(state);
    Task::none()
}

pub fn set_dialog_size(state: &mut AppState, size: u32) -> Task<Message> {
    state.settings.dialog_size = size;
    Task::none()
}

pub fn set_close_task_behavior(
    state: &mut AppState,
    behavior: crate::state::CloseTaskBehavior,
) -> Task<Message> {
    state.settings.close_task_behavior = behavior;
    Task::none()
}

pub fn set_snooze_press_ms(state: &mut AppState, ms: u32) -> Task<Message> {
    state.settings.snooze_press_ms = ms;
    Task::none()
}

pub fn set_notifications_enabled(state: &mut AppState, enabled: bool) -> Task<Message> {
    state.settings.notifications_enabled = enabled;
    save_settings_from_state(state);
    Task::none()
}

pub fn set_desktop_notifications_enabled(state: &mut AppState, enabled: bool) -> Task<Message> {
    state.settings.desktop_notifications = enabled;
    save_settings_from_state(state);
    Task::none()
}

pub fn toggle_colors(state: &mut AppState) -> Task<Message> {
    state.settings.show_colors = !state.settings.show_colors;
    if state.settings.show_colors {
        // Sync picker hue from the currently selected color
        let hex = current_color_hex(&state.settings);
        state.settings.picker_h = hex_to_hue(&hex);
    }
    Task::none()
}

pub fn set_color_mode(state: &mut AppState, mode: crate::state::ColorMode) -> Task<Message> {
    state.settings.color_mode = mode;
    // Sync picker hue from the newly selected color's hex
    let hex = current_color_hex(&state.settings);
    state.settings.picker_h = hex_to_hue(&hex);
    Task::none()
}

pub fn set_card_color_even(state: &mut AppState, color: String) -> Task<Message> {
    state.settings.card_colors.even = color;
    Task::none()
}

pub fn set_card_color_odd(state: &mut AppState, color: String) -> Task<Message> {
    state.settings.card_colors.odd = color;
    Task::none()
}

pub fn set_card_color_inactive(state: &mut AppState, color: String) -> Task<Message> {
    state.settings.card_colors.inactive = color;
    Task::none()
}

pub fn set_card_color_background(state: &mut AppState, color: String) -> Task<Message> {
    state.settings.card_colors.background = color;
    Task::none()
}

pub fn set_default_card_colors(state: &mut AppState) -> Task<Message> {
    state.settings.card_colors = CardColors::default();
    Task::none()
}

pub fn set_current_card_color(state: &mut AppState, hex: String) -> Task<Message> {
    match state.settings.color_mode {
        crate::state::ColorMode::EvenIndex => state.settings.card_colors.even = hex,
        crate::state::ColorMode::OddIndex => state.settings.card_colors.odd = hex,
        crate::state::ColorMode::Inactive => state.settings.card_colors.inactive = hex,
        crate::state::ColorMode::Background => state.settings.card_colors.background = hex,
    }
    Task::none()
}

pub fn set_color_hue(state: &mut AppState, h: f32) -> Task<Message> {
    state.settings.picker_h = h;
    // Keep current s/v, update hex
    let hex = current_color_hex(&state.settings);
    let (_, s, v) = hex_to_hsv(&hex);
    let new_hex = hsv_to_hex(h, s, v);
    apply_current_color(&mut state.settings, new_hex);
    Task::none()
}

pub fn set_color_sv(state: &mut AppState, s: f32, v: f32) -> Task<Message> {
    let h = state.settings.picker_h;
    let new_hex = hsv_to_hex(h, s, v);
    apply_current_color(&mut state.settings, new_hex);
    Task::none()
}

pub fn open_color_picker(state: &mut AppState) -> Task<Message> {
    let hex = match state.settings.color_mode {
        crate::state::ColorMode::EvenIndex => &state.settings.card_colors.even,
        crate::state::ColorMode::OddIndex => &state.settings.card_colors.odd,
        crate::state::ColorMode::Inactive => &state.settings.card_colors.inactive,
        crate::state::ColorMode::Background => &state.settings.card_colors.background,
    };
    state.settings.color_picker_value = hex_to_color(hex);
    state.settings.show_color_picker = true;
    Task::none()
}

pub fn cancel_color_picker(state: &mut AppState) -> Task<Message> {
    state.settings.show_color_picker = false;
    Task::none()
}

pub fn submit_color_picker(state: &mut AppState, color: iced::Color) -> Task<Message> {
    let hex = color_to_hex(color);
    match state.settings.color_mode {
        crate::state::ColorMode::EvenIndex => state.settings.card_colors.even = hex,
        crate::state::ColorMode::OddIndex => state.settings.card_colors.odd = hex,
        crate::state::ColorMode::Inactive => state.settings.card_colors.inactive = hex,
        crate::state::ColorMode::Background => state.settings.card_colors.background = hex,
    }
    state.settings.show_color_picker = false;
    Task::none()
}

pub fn dismiss_notification(state: &mut AppState, index: usize) -> Task<Message> {
    if index < state.notifications.len() {
        state.notifications.remove(index);
    }
    Task::none()
}

pub fn show_notification(state: &mut AppState, title: String, msg: String) -> Task<Message> {
    add_notification(state, &title, msg);
    Task::none()
}

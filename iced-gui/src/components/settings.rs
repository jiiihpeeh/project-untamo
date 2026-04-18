use crate::messages::Message;
use crate::state::{CloseTaskBehavior, SettingsState};
use crate::theme::{
    card_container_style, danger_button, menu_style, pick_list_style, primary_button,
    secondary_button, COLORS,
};
use iced::{
    widget::{button, column, container, pick_list, row, slider, text, toggler},
    Element, Length,
};

fn section_label(label: &str) -> iced::widget::Text<'static> {
    text(label.to_string())
        .size(13)
        .color(COLORS.text_secondary)
}

fn row_setting<'a>(
    label: impl Into<String>,
    control: Element<'a, Message>,
) -> Element<'a, Message> {
    row![
        text(label.into())
            .size(14)
            .color(COLORS.text)
            .width(Length::Fixed(200.0)),
        control,
    ]
    .align_y(iced::Alignment::Center)
    .spacing(12)
    .into()
}

pub fn settings_dialog<'a>(state: &'a SettingsState) -> Element<'a, Message> {
    let title = row![
        text("Settings")
            .size(20)
            .color(COLORS.text)
            .width(Length::Fill),
        button(text("✕").size(14))
            .on_press(Message::ToggleSettings)
            .style(secondary_button())
            .padding([4, 8]),
    ]
    .align_y(iced::Alignment::Center);

    // --- Toolbar position ---
    let nav_top_btn = button(text("Top").size(13))
        .on_press(Message::SetNavBarTop(true))
        .style(if state.nav_bar_top {
            primary_button()
        } else {
            secondary_button()
        });
    let nav_bot_btn = button(text("Bottom").size(13))
        .on_press(Message::SetNavBarTop(false))
        .style(if !state.nav_bar_top {
            primary_button()
        } else {
            secondary_button()
        });
    let nav_row = row![nav_top_btn, nav_bot_btn].spacing(6);

    // --- Panel size ---
    let panel_label = text(format!("Panel Size: {}px", state.panel_size))
        .size(14)
        .color(COLORS.text);
    let panel_slider = slider(25.0..=80.0, state.panel_size as f32, |v| {
        Message::SetPanelSize(v as u32)
    })
    .width(Length::Fill);

    // --- Time format ---
    let clock_24_btn = button(text("24 h").size(13))
        .on_press(Message::ToggleClock24)
        .style(if state.clock24 {
            primary_button()
        } else {
            secondary_button()
        });
    let clock_12_btn = button(text("12 h").size(13))
        .on_press(Message::ToggleClock24)
        .style(if !state.clock24 {
            primary_button()
        } else {
            secondary_button()
        });
    let clock_row = row![clock_24_btn, clock_12_btn].spacing(6);

    // --- Volume ---
    let vol_label = text(format!("Volume: {:.0}%", state.volume * 100.0))
        .size(14)
        .color(COLORS.text);
    let vol_slider = slider(0.0..=1.0, state.volume, Message::SetVolume)
        .step(0.01f32)
        .width(Length::Fill);

    // --- Snooze press time ---
    let snooze_label = text(format!("Snooze hold: {} ms", state.snooze_press_ms))
        .size(14)
        .color(COLORS.text);
    let snooze_slider = slider(3.0..=800.0, state.snooze_press_ms as f32, |v| {
        Message::SetSnoozePressMs(v as u32)
    })
    .width(Length::Fill);

    // --- Close Task behavior ---
    let close_task_picker = pick_list(
        CloseTaskBehavior::all(),
        Some(&state.close_task_behavior),
        Message::SetCloseTaskBehavior,
    )
    .width(Length::Fill)
    .style(pick_list_style())
    .menu_style(menu_style());

    // --- Notifications ---
    let notif_toggler = toggler(state.notifications_enabled)
        .label(if state.notifications_enabled {
            "Toast"
        } else {
            "None"
        })
        .on_toggle(Message::SetNotificationsEnabled);

    // --- Alarm colors ---
    let colors_btn = button(text("Set Alarm Colors").size(13))
        .on_press(Message::ToggleColors)
        .style(secondary_button())
        .width(Length::Fill);

    // --- Logout ---
    let logout_btn = button(text("Log Out").size(13))
        .on_press(Message::GoToLogout)
        .style(danger_button())
        .width(Length::Fill);

    let content = column![
        title,
        text("").size(8),
        // Toolbar
        section_label("TOOLBAR POSITION"),
        nav_row,
        text("").size(8),
        // Panel size
        section_label("PANEL SIZE"),
        panel_label,
        panel_slider,
        text("").size(8),
        // Time format
        section_label("TIME FORMAT"),
        clock_row,
        text("").size(8),
        // Volume
        section_label("ALARM VOLUME"),
        vol_label,
        vol_slider,
        text("").size(8),
        // Snooze press
        section_label("SNOOZE HOLD TIME"),
        snooze_label,
        snooze_slider,
        text("").size(8),
        // Close task
        section_label("CLOSE TASK BEHAVIOR"),
        close_task_picker,
        text("").size(8),
        // Notifications
        section_label("NOTIFICATIONS"),
        notif_toggler,
        text("").size(8),
        // Alarm colors
        section_label("ALARM CARD COLORS"),
        colors_btn,
        text("").size(24),
        // Logout
        logout_btn,
    ]
    .spacing(4)
    .padding(24)
    .width(Length::Fill);

    container(content)
        .max_width(440)
        .padding(8)
        .style(card_container_style())
        .into()
}

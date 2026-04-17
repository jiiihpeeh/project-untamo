use crate::messages::Message;
use crate::state::SettingsState;
use crate::theme::{card_container_style, secondary_button, COLORS};
use iced::{
    widget::{button, column, container, row, slider, text},
    Element, Length,
};

pub fn settings_dialog<'a>(state: &'a SettingsState) -> Element<'a, Message> {
    let title = text("Settings").size(24).color(COLORS.text);

    let nav_bar_label = text("Toolbar Position").size(14).color(COLORS.text);
    let nav_bar_top_btn = button(text("Top"))
        .on_press(Message::SetNavBarTop(true))
        .style(secondary_button());
    let nav_bar_bottom_btn = button(text("Bottom"))
        .on_press(Message::SetNavBarTop(false))
        .style(secondary_button());

    let panel_size_label = text(format!("Panel Size: {}px", state.panel_size))
        .size(14)
        .color(COLORS.text);
    let panel_slider = slider(25.0..=80.0, state.panel_size as f32, |v| {
        Message::SetPanelSize(v as u32)
    })
    .width(Length::Fixed(280.0));

    let clock_label = text("Time Format").size(14).color(COLORS.text);
    let clock_24h_btn = button(text("24h"))
        .on_press(Message::ToggleClock24)
        .style(secondary_button());
    let clock_12h_btn = button(text("12h"))
        .on_press(Message::ToggleClock24)
        .style(secondary_button());

    let volume_label = text(format!("Volume: {:.0}%", state.volume * 100.0))
        .size(14)
        .color(COLORS.text);
    let volume_slider = slider(0.0..=1.0, state.volume, |v| Message::SetVolume(v as f32))
        .width(Length::Fixed(280.0));

    let colors_btn = button(text("Alarm Colors"))
        .on_press(Message::ToggleColors)
        .style(secondary_button());

    let close_btn = button(text("Close"))
        .on_press(Message::ToggleSettings)
        .style(secondary_button());

    let content = column![
        title,
        text("").size(16),
        nav_bar_label,
        text("").size(8),
        row![nav_bar_top_btn, nav_bar_bottom_btn].spacing(10),
        text("").size(16),
        panel_size_label,
        text("").size(8),
        panel_slider,
        text("").size(16),
        clock_label,
        text("").size(8),
        row![clock_24h_btn, clock_12h_btn].spacing(10),
        text("").size(16),
        volume_label,
        text("").size(8),
        volume_slider,
        text("").size(24),
        colors_btn,
        text("").size(16),
        close_btn,
    ]
    .spacing(4)
    .padding(24)
    .align_x(iced::Alignment::Center);

    container(content)
        .max_width(400)
        .padding(20)
        .style(card_container_style())
        .into()
}

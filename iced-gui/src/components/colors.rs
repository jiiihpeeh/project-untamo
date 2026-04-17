use crate::messages::Message;
use crate::state::{ColorMode, SettingsState};
use crate::theme::{card_container_style, primary_button, secondary_button, COLORS};
use iced::widget::{button, column, container, row, text};
use iced::{Background, Element};
use iced_aw::helpers::color_picker;

pub fn colors_dialog<'a>(state: &'a SettingsState) -> Element<'a, Message> {
    let title = text("Set Alarm Colors").size(24).color(COLORS.text);

    let mode = &state.color_mode;

    let current_color = match mode {
        ColorMode::Even => &state.card_colors.even,
        ColorMode::Odd => &state.card_colors.odd,
        ColorMode::Inactive => &state.card_colors.inactive,
        ColorMode::Background => &state.card_colors.background,
    };

    let preview_bg = parse_hex_to_color(current_color);
    let text_color = if is_dark_color(current_color) {
        COLORS.text
    } else {
        COLORS.text_secondary
    };

    let color_preview = container(text("Preview").size(14).color(text_color))
        .style(move |_| iced::widget::container::Style {
            background: Some(Background::Color(preview_bg)),
            ..Default::default()
        })
        .padding(20)
        .width(iced::Length::Fixed(200.0));

    let color_info = text(format!("{}: {}", mode.as_str(), current_color)).size(14);

    let make_select_btn =
        |m: ColorMode| button(text(m.as_str())).on_press(Message::SetColorMode(m));

    let select_even = make_select_btn(ColorMode::Even);
    let select_odd = make_select_btn(ColorMode::Odd);
    let select_inactive = make_select_btn(ColorMode::Inactive);
    let select_background = make_select_btn(ColorMode::Background);

    let color_btn = button(text("Choose Color"))
        .on_press(Message::OpenColorPicker)
        .style(primary_button());

    let color_picker_overlay = color_picker(
        state.show_color_picker,
        state.color_picker_value,
        color_btn,
        Message::CancelColorPicker,
        |c| Message::SubmitColorPicker(c),
    );

    let default_btn = button(text("Default Colors"))
        .on_press(Message::SetDefaultCardColors)
        .style(secondary_button());
    let close_btn = button(text("Close"))
        .on_press(Message::ToggleColors)
        .style(secondary_button());

    let content = column![
        title,
        text("").size(12),
        color_preview,
        text("").size(8),
        color_info,
        text("").size(16),
        text("Select color to edit:").size(14),
        text("").size(8),
        row![select_even, select_odd, select_inactive, select_background].spacing(8),
        text("").size(16),
        color_picker_overlay,
        text("").size(24),
        default_btn,
        text("").size(12),
        close_btn,
    ]
    .spacing(4)
    .padding(24)
    .align_x(iced::Alignment::Center);

    container(content)
        .max_width(380)
        .padding(20)
        .style(card_container_style())
        .into()
}

fn parse_hex_to_color(hex: &str) -> iced::Color {
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

fn is_dark_color(hex: &str) -> bool {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255);
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255);
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255);
        let luminance = 0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32;
        luminance < 128.0
    } else {
        false
    }
}

use crate::messages::Message;
use crate::state::{ColorMode, SettingsState};
use iced::{
    widget::{button, column, container, row, text},
    Color, Element,
};

pub fn colors_dialog<'a>(state: &'a SettingsState) -> Element<'a, Message> {
    let title = text("Set Alarm Colors").size(24);

    let mode = &state.color_mode;

    let current_color = match mode {
        ColorMode::Even => &state.card_colors.even,
        ColorMode::Odd => &state.card_colors.odd,
        ColorMode::Inactive => &state.card_colors.inactive,
        ColorMode::Background => &state.card_colors.background,
    };

    let color_preview =
        container(text("    Preview    ").size(14)).style(|_| iced::widget::container::Style {
            background: Some(iced::Background::Color(parse_hex_color(current_color))),
            ..iced::widget::container::Style::default()
        });

    let color_info = text(format!("{}: {}", mode.as_str(), current_color)).size(14);

    let make_select_btn =
        |m: ColorMode| button(text(m.as_str())).on_press(Message::SetColorMode(m));

    let select_even = make_select_btn(ColorMode::Even);
    let select_odd = make_select_btn(ColorMode::Odd);
    let select_inactive = make_select_btn(ColorMode::Inactive);
    let select_background = make_select_btn(ColorMode::Background);

    let make_color_btn =
        |label: &'static str, adjust: Message| button(text(label)).on_press(adjust);

    let adjust_even_r = make_color_btn(
        "R+",
        Message::SetCardColorEven(adjust_color(&state.card_colors.even, 0, 16)),
    );
    let adjust_even_g = make_color_btn(
        "G+",
        Message::SetCardColorEven(adjust_color(&state.card_colors.even, 1, 16)),
    );
    let adjust_even_b = make_color_btn(
        "B+",
        Message::SetCardColorEven(adjust_color(&state.card_colors.even, 2, 16)),
    );

    let adjust_odd_r = make_color_btn(
        "R+",
        Message::SetCardColorOdd(adjust_color(&state.card_colors.odd, 0, 16)),
    );
    let adjust_odd_g = make_color_btn(
        "G+",
        Message::SetCardColorOdd(adjust_color(&state.card_colors.odd, 1, 16)),
    );
    let adjust_odd_b = make_color_btn(
        "B+",
        Message::SetCardColorOdd(adjust_color(&state.card_colors.odd, 2, 16)),
    );

    let adjust_inactive_r = make_color_btn(
        "R+",
        Message::SetCardColorInactive(adjust_color(&state.card_colors.inactive, 0, 16)),
    );
    let adjust_inactive_g = make_color_btn(
        "G+",
        Message::SetCardColorInactive(adjust_color(&state.card_colors.inactive, 1, 16)),
    );
    let adjust_inactive_b = make_color_btn(
        "B+",
        Message::SetCardColorInactive(adjust_color(&state.card_colors.inactive, 2, 16)),
    );

    let adjust_bg_r = make_color_btn(
        "R+",
        Message::SetCardColorBackground(adjust_color(&state.card_colors.background, 0, 16)),
    );
    let adjust_bg_g = make_color_btn(
        "G+",
        Message::SetCardColorBackground(adjust_color(&state.card_colors.background, 1, 16)),
    );
    let adjust_bg_b = make_color_btn(
        "B+",
        Message::SetCardColorBackground(adjust_color(&state.card_colors.background, 2, 16)),
    );

    let default_btn = button(text("Default Colors")).on_press(Message::SetDefaultCardColors);
    let close_btn = button(text("Close")).on_press(Message::ToggleColors);

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
        text("Adjust colors:").size(14),
        text("").size(8),
        row![adjust_even_r, adjust_even_g, adjust_even_b].spacing(5),
        text("").size(4),
        row![adjust_odd_r, adjust_odd_g, adjust_odd_b].spacing(5),
        text("").size(4),
        row![adjust_inactive_r, adjust_inactive_g, adjust_inactive_b].spacing(5),
        text("").size(4),
        row![adjust_bg_r, adjust_bg_g, adjust_bg_b].spacing(5),
        text("").size(24),
        default_btn,
        text("").size(12),
        close_btn,
    ]
    .spacing(4)
    .padding(24)
    .align_x(iced::Alignment::Center);

    container(content).max_width(380).padding(20).into()
}

fn parse_hex_color(hex: &str) -> Color {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255) as f32 / 255.0;
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255) as f32 / 255.0;
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255) as f32 / 255.0;
        Color::from_rgb(r, g, b)
    } else {
        Color::WHITE
    }
}

fn adjust_color(hex: &str, channel: usize, delta: i32) -> String {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let mut r = i32::from_str_radix(&hex[0..2], 16).unwrap_or(255);
        let mut g = i32::from_str_radix(&hex[2..4], 16).unwrap_or(255);
        let mut b = i32::from_str_radix(&hex[4..6], 16).unwrap_or(255);

        match channel {
            0 => r = (r + delta).clamp(0, 255),
            1 => g = (g + delta).clamp(0, 255),
            2 => b = (b + delta).clamp(0, 255),
            _ => {}
        }

        format!("#{:02x}{:02x}{:02x}", r, g, b)
    } else {
        hex.to_string()
    }
}

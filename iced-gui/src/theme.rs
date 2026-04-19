use iced::{widget::button, Background, Color, Theme};

pub fn hex_to_color(hex: &str) -> Color {
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
use iced::widget::overlay::menu;

pub const COLORS: ColorPalette = ColorPalette {
    primary: Color::from_rgb(0.192, 0.510, 0.812),
    primary_hover: Color::from_rgb(0.169, 0.424, 0.690),
    success: Color::from_rgb(0.220, 0.631, 0.412),
    danger: Color::from_rgb(0.898, 0.243, 0.243),
    danger_hover: Color::from_rgb(0.773, 0.188, 0.188),
    bg: Color::from_rgb(1.0, 1.0, 1.0),
    bg_secondary: Color::from_rgb(0.969, 0.980, 0.988),
    border: Color::from_rgb(0.886, 0.910, 0.941),
    text: Color::from_rgb(0.102, 0.102, 0.102),
    text_secondary: Color::from_rgb(0.467, 0.545, 0.573),
    card_btn: Color::from_rgb(0.929, 0.949, 0.965),
    card_btn_hover: Color::from_rgb(0.886, 0.910, 0.941),
};

#[derive(Clone, Copy)]
pub struct ColorPalette {
    pub primary: Color,
    pub primary_hover: Color,
    pub success: Color,
    pub danger: Color,
    pub danger_hover: Color,
    pub bg: Color,
    pub bg_secondary: Color,
    pub border: Color,
    pub text: Color,
    pub text_secondary: Color,
    pub card_btn: Color,
    pub card_btn_hover: Color,
}

const RADIUS_VAL: f32 = 6.0;

fn radius() -> iced::border::Radius {
    iced::border::Radius::new(RADIUS_VAL)
}

fn shadow() -> iced::Shadow {
    iced::Shadow {
        color: iced::Color {
            r: 0.0,
            g: 0.0,
            b: 0.0,
            a: 0.1,
        },
        offset: iced::Vector::new(0.0, 2.0),
        blur_radius: 4.0,
    }
}

pub fn primary_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let base = button::Style {
            background: Some(Background::Color(COLORS.primary)),
            border: iced::Border {
                color: COLORS.primary,
                width: 1.0,
                radius: radius(),
            },
            shadow: shadow(),
            text_color: Color::WHITE,
            snap: false,
        };

        match status {
            button::Status::Hovered => button::Style {
                background: Some(Background::Color(COLORS.primary_hover)),
                ..base
            },
            _ => base,
        }
    })
}

pub fn danger_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let base = button::Style {
            background: Some(Background::Color(COLORS.danger)),
            border: iced::Border {
                color: COLORS.danger,
                width: 1.0,
                radius: radius(),
            },
            shadow: shadow(),
            text_color: Color::WHITE,
            snap: false,
        };

        match status {
            button::Status::Hovered => button::Style {
                background: Some(Background::Color(COLORS.danger_hover)),
                ..base
            },
            _ => base,
        }
    })
}

pub fn success_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let base = button::Style {
            background: Some(Background::Color(COLORS.success)),
            border: iced::Border {
                color: COLORS.success,
                width: 1.0,
                radius: radius(),
            },
            shadow: shadow(),
            text_color: Color::WHITE,
            snap: false,
        };

        match status {
            button::Status::Hovered => button::Style {
                background: Some(Background::Color(COLORS.success)),
                ..base
            },
            _ => base,
        }
    })
}

pub fn secondary_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let base = button::Style {
            background: Some(Background::Color(COLORS.card_btn)),
            border: iced::Border {
                color: COLORS.border,
                width: 1.0,
                radius: radius(),
            },
            shadow: shadow(),
            text_color: COLORS.text,
            snap: false,
        };

        match status {
            button::Status::Hovered => button::Style {
                background: Some(Background::Color(COLORS.card_btn_hover)),
                ..base
            },
            _ => base,
        }
    })
}

pub fn card_container_style(
) -> Box<dyn Fn(&iced::Theme) -> iced::widget::container::Style + 'static> {
    card_container_style_colored(COLORS.bg)
}

pub fn card_container_style_colored(
    bg: Color,
) -> Box<dyn Fn(&iced::Theme) -> iced::widget::container::Style + 'static> {
    Box::new(move |_theme: &iced::Theme| iced::widget::container::Style {
        text_color: None,
        background: Some(Background::Color(bg)),
        border: iced::Border {
            color: COLORS.border,
            width: 1.0,
            radius: radius(),
        },
        shadow: shadow(),
        snap: false,
    })
}

pub fn flat_container_style(
) -> Box<dyn Fn(&iced::Theme) -> iced::widget::container::Style + 'static> {
    Box::new(move |_theme: &iced::Theme| iced::widget::container::Style {
        text_color: None,
        background: Some(Background::Color(COLORS.bg_secondary)),
        border: iced::Border::default(),
        shadow: iced::Shadow::default(),
        snap: false,
    })
}

pub fn error_container_style(
) -> Box<dyn Fn(&iced::Theme) -> iced::widget::container::Style + 'static> {
    Box::new(move |_theme: &iced::Theme| iced::widget::container::Style {
        text_color: None,
        background: Some(Background::Color(Color {
            r: 0.898 * 0.15,
            g: 0.243 * 0.15,
            b: 0.243 * 0.15,
            a: 1.0,
        })),
        border: iced::Border {
            color: COLORS.danger,
            width: 1.0,
            radius: radius(),
        },
        shadow: iced::Shadow::default(),
        snap: false,
    })
}

pub fn pick_list_style() -> Box<
    dyn Fn(&iced::Theme, iced::widget::pick_list::Status) -> iced::widget::pick_list::Style
        + 'static,
> {
    Box::new(
        move |_theme: &iced::Theme, status: iced::widget::pick_list::Status| {
            let is_hovered = matches!(status, iced::widget::pick_list::Status::Hovered);
            iced::widget::pick_list::Style {
                background: Background::Color(COLORS.bg_secondary),
                text_color: COLORS.text,
                placeholder_color: COLORS.text_secondary,
                handle_color: COLORS.text_secondary,
                border: iced::Border {
                    color: COLORS.border,
                    width: if is_hovered { 2.0 } else { 1.0 },
                    radius: radius(),
                },
            }
        },
    )
}

pub fn navbar_container_style(
) -> Box<dyn Fn(&iced::Theme) -> iced::widget::container::Style + 'static> {
    Box::new(move |_theme: &iced::Theme| iced::widget::container::Style {
        text_color: None,
        background: Some(Background::Color(Color::from_rgba(
            0.204, 0.486, 0.895, 0.72,
        ))),
        border: iced::Border::default(),
        shadow: iced::Shadow {
            color: Color::from_rgba(0.0, 0.0, 0.0, 0.18),
            offset: iced::Vector::new(0.0, 2.0),
            blur_radius: 6.0,
        },
        snap: false,
    })
}

pub fn nav_ghost_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let alpha = match status {
            button::Status::Hovered | button::Status::Pressed => 0.20,
            _ => 0.0,
        };
        button::Style {
            background: Some(Background::Color(Color::from_rgba(1.0, 1.0, 1.0, alpha))),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: iced::border::Radius::new(6.0),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    })
}

pub fn nav_active_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let bg = match status {
            button::Status::Hovered | button::Status::Pressed => Color::from_rgba(1.0, 1.0, 1.0, 0.35),
            _ => Color::from_rgba(1.0, 1.0, 1.0, 0.22),
        };
        button::Style {
            background: Some(Background::Color(bg)),
            border: iced::Border {
                color: Color::from_rgba(1.0, 1.0, 1.0, 0.5),
                width: 1.0,
                radius: iced::border::Radius::new(6.0),
            },
            shadow: iced::Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    })
}

/// Round FAB (Floating Action Button) — success green circle
pub fn circle_fab_button() -> Box<dyn Fn(&Theme, button::Status) -> button::Style + 'static> {
    Box::new(move |_theme: &Theme, status: button::Status| {
        let bg = match status {
            button::Status::Hovered | button::Status::Pressed => {
                Color::from_rgb(0.165, 0.545, 0.322)
            }
            _ => COLORS.success,
        };
        button::Style {
            background: Some(Background::Color(bg)),
            border: iced::Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: iced::border::Radius::new(28.0), // half of 56px
            },
            shadow: iced::Shadow {
                color: Color::from_rgba(0.0, 0.0, 0.0, 0.30),
                offset: iced::Vector::new(0.0, 3.0),
                blur_radius: 8.0,
            },
            text_color: Color::WHITE,
            snap: false,
        }
    })
}

pub fn menu_style() -> Box<dyn Fn(&iced::Theme) -> menu::Style + 'static> {
    Box::new(move |_theme: &iced::Theme| menu::Style {
        background: Background::Color(COLORS.bg),
        border: iced::Border {
            color: COLORS.border,
            width: 1.0,
            radius: iced::border::Radius::new(RADIUS_VAL),
        },
        text_color: COLORS.text,
        selected_text_color: COLORS.text,
        selected_background: Background::Color(COLORS.bg_secondary),
        shadow: shadow(),
    })
}

pub fn text_input_style() -> Box<
    dyn Fn(&iced::Theme, iced::widget::text_input::Status) -> iced::widget::text_input::Style
        + 'static,
> {
    Box::new(
        move |_theme: &iced::Theme, status: iced::widget::text_input::Status| {
            let focused = matches!(status, iced::widget::text_input::Status::Focused { .. });
            iced::widget::text_input::Style {
                background: Background::Color(COLORS.bg_secondary),
                border: iced::Border {
                    color: if focused {
                        COLORS.primary
                    } else {
                        COLORS.border
                    },
                    width: if focused { 2.0 } else { 1.0 },
                    radius: radius(),
                },
                icon: Color::from_rgb(0.5, 0.5, 0.5),
                placeholder: COLORS.text_secondary,
                value: COLORS.text,
                selection: Color::from_rgba(
                    COLORS.primary.r,
                    COLORS.primary.g,
                    COLORS.primary.b,
                    0.3,
                ),
            }
        },
    )
}

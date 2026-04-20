use crate::messages::Message;
use crate::state::{AppPage, AppState, UserInfo};
use crate::theme::navbar_container_style;
use iced::widget::canvas::{self, Canvas, Frame, Geometry};
use iced::widget::svg::Handle as SvgHandle;
use iced::widget::{button, column, container, mouse_area, row, text, Space};
use iced::{Background, Border, Color, Element, Length, Radians, Rectangle, Shadow, Size, Vector};
use iced_widget::rule;

// ── animation maths ───────────────────────────────────────────────────────────

/// Returns `(rotation_radians, scale)` for a given animation progress `t ∈ [0, 1]`.
///
/// Keyframes (2 s, ease-in-out per segment):
///   0 %  → 0 °, scale 1.0
///  25 %  → −15 °,  scale 1.0
///  50 %  →  0 °,   scale 0.92
///  75 %  → +15 °,  scale 1.0
/// 100 %  →  0 °,   scale 1.0
fn logo_transform(t: f32) -> (f32, f32) {
    // smoothstep: zero velocity at both ends of each segment
    fn ease(p: f32) -> f32 {
        p * p * (3.0 - 2.0 * p)
    }
    fn lerp(a: f32, b: f32, p: f32) -> f32 {
        a + (b - a) * ease(p)
    }
    if t < 0.25 {
        let p = t / 0.25;
        (lerp(0.0, -15.0f32.to_radians(), p), 1.0)
    } else if t < 0.5 {
        let p = (t - 0.25) / 0.25;
        (lerp(-15.0f32.to_radians(), 0.0, p), lerp(1.0, 0.92, p))
    } else if t < 0.75 {
        let p = (t - 0.5) / 0.25;
        (lerp(0.0, 15.0f32.to_radians(), p), lerp(0.92, 1.0, p))
    } else {
        let p = (t - 0.75) / 0.25;
        (lerp(15.0f32.to_radians(), 0.0, p), 1.0)
    }
}

// ── canvas program ────────────────────────────────────────────────────────────

struct LogoCanvas {
    size: f32,
    angle: f32, // radians
    scale: f32,
}

impl<Message> canvas::Program<Message> for LogoCanvas {
    type State = ();

    fn draw(
        &self,
        _state: &(),
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: iced::mouse::Cursor,
    ) -> Vec<Geometry<iced::Renderer>> {
        let mut frame = Frame::new(renderer, bounds.size());
        let cx = bounds.width / 2.0;
        let cy = bounds.height / 2.0;

        frame.with_save(|f| {
            f.translate(Vector::new(cx, cy));
            f.rotate(Radians(self.angle));
            f.scale(self.scale);
            f.translate(Vector::new(-cx, -cy));

            let handle = SvgHandle::from_memory(include_bytes!("../assets/logo.svg"));
            // From<&Handle> → iced_core::Svg
            f.draw_svg(
                Rectangle::with_size(Size::new(self.size, self.size)),
                &handle,
            );
        });

        vec![frame.into_geometry()]
    }
}

// ── link-style button ─────────────────────────────────────────────────────────

fn link_style() -> impl Fn(&iced::Theme, iced::widget::button::Status) -> iced::widget::button::Style
{
    move |_theme, status| {
        let alpha = match status {
            iced::widget::button::Status::Hovered | iced::widget::button::Status::Pressed => 0.12,
            _ => 0.0,
        };
        iced::widget::button::Style {
            background: Some(Background::Color(Color::from_rgba(1.0, 1.0, 1.0, alpha))),
            border: Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 4.0.into(),
            },
            shadow: Shadow::default(),
            text_color: Color::WHITE,
            snap: false,
        }
    }
}

fn nav_link<'a>(
    label: impl Into<String> + 'a,
    msg: Message,
    active: bool,
    font_size: f32,
) -> Element<'a, Message> {
    let t = text(label.into()).size(font_size).color(Color::WHITE);
    let pad_v = (font_size * 0.4).round() as u16;
    let pad_h = (font_size * 0.9).round() as u16;

    let inner: Element<Message> = if active {
        column![
            t,
            rule::horizontal(2).style(|_theme| iced_widget::rule::Style {
                color: Color::WHITE,
                radius: 0.0.into(),
                fill_mode: iced_widget::rule::FillMode::Full,
                snap: false,
            }),
        ]
        .spacing(2)
        .width(Length::Shrink)
        .into()
    } else {
        t.into()
    };

    button(inner)
        .on_press(msg)
        .padding([pad_v, pad_h / 2])
        .style(link_style())
        .into()
}

// ── public navbar ─────────────────────────────────────────────────────────────

pub fn navbar<'a>(
    current_page: &AppPage,
    logged_in: bool,
    user_info: Option<&'a UserInfo>,
    panel_size: u32,
    devices_modal_open: bool,
    logo_anim_start: Option<std::time::Instant>,
) -> Element<'a, Message> {
    let ps = panel_size as f32;
    let logo_size = (ps * 0.55).round();
    let brand_font = (ps * 0.28).round();
    let nav_font = (ps * 0.25).round();

    // Always render via Canvas so there is no widget-type switch (which causes a visual pop)
    // when the animation ends.  At rest the transform is identity (angle=0, scale=1).
    let progress = logo_anim_start
        .map(|s| (s.elapsed().as_secs_f32() / 2.0).min(1.0))
        .unwrap_or(0.0);

    let (angle, scale) = if progress > 0.0 {
        logo_transform(progress)
    } else {
        (0.0, 1.0)
    };

    let logo_elem: Element<Message> = Canvas::new(LogoCanvas {
        size: logo_size,
        angle,
        scale,
    })
    .width(Length::Fixed(logo_size))
    .height(Length::Fixed(logo_size))
    .into();

    let brand_content = row![
        logo_elem,
        text("Untamo").size(brand_font).color(Color::WHITE)
    ]
    .spacing((ps * 0.14).round())
    .align_y(iced::Alignment::Center);

    let brand_btn: Element<Message> = mouse_area(
        button(brand_content)
            .on_press(Message::ToggleSettings)
            .padding([(ps * 0.07).round(), (ps * 0.18).round()])
            .style(link_style()),
    )
    .on_enter(Message::LogoHovered)
    .on_exit(Message::LogoUnhovered)
    .into();

    let user_initials = user_info
        .map(|u| initials(&u.screen_name))
        .unwrap_or_else(|| "U".to_string());

    let right_items: Vec<Element<Message>> = if logged_in {
        let on_alarms = matches!(current_page, AppPage::Alarms);
        let alarms_active = on_alarms;
        let alarms_msg = if on_alarms {
            Message::ToggleAlarmPop
        } else {
            Message::NavigateTo(AppPage::Alarms)
        };
        let on_stopwatch = matches!(current_page, AppPage::Stopwatch);
        let on_countdown = matches!(current_page, AppPage::Countdown);
        let avatar_size = (nav_font * 1.9).round();
        let avatar_btn: Element<Message> = button(
            text(user_initials)
                .size(nav_font * 0.85)
                .color(Color::WHITE)
                .align_x(iced::alignment::Horizontal::Center)
                .align_y(iced::alignment::Vertical::Center),
        )
        .on_press(Message::ToggleUserMenu)
        .width(Length::Fixed(avatar_size))
        .height(Length::Fixed(avatar_size))
        .style(move |_theme, status| {
            let bg = match status {
                iced::widget::button::Status::Hovered => Color::from_rgb(0.15, 0.45, 0.85),
                iced::widget::button::Status::Pressed => Color::from_rgb(0.10, 0.35, 0.75),
                _ => Color::from_rgb(0.18, 0.52, 0.96),
            };
            iced::widget::button::Style {
                background: Some(Background::Color(bg)),
                border: Border {
                    color: Color::TRANSPARENT,
                    width: 0.0,
                    radius: (avatar_size / 2.0).into(),
                },
                shadow: Shadow::default(),
                text_color: Color::WHITE,
                snap: false,
            }
        })
        .into();
        vec![
            nav_link("Alarms", alarms_msg, alarms_active, nav_font),
            nav_link(
                "Stopwatch",
                Message::NavigateTo(AppPage::Stopwatch),
                on_stopwatch,
                nav_font,
            ),
            nav_link(
                "Countdown",
                Message::NavigateTo(AppPage::Countdown),
                on_countdown,
                nav_font,
            ),
            nav_link(
                "Devices",
                Message::ToggleDevicesModal,
                devices_modal_open,
                nav_font,
            ),
            avatar_btn,
        ]
    } else {
        let login_active = matches!(current_page, AppPage::Login);
        let reg_active = matches!(current_page, AppPage::Register);
        vec![
            nav_link("Login", Message::GoToLogin, login_active, nav_font),
            nav_link(
                "Register",
                Message::NavigateTo(AppPage::Register),
                reg_active,
                nav_font,
            ),
        ]
    };

    let right = right_items
        .into_iter()
        .fold(row![].spacing((ps * 0.07).round()), |r, item| r.push(item))
        .align_y(iced::Alignment::Center);

    let nav_row = row![brand_btn, Space::new().width(Length::Fill), right]
        .align_y(iced::Alignment::Center)
        .height(Length::Fill)
        .padding(iced::Padding::from([0.0, (ps * 0.21).round()]));

    container(nav_row)
        .width(Length::Fill)
        .height(Length::Fixed(ps))
        .style(navbar_container_style())
        .into()
}

fn initials(screen_name: &str) -> String {
    screen_name
        .split_whitespace()
        .filter_map(|w| w.chars().next())
        .take(2)
        .map(|c| c.to_uppercase().next().unwrap_or(c))
        .collect()
}

// ── helper: build navbar from full state (used in views.rs) ──────────────────

pub fn navbar_from_state<'a>(state: &'a AppState) -> Element<'a, Message> {
    let logged_in = matches!(
        state.login.session_status,
        crate::state::SessionStatus::Valid
    );
    navbar(
        &state.page,
        logged_in,
        state.login.user_info.as_ref(),
        state.settings.panel_size,
        state.show_devices_modal,
        state.logo_anim_start,
    )
}

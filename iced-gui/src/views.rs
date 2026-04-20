use crate::components::alarm_pop::{POP_WIDTH, TAIL_H, TAIL_X};
use crate::components::{
    about_view, add_alarm_dialog, alarm_pop_view, alarms_view, colors_dialog, confirm_dialog,
    countdown_view, devices_view, edit_device_dialog, edit_profile_dialog, login_form, navbar,
    notifications_view, play_alarm_view, qr_scanner, register_form, settings_dialog,
    stopwatch_view, user_menu_view, welcome_view,
};
use crate::messages::Message;
use crate::state::{AppPage, AppState, SessionStatus};
use crate::theme::hex_to_color;
use iced::{
    widget::{container, scrollable, stack},
    window, Background, Color, Element, Length,
};

fn is_logged_in(state: &AppState) -> bool {
    state.login.session_status == SessionStatus::Valid && state.login.user_info.is_some()
}

fn current_page(state: &AppState) -> AppPage {
    match state.login.session_status {
        SessionStatus::Valid if state.login.user_info.is_some() => {
            if state.page == AppPage::Welcome
                || state.page == AppPage::Login
                || state.page == AppPage::Register
            {
                AppPage::Welcome
            } else {
                state.page.clone()
            }
        }
        _ => state.page.clone(),
    }
}

/// Full-screen modal: dimmed backdrop + vertically/horizontally centered scrollable dialog.
fn modal<'a>(dialog: Element<'a, Message>) -> Element<'a, Message> {
    let backdrop = container(
        iced::widget::Space::new()
            .width(Length::Fill)
            .height(Length::Fill),
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .style(|_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(Background::Color(Color::from_rgba(0.0, 0.0, 0.0, 0.48))),
        ..iced::widget::container::Style::default()
    });

    let centered = container(
        container(scrollable(dialog).height(Length::Shrink))
            .width(Length::Shrink)
            .max_width(600)
            .center_x(Length::Fill),
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .center_x(Length::Fill)
    .center_y(Length::Fill)
    .padding(24);

    stack([backdrop.into(), centered.into()]).into()
}

pub fn view<'a>(state: &'a AppState, _window: window::Id) -> Element<'a, Message> {
    let page = current_page(state);
    let logged_in = is_logged_in(state);

    if state.show_qr_scanner {
        return container(qr_scanner(
            state.qr_error.as_ref(),
            state.qr_scanning,
            &state.qr_token_input,
            state.qr_frame_count,
            state.qr_frame_data.as_ref(),
            state.qr_refresh_toggle,
        ))
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .width(Length::Fill)
        .height(Length::Fill)
        .into();
    }

    let nav = navbar(
        &page,
        logged_in,
        state.login.user_info.as_ref(),
        state.settings.panel_size,
        state.show_devices_modal,
        state.logo_anim_start,
    );

    let main_content: Element<Message> = match page {
        AppPage::Login => container(login_form(&state.login, &state.server_address))
            .center_x(Length::Fill)
            .into(),
        AppPage::Register => container(register_form(&state.register))
            .center_x(Length::Fill)
            .into(),
        AppPage::Welcome => welcome_view(&state.login, &state.welcome, &state.devices).into(),
        AppPage::Alarms => alarms_view(state).into(),
        AppPage::Devices => devices_view(state).into(),
        AppPage::User => alarms_view(state).into(), // fallback: User page is now modal
        AppPage::PlayAlarm => play_alarm_view(state).into(),
        AppPage::Stopwatch => stopwatch_view(state).into(),
        AppPage::Countdown => countdown_view(state).into(),
    };

    // Base layer: navbar + page content (nav position from settings)
    let base_col = if state.settings.nav_bar_top {
        iced::widget::Column::new().push(nav).push(main_content)
    } else {
        iced::widget::Column::new().push(main_content).push(nav)
    };
    let base: Element<Message> = container(base_col.height(Length::Fill))
        .width(Length::Fill)
        .height(Length::Fill)
        .into();

    // Collect stack layers
    let mut layers: Vec<Element<Message>> = vec![base];

    let bg = hex_to_color(&state.settings.card_colors.background);

    // Modal dialogs — each replaces previous so only one shows at a time
    if state.settings.show_settings {
        layers.push(modal(settings_dialog(
            &state.settings,
            bg,
            &state.toggle_anims,
        )));
    }

    if state.settings.show_colors {
        layers.push(modal(colors_dialog(&state.settings, bg)));
    }

    if state.show_add_alarm {
        layers.push(modal(add_alarm_dialog(
            &state.add_alarm,
            &state.devices,
            &state.available_tunes,
            state.settings.clock24,
            bg,
            &state.toggle_anims,
        )));
    }

    if state.show_devices_modal {
        layers.push(modal(devices_view(state)));
    }

    if state.show_user_menu {
        layers.push(modal(user_menu_view(state)));
    }

    if state.show_about {
        layers.push(modal(about_view(bg)));
    }

    if state.edit_profile.show {
        layers.push(modal(edit_profile_dialog(&state.edit_profile, bg)));
    }

    if let Some(pending) = &state.pending_delete {
        layers.push(modal(confirm_dialog(pending, bg)));
    }

    if state.editing_device.is_some() || state.adding_device {
        layers.push(modal(edit_device_dialog(
            state.adding_device,
            &state
                .editing_device
                .as_ref()
                .map(|d| d.id.clone())
                .unwrap_or_default(),
            &state.editing_device_name,
            &state.editing_device_type,
            bg,
        )));
    }

    // Alarm pop-bubble — anchored just below/above the navbar near the Alarms button
    if state.show_alarm_pop && state.page == AppPage::Alarms {
        let ps = state.settings.panel_size as f32;
        let nav_font = (ps * 0.25).round();

        // Compute the Alarms button center distance from the RIGHT screen edge,
        // using the exact same layout constants as navbar.rs:
        //   nav_row right padding  : ps * 0.21
        //   avatar button width    : nav_font * 1.9
        //   item spacing           : ps * 0.07  (×2, between avatar/Devices and Devices/Alarms)
        //   "Devices" button width : pad_h + text.  pad_h = nav_font * 0.9;
        //                            text ≈ 7 chars × 0.55 em = 3.85 × nav_font → ~1.1 × ps
        //   "Alarms" button center : half of (pad_h + text ≈ 6 × 0.55 em = 3.3 × nav_font) → ~0.5 × ps
        let item_spacing = (ps * 0.07).round();
        let avatar_w = (nav_font * 1.9).round();
        let nav_pad_right = (ps * 0.21).round();
        let devices_w = (nav_font * 0.9).round() + (nav_font * 3.85).round(); // pad_h + text
        let alarms_half_w = ((nav_font * 0.9).round() + (nav_font * 3.3).round()) / 2.0;
        let alarms_cx_from_right =
            nav_pad_right + avatar_w + item_spacing + devices_w + item_spacing + alarms_half_w;

        // The tail tip is (POP_WIDTH − TAIL_X) px from the popup's right edge.
        // Right-align the popup so the tail tip lands on the Alarms button center.
        let tail_from_right = POP_WIDTH - TAIL_X;
        let right = (alarms_cx_from_right - tail_from_right).max(4.0);

        // Overlap the tail tip into the navbar so the bubble looks connected to the button.
        let tail_overlap = ps - TAIL_H + 4.0;

        let pop_layer: Element<Message> = if state.settings.nav_bar_top {
            // Navbar at top → tail tip overlaps up into navbar, card hangs below
            container(alarm_pop_view(state, true))
                .align_right(Length::Fill)
                .align_top(Length::Fill)
                .padding(iced::Padding {
                    top: tail_overlap,
                    left: 0.0,
                    right,
                    bottom: 0.0,
                })
                .into()
        } else {
            // Navbar at bottom → card above navbar, tail tip overlaps down into navbar
            container(alarm_pop_view(state, false))
                .align_right(Length::Fill)
                .align_bottom(Length::Fill)
                .padding(iced::Padding {
                    top: 0.0,
                    left: 0.0,
                    right,
                    bottom: tail_overlap,
                })
                .into()
        };
        layers.push(pop_layer);
    }

    // Toast notifications — top-right overlay (always on top)
    if !state.notifications.is_empty() {
        let toasts = container(notifications_view(&state.notifications))
            .width(Length::Fill)
            .height(Length::Fill)
            .align_right(Length::Fill)
            .align_top(Length::Fill)
            .padding(iced::Padding {
                top: 64.0,
                right: 16.0,
                bottom: 0.0,
                left: 0.0,
            });
        layers.push(toasts.into());
    }

    stack(layers).into()
}

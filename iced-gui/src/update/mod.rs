mod helpers;
pub mod alarm;
pub mod auth;
pub mod countdown;
pub mod devices;
pub mod settings;
pub mod stopwatch;
pub mod window;

pub(crate) const ICON_BYTES: &[u8] = include_bytes!("../../resources/icons/icon_32.png");

use crate::messages::Message;
use crate::state::AppState;
use iced::{window as iced_window, Task};

pub fn update_app(state: &mut AppState, message: Message) -> Task<Message> {
    if state.show_qr_scanner && state.qr_scanning && crate::state::FRAME_READY.load(std::sync::atomic::Ordering::SeqCst) {
        crate::state::FRAME_READY.store(false, std::sync::atomic::Ordering::SeqCst);
        if let Some(frame) = crate::state::LATEST_FRAME.lock().unwrap().clone() {
            state.qr_frame_data = Some(frame);
            state.qr_frame_count += 1;
            state.qr_refresh_toggle = !state.qr_refresh_toggle;
        }
    }

    match message {
        Message::WindowIdReceived(id) => window::window_id_received(state, id),
        Message::CloseRequested(id) => window::close_requested(state, id),
        Message::WindowClosed(id) => window::window_closed(state, id),
        Message::TrayShowWindow => window::tray_show_window(state),
        Message::TrayToggle => window::tray_toggle(state),
        Message::TrayQuit => window::tray_quit(state),
        Message::FrameTick => window::frame_tick(state),

        Message::ValidateSession => auth::validate_session(state),
        Message::SessionInvalid => auth::session_invalid(state),
        Message::FetchUpdate => auth::fetch_update(state),
        Message::UpdateReceived(response) => auth::update_received(state, response),
        Message::UpdateError(error) => auth::update_error(state, error),
        Message::ServerAddressChanged(address) => auth::server_address_changed(state, address),
        Message::EmailChanged(email) => auth::email_changed(state, email),
        Message::PasswordChanged(password) => auth::password_changed(state, password),
        Message::Submit => auth::submit(state),
        Message::LoginResult(result) => auth::login_result(state, result),
        Message::ClearError => auth::clear_error(state),
        Message::ToggleQrScanner => auth::toggle_qr_scanner(state),
        Message::QrTokenInputChanged(value) => auth::qr_token_input_changed(state, value),
        Message::QrSubmit(qr_token) => auth::qr_submit(state, qr_token),
        Message::QrLoginResult(result) => auth::qr_login_result(state, result),
        Message::CloseQrScanner => auth::close_qr_scanner(state),
        Message::StartScanner => auth::start_scanner(state),
        Message::CameraError(err_msg) => auth::camera_error(state, err_msg),
        Message::QrFrameRefresh(frame_data) => auth::qr_frame_refresh(state, frame_data),
        Message::QrScanned(token_opt) => auth::qr_scanned(state, token_opt),
        Message::NavigateTo(page) => auth::navigate_to(state, page),
        Message::GoToRegister => auth::go_to_register(state),
        Message::GoToLogin => auth::go_to_login(state),
        Message::RegisterFirstNameChanged(name) => auth::register_first_name_changed(state, name),
        Message::RegisterLastNameChanged(name) => auth::register_last_name_changed(state, name),
        Message::RegisterEmailChanged(email) => auth::register_email_changed(state, email),
        Message::RegisterPasswordChanged(password) => auth::register_password_changed(state, password),
        Message::RegisterConfirmPasswordChanged(password) => auth::register_confirm_password_changed(state, password),
        Message::SubmitRegister => auth::submit_register(state),
        Message::RegisterResult(result) => auth::register_result(state, result),
        Message::WsConnect => auth::ws_connect(state),
        Message::WsDisconnect => auth::ws_disconnect(state),
        Message::WsMessageReceived(result) => auth::ws_message_received(state, result),

        Message::SetAlarmLabel(label) => alarm::set_alarm_label(state, label),
        Message::SetAlarmHour(hour) => alarm::set_alarm_hour(state, hour),
        Message::SetAlarmMinute(minute) => alarm::set_alarm_minute(state, minute),
        Message::SetAlarmWeekday(bit) => alarm::set_alarm_weekday(state, bit),
        Message::SetAlarmOccurrence(occ) => alarm::set_alarm_occurrence(state, occ),
        Message::SetAlarmTune(tune) => alarm::set_alarm_tune(state, tune),
        Message::SetAlarmActive(val) => alarm::set_alarm_active(state, val),
        Message::SetAlarmCloseTask(val) => alarm::set_alarm_close_task(state, val),
        Message::ToggleAlarmDevice(id) => alarm::toggle_alarm_device(state, id),
        Message::FetchAlarmTunes => alarm::fetch_alarm_tunes(state),
        Message::AlarmTunesReceived(tunes) => alarm::alarm_tunes_received(state, tunes),
        Message::SubmitAddAlarm => alarm::submit_add_alarm(state),
        Message::CancelAddAlarm => alarm::cancel_add_alarm(state),
        Message::ToggleAlarmPop => alarm::toggle_alarm_pop(state),
        Message::ResetSnooze(alarm_id) => alarm::reset_snooze(state, alarm_id),
        Message::TriggerAlarm(alarm_id) => alarm::trigger_alarm(state, alarm_id),
        Message::PlayAlarmAudio(path) => alarm::play_alarm_audio(state, path),
        Message::SnoozeAlarm => alarm::snooze_alarm(state),
        Message::SnoozePressStart => alarm::snooze_press_start(state),
        Message::SnoozePressEnd => alarm::snooze_press_end(state),
        Message::DismissAlarm => alarm::dismiss_alarm(state),
        Message::SetTurnOff(value) => alarm::set_turn_off(state, value),
        Message::SetSnoozeMinutes(minutes) => alarm::set_snooze_minutes(state, minutes),
        Message::AlarmHovered(id) => alarm::alarm_hovered(state, id),
        Message::AlarmUnhovered => alarm::alarm_unhovered(state),
        Message::EditAlarm(id) => alarm::edit_alarm(state, id),
        Message::DeleteAlarm(id) => alarm::delete_alarm(state, id),
        Message::ToggleAlarmActive(id) => alarm::toggle_alarm_active(state, id),
        Message::AlarmAddResult(result) => alarm::alarm_add_result(state, result),
        Message::AlarmEditResult(result) => alarm::alarm_edit_result(state, result),
        Message::AlarmDeleteResult(result) => alarm::alarm_delete_result(state, result),
        Message::RequestDelete(pending) => alarm::request_delete(state, pending),
        Message::CancelDelete => alarm::cancel_delete(state),
        Message::ConfirmDelete => alarm::confirm_delete(state),
        Message::PreviewTune(tune) => alarm::preview_tune(state, tune),
        Message::StopPreviewTune => alarm::stop_preview_tune(state),
        Message::PlayPreviewAudio(path) => alarm::play_preview_audio(state, path),
        Message::PlayAudio(path) => alarm::play_audio(state, path),
        Message::StopAudio => alarm::stop_audio(state),
        Message::ToggleAddAlarm => alarm::toggle_add_alarm(state),
        Message::OpenTimePicker => alarm::open_time_picker(state),
        Message::CancelTimePicker => alarm::cancel_time_picker(state),
        Message::SubmitTimePicker(time) => alarm::submit_time_picker(state, time),
        Message::OpenDatePicker => alarm::open_date_picker(state),
        Message::CancelDatePicker => alarm::cancel_date_picker(state),
        Message::SubmitDatePicker(date) => alarm::submit_date_picker(state, date),

        Message::ToggleSettings => settings::toggle_settings(state),
        Message::ToggleClock24 => settings::toggle_clock24(state),
        Message::SetNavBarTop(value) => settings::set_nav_bar_top(state, value),
        Message::SetPanelSize(size) => settings::set_panel_size(state, size),
        Message::SetVolume(volume) => settings::set_volume(state, volume),
        Message::SetDialogSize(size) => settings::set_dialog_size(state, size),
        Message::SetCloseTaskBehavior(behavior) => settings::set_close_task_behavior(state, behavior),
        Message::SetSnoozePressMs(ms) => settings::set_snooze_press_ms(state, ms),
        Message::SetNotificationsEnabled(enabled) => settings::set_notifications_enabled(state, enabled),
        Message::SetDesktopNotificationsEnabled(enabled) => settings::set_desktop_notifications_enabled(state, enabled),
        Message::ToggleColors => settings::toggle_colors(state),
        Message::SetColorMode(mode) => settings::set_color_mode(state, mode),
        Message::SetCardColorEven(color) => settings::set_card_color_even(state, color),
        Message::SetCardColorOdd(color) => settings::set_card_color_odd(state, color),
        Message::SetCardColorInactive(color) => settings::set_card_color_inactive(state, color),
        Message::SetCardColorBackground(color) => settings::set_card_color_background(state, color),
        Message::SetDefaultCardColors => settings::set_default_card_colors(state),
        Message::SetCurrentCardColor(hex) => settings::set_current_card_color(state, hex),
        Message::SetColorHue(h) => settings::set_color_hue(state, h),
        Message::SetColorSV(s, v) => settings::set_color_sv(state, s, v),
        Message::OpenColorPicker => settings::open_color_picker(state),
        Message::CancelColorPicker => settings::cancel_color_picker(state),
        Message::SubmitColorPicker(color) => settings::submit_color_picker(state, color),
        Message::DismissNotification(index) => settings::dismiss_notification(state, index),
        Message::ShowNotification(title, msg) => settings::show_notification(state, title, msg),

        Message::ToggleViewableDevice(id) => devices::toggle_viewable_device(state, id),
        Message::SelectWelcomeDevice(selection) => devices::select_welcome_device(state, selection),
        Message::AddDevice => devices::add_device(state),
        Message::EditDevice(id) => devices::edit_device(state, id),
        Message::SetEditingDeviceName(name) => devices::set_editing_device_name(state, name),
        Message::SetEditingDeviceType(device_type) => devices::set_editing_device_type(state, device_type),
        Message::SaveDeviceEdit => devices::save_device_edit(state),
        Message::CloseDeviceEdit => devices::close_device_edit(state),
        Message::DeviceAddResult(result) => devices::device_add_result(state, result),
        Message::DeleteDevice(id) => devices::delete_device(state, id),
        Message::ToggleDevicesModal => devices::toggle_devices_modal(state),
        Message::ToggleEditProfile => devices::toggle_edit_profile(state),
        Message::ToggleAbout => devices::toggle_about(state),
        Message::LogoHovered => devices::logo_hovered(state),
        Message::LogoUnhovered => devices::logo_unhovered(state),
        Message::ToggleUserMenu => devices::toggle_user_menu(state),
        Message::GoToLogout => devices::go_to_logout(state),
        Message::SetEditScreenName(val) => devices::set_edit_screen_name(state, val),
        Message::SetEditFirstName(val) => devices::set_edit_first_name(state, val),
        Message::SetEditLastName(val) => devices::set_edit_last_name(state, val),
        Message::SetEditEmail(val) => devices::set_edit_email(state, val),
        Message::SetEditPassword(val) => devices::set_edit_password(state, val),
        Message::SetEditNewPassword(val) => devices::set_edit_new_password(state, val),
        Message::SetEditConfirmPassword(val) => devices::set_edit_confirm_password(state, val),
        Message::ToggleEditChangePassword => devices::toggle_edit_change_password(state),
        Message::SubmitEditProfile => devices::submit_edit_profile(state),
        Message::CancelEditProfile => devices::cancel_edit_profile(state),
        Message::RefreshSession => devices::refresh_session(state),
        Message::StopwatchStart => stopwatch::start(state),
        Message::StopwatchStop => stopwatch::stop(state),
        Message::StopwatchReset => stopwatch::reset(state),
        Message::StopwatchLap => stopwatch::lap(state),
        Message::CountdownStart => countdown::start(state),
        Message::CountdownStop => countdown::stop(state),
        Message::CountdownReset => countdown::reset(state),
        Message::CountdownSetHours(h) => countdown::set_hours(state, h),
        Message::CountdownSetMinutes(m) => countdown::set_minutes(state, m),
        Message::CountdownSetSeconds(s) => countdown::set_seconds(state, s),
        Message::FetchTimers => stopwatch::fetch_timers(state),
        Message::TimersReceived(timers) => stopwatch::timers_received(state, timers),
        Message::SaveTimer(title) => stopwatch::save_timer(state, title),
        Message::LoadTimer(id) => stopwatch::load_timer_by_id(state, id),
        Message::ContinueTimer(id) => stopwatch::continue_timer(state, id),
        Message::TimerSaveResult(result) => stopwatch::timer_save_result(state, result),
        Message::TimerDeleteResult(result) => stopwatch::timer_delete_result(state, result),
        Message::SetTimerTab(tab) => stopwatch::set_timer_tab(state, tab),
        Message::ExportTimerCsv(id, is_excel) => stopwatch::export_timer_csv(state, id, is_excel),
    }
}

pub(crate) fn new_window_settings() -> iced_window::Settings {
    let icon = iced_window::icon::from_file_data(ICON_BYTES, Some(image::ImageFormat::Png)).ok();
    iced_window::Settings {
        icon,
        platform_specific: iced_window::settings::PlatformSpecific {
            application_id: "untamo".to_string(),
            ..Default::default()
        },
        ..iced_window::Settings::default()
    }
}

use crate::audio;
use crate::messages::Message;
use crate::state::{Alarm, AppState, AppPage, CardColors, Device, LoginRequest, LoginResponse, PendingDelete, QrLoginRequest, SessionStatus, LATEST_FRAME, FRAME_VERSION, FRAME_READY, UserInfo, WebColors};
use crate::websocket::{self, WsMessage as WsMsg};
use iced::{window, Task};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::mpsc;
use v4l::buffer::Type;
use v4l::io::traits::CaptureStream;
use v4l::video::Capture;


static CANCEL: AtomicBool = AtomicBool::new(false);

fn validate_email(email: &str) -> bool {
    email.contains('@') && email.len() > 3
}

fn capture_thread(_result_tx: std::sync::mpsc::Sender<Result<Option<String>, String>>) {
    println!("capture_thread: starting");
    CANCEL.store(false, Ordering::SeqCst);
    FRAME_VERSION.store(0, Ordering::SeqCst);

    let mut dev = match v4l::Device::new(0) {
        Ok(d) => d,
        Err(e) => {
            let err = format!("Failed to open camera: {}", e);
            eprintln!("{}", err);
            return;
        }
    };

    let fourcc = v4l::FourCC::new(b"MJPG");
    let target_width = 640u32;
    let target_height = 480u32;
    let new_fmt = v4l::Format::new(target_width, target_height, fourcc);
    
    if let Ok(set_fmt) = dev.set_format(&new_fmt) {
        println!("capture_thread: set format: {}x{} fourcc: {:?}", set_fmt.width, set_fmt.height, set_fmt.fourcc);
    } else {
        println!("capture_thread: failed to set format, using current");
    }

    let mut stream = match v4l::io::mmap::Stream::with_buffers(&mut dev, Type::VideoCapture, 4) {
        Ok(s) => s,
        Err(e) => {
            let err = format!("Failed to create stream: {}", e);
            eprintln!("{}", err);
            return;
        }
    };
    println!("capture_thread: stream created");

    for attempt in 0.. {
        if CANCEL.load(Ordering::SeqCst) {
            println!("capture_thread: cancelled");
            return;
        }

        let (buf, _) = match stream.next() {
            Ok(b) => b,
            Err(e) => {
                eprintln!("Attempt {}: Failed to get frame: {}", attempt, e);
                std::thread::sleep(std::time::Duration::from_millis(50));
                continue;
            }
        };
        
        let data = buf.to_vec();
        
        if let Ok(img) = image::load_from_memory(&data) {
            let (width, height) = (img.width(), img.height());
            let rgba = img.to_rgba8();
            drop(img);
            
            let pixels = rgba.into_raw();
            
            let mut frame = LATEST_FRAME.lock().unwrap();
            *frame = Some((width, height, pixels));
            drop(frame);
            FRAME_VERSION.fetch_add(1, Ordering::SeqCst);
            FRAME_READY.store(true, Ordering::SeqCst);

        }

        std::thread::sleep(std::time::Duration::from_millis(33));
    }
}

pub fn update_app(state: &mut AppState, message: Message) -> Task<Message> {
    if state.show_qr_scanner && state.qr_scanning && FRAME_READY.load(Ordering::SeqCst) {
        FRAME_READY.store(false, Ordering::SeqCst);
        if let Some(frame) = LATEST_FRAME.lock().unwrap().clone() {
            state.qr_frame_data = Some(frame);
            state.qr_frame_count += 1;
            state.qr_refresh_toggle = !state.qr_refresh_toggle;
        }
    }
    
    match message {
        Message::WindowIdReceived(id) => {
            state.window_id = id;
            if let Some(wid) = id {
                if let Ok(icon) = iced::window::icon::from_file_data(
                    include_bytes!("../resources/icons/icon_32.png"),
                    Some(image::ImageFormat::Png),
                ) {
                    return iced::window::set_icon(wid, icon);
                }
            }
            Task::none()
        }
Message::CloseRequested(id) => {
            state.window_id = None;
            iced::window::close(id)
        }
        Message::WindowClosed(id) => {
            if state.window_id == Some(id) {
                state.window_id = None;
            }
            Task::none()
        }
        Message::TrayShowWindow => {
            if let Some(id) = state.window_id {
                iced::window::gain_focus(id)
            } else {
                let (id, open_task) = iced::window::open(new_window_settings());
                state.window_id = Some(id);
                Task::batch([
                    open_task.map(|id| Message::WindowIdReceived(Some(id))),
                    iced::window::gain_focus(id),
                ])
            }
        }
        Message::TrayToggle => {
            if let Some(id) = state.window_id {
                state.window_id = None;
                iced::window::close(id)
            } else {
                let (id, open_task) = iced::window::open(new_window_settings());
                state.window_id = Some(id);
                Task::batch([
                    open_task.map(|id| Message::WindowIdReceived(Some(id))),
                    iced::window::gain_focus(id),
                ])
            }
        }
        Message::TrayQuit => {
            std::process::exit(0);
        }
        Message::FrameTick => {
            if let Ok(mut guard) = crate::websocket::WS_MSG_QUEUE.lock() {
                let messages: Vec<_> = guard.drain(..).collect();
                for result in messages {
                    if let Ok(msg) = result {
                        handle_ws_message(state, msg);
                    }
                }
            }
            // Auto-dismiss notifications after 4 seconds
            let now = std::time::Instant::now();
            state.notifications.retain(|n| {
                now.duration_since(n.timestamp).as_millis() < 4000
            });
            // Reset preview button when track finishes naturally
            if state.add_alarm.preview_started && !crate::audio::is_audio_playing() {
                state.add_alarm.previewing_tune = None;
                state.add_alarm.preview_started = false;
            }
            // Clear logo animation after 2s
            if let Some(start) = state.logo_anim_start {
                if start.elapsed().as_secs_f32() >= 2.0 {
                    state.logo_anim_start = None;
                }
            }
            // Advance alarm-screen animation tick while on PlayAlarm page
            if state.page == AppPage::PlayAlarm {
                state.alarm_anim_tick += 0.016;
            }

            // ── Toggle switch animations ──────────────────────────────────────
            {
                const K: f32 = 0.35;
                const SNAP: f32 = 0.005;
                for alarm in &state.alarms {
                    let target = if alarm.active { 1.0f32 } else { 0.0 };
                    let e = state.toggle_anims.entry(alarm.id.clone()).or_insert(target);
                    if (*e - target).abs() > SNAP { *e += (target - *e) * K; } else { *e = target; }
                }
                for (key, target) in [
                    ("settings_notif", if state.settings.notifications_enabled { 1.0f32 } else { 0.0 }),
                    ("add_active",     if state.add_alarm.active { 1.0 } else { 0.0 }),
                    ("add_close_task", if state.add_alarm.close_task { 1.0 } else { 0.0 }),
                    ("play_turn_off",  if state.turn_off { 1.0 } else { 0.0 }),
                ] {
                    let e = state.toggle_anims.entry(key.to_string()).or_insert(target);
                    if (*e - target).abs() > SNAP { *e += (target - *e) * K; } else { *e = target; }
                }
            }

            // ── Alarm scheduler: check once per minute ────────────────────────
            let mut alarm_to_fire: Option<String> = None;
            if state.page != AppPage::PlayAlarm && state.login.session_status == crate::state::SessionStatus::Valid {
                use chrono::Timelike;
                let chrono_now = chrono::Local::now();
                let current_minute = (chrono_now.hour(), chrono_now.minute());
                if state.last_alarm_minute != Some(current_minute) {
                    state.last_alarm_minute = Some(current_minute);
                    let selected_device_id = match &state.welcome.selected_device {
                        crate::state::DeviceSelect::Device(d) => Some(d.id.clone()),
                        crate::state::DeviceSelect::None => None,
                    };
                    for alarm in &state.alarms {
                        if !alarm.active { continue; }
                        if let Some(ref dev_id) = selected_device_id {
                            if !alarm.devices.contains(dev_id) { continue; }
                        }
                        if alarm_should_fire_now(alarm, &chrono_now) {
                            alarm_to_fire = Some(alarm.id.clone());
                            break;
                        }
                    }
                }
            }

            if let Some(alarm_id) = alarm_to_fire {
                return Task::perform(async move { alarm_id }, Message::TriggerAlarm);
            }

            Task::none()
        }
        Message::ValidateSession => {
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    match client
                        .get(format!("{}/api/is-session-valid", server))
                        .header("token", &token)
                        .send()
                        .await
                    {
                        Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                        Ok(_) => Message::SessionInvalid,
                        Err(_) => Message::SessionInvalid,
                    }
                },
                |m| m,
            )
        }
        Message::SessionInvalid => {
            crate::storage::clear_session();
            state.login.session_status = crate::state::SessionStatus::NotValid;
            state.login.user_info = None;
            state.page = AppPage::Login;
            state.ws.token = String::new();
            state.ws.ws_token = String::new();
            state.ws.ws_pair = String::new();
            Task::none()
        }
        Message::FetchUpdate => {
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    match client
                        .get(format!("{}/api/update", server))
                        .header("token", &token)
                        .send()
                        .await
                    {
                        Ok(resp) => {
                            if resp.status().is_success() {
                                match resp.json::<crate::state::UpdateResponse>().await {
                                    Ok(data) => Message::UpdateReceived(data),
                                    Err(e) => Message::UpdateError(format!("Parse error: {}", e)),
                                }
                            } else {
                                Message::UpdateError(format!("HTTP {}", resp.status().as_u16()))
                            }
                        }
                        Err(e) => Message::UpdateError(format!("Connection error: {}", e)),
                    }
                },
                |m| m,
            )
        }
        Message::UpdateReceived(response) => {
            state.login.user_info = Some(response.user);
            state.alarms = response.alarms;
            state.devices = response.devices;

            // First time: default all devices to viewable.
            if state.viewable_devices.is_empty() {
                state.viewable_devices = state.devices.iter().map(|d| d.id.clone()).collect();
                save_settings_from_state(state);
            }

            // If we have a saved device selection and the device still exists,
            // skip the welcome screen and go straight to Alarms.
            if state.page == AppPage::Welcome {
                if let Some(ref saved_id) = state.saved_device_id.clone() {
                    if let Some(device) = state.devices.iter().find(|d| &d.id == saved_id) {
                        state.welcome.selected_device = crate::state::DeviceSelect::Device(device.clone());
                        state.page = AppPage::Alarms;
                    }
                }
            }

            Task::none()
        }
        Message::UpdateError(error) => {
            eprintln!("FetchUpdate error: {}", error);
            Task::none()
        }
        Message::ServerAddressChanged(address) => {
            state.server_address = address;
            Task::none()
        }
        Message::EmailChanged(email) => {
            state.login.email = email;
            state.login.can_submit = validate_email(&state.login.email)
                && state.login.password.len() > 5;
            Task::none()
        }
        Message::PasswordChanged(password) => {
            state.login.password = password;
            state.login.can_submit = validate_email(&state.login.email)
                && state.login.password.len() > 5;
            Task::none()
        }
        Message::Submit => {
            state.login.session_status = SessionStatus::Validating;
            state.login.error_message = None;
            let email = state.login.email.clone();
            let password = state.login.password.clone();
            let server = state.server_address.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    match client
                        .post(format!("{}/login", server))
                        .json(&LoginRequest { email, password })
                        .send()
                        .await
                    {
                        Ok(resp) => {
                            if resp.status().is_success() {
                                match resp.json::<LoginResponse>().await {
                                    Ok(data) => Ok(data),
                                    Err(e) => Err(format!("Parse error: {}", e)),
                                }
                            } else {
                                Err(format!("HTTP {}", resp.status().as_u16()))
                            }
                        }
                        Err(e) => Err(format!("Connection error: {}", e)),
                    }
                },
                Message::LoginResult,
            )
        }
        Message::LoginResult(result) => {
            match result {
                Ok(resp) => {
                    state.login.session_status = SessionStatus::Valid;
                    state.login.user_info = Some(UserInfo {
                        user: String::new(),
                        email: resp.email.clone(),
                        screen_name: resp.screen_name.clone(),
                        first_name: resp.first_name.clone(),
                        last_name: resp.last_name.clone(),
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                        registered: 0,
                    });
                    state.ws.token = resp.token.clone();
                    state.ws.ws_token = resp.ws_token.clone();
                    state.ws.ws_pair = resp.ws_pair.clone();
                    state.page = AppPage::Welcome;
                    
                    if let Err(e) = crate::storage::save_session(&crate::storage::SessionData {
                        token: resp.token,
                        ws_token: resp.ws_token,
                        ws_pair: resp.ws_pair,
                        email: resp.email,
                        screen_name: resp.screen_name,
                        first_name: resp.first_name,
                        last_name: resp.last_name,
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                    }) {
                        eprintln!("Failed to save session: {}", e);
                    }
                    
                    Task::perform(async { Message::FetchUpdate }, |m| m)
                }
                Err(e) => {
                    state.login.error_message = Some(e.clone());
                    state.login.session_status = SessionStatus::NotValid;
                    Task::none()
                }
            }
        }
        Message::ClearError => {
            state.login.error_message = None;
            Task::none()
        }
        Message::ToggleQrScanner => {
            state.show_qr_scanner = !state.show_qr_scanner;
            state.qr_error = None;
            Task::none()
        }
        Message::QrTokenInputChanged(value) => {
            state.qr_token_input = value;
            state.qr_error = None;
            Task::none()
        }
        Message::QrSubmit(qr_token) => {
            if qr_token.is_empty() {
                state.qr_error = Some("Please enter a QR token".to_string());
                return Task::none();
            }
            let server = state.server_address.clone();
            let token = qr_token.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    match client
                        .post(format!("{}/qr-login", server))
                        .json(&QrLoginRequest { qr_token: token })
                        .send()
                        .await
                    {
                        Ok(resp) => {
                            if resp.status().is_success() {
                                match resp.json::<LoginResponse>().await {
                                    Ok(data) => Ok(data),
                                    Err(e) => Err(format!("Parse error: {}", e)),
                                }
                            } else {
                                Err(format!("HTTP {}", resp.status().as_u16()))
                            }
                        }
                        Err(e) => Err(format!("Connection error: {}", e)),
                    }
                },
                Message::QrLoginResult,
            )
        }
        Message::QrLoginResult(result) => {
            state.show_qr_scanner = false;
            match result {
                Ok(resp) => {
                    state.login.session_status = SessionStatus::Valid;
                    state.login.user_info = Some(UserInfo {
                        user: String::new(),
                        email: resp.email.clone(),
                        screen_name: resp.screen_name.clone(),
                        first_name: resp.first_name.clone(),
                        last_name: resp.last_name.clone(),
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                        registered: 0,
                    });
                    state.ws.token = resp.token.clone();
                    state.ws.ws_token = resp.ws_token.clone();
                    state.ws.ws_pair = resp.ws_pair.clone();
                    state.page = AppPage::Welcome;
                    
                    if let Err(e) = crate::storage::save_session(&crate::storage::SessionData {
                        token: resp.token,
                        ws_token: resp.ws_token,
                        ws_pair: resp.ws_pair,
                        email: resp.email,
                        screen_name: resp.screen_name,
                        first_name: resp.first_name,
                        last_name: resp.last_name,
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                    }) {
                        eprintln!("Failed to save session: {}", e);
                    }
                    
                    Task::perform(async { Message::FetchUpdate }, |m| m)
                }
                Err(e) => {
                    state.qr_error = Some(e.clone());
                    state.login.session_status = SessionStatus::NotValid;
                    Task::none()
                }
            }
        }
        Message::CloseQrScanner => {
            println!("DEBUG CloseQrScanner: setting CANCEL=true, show_qr_scanner=false");
            CANCEL.store(true, Ordering::SeqCst);
            state.show_qr_scanner = false;
            state.qr_error = None;
            state.qr_token_input = String::new();
            println!("DEBUG CloseQrScanner: done, qr_scanning={}", state.qr_scanning);
            Task::none()
        }
        Message::StartScanner => {
            state.show_qr_scanner = true;
            state.qr_scanning = true;
            state.qr_error = None;
            state.qr_frame_count = 0;
            state.qr_frame_data = None;
            FRAME_VERSION.store(0, Ordering::SeqCst);
            FRAME_READY.store(false, Ordering::SeqCst);
            let (result_tx, _result_rx) = std::sync::mpsc::channel();
            std::thread::spawn(move || {
                capture_thread(result_tx);
            });
            Task::none()
        }
        Message::CameraError(err_msg) => {
            state.qr_scanning = false;
            state.qr_error = Some(err_msg);
            Task::none()
        }
        Message::QrFrameRefresh(frame_data) => {
            if !state.show_qr_scanner {
                return Task::none();
            }
            let current_version = FRAME_VERSION.load(Ordering::SeqCst);
            state.qr_frame_count = current_version as u32;
            state.qr_refresh_toggle = !state.qr_refresh_toggle;
            if let Some((width, height, pixels)) = frame_data {
                state.qr_frame_data = Some((width, height, pixels));
            }
            Task::none()
        }
        Message::QrScanned(token_opt) => {
            println!("DEBUG QrScanned: token_opt.is_some={}", token_opt.is_some());
            if let Some(token) = token_opt {
                state.qr_scanning = false;
                let server = state.server_address.clone();
                Task::perform(
                    async move {
                        let client = reqwest::Client::new();
                        match client
                            .post(format!("{}/qr-login", server))
                            .json(&QrLoginRequest { qr_token: token })
                            .send()
                            .await
                        {
                            Ok(resp) => {
                                if resp.status().is_success() {
                                    match resp.json::<LoginResponse>().await {
                                        Ok(data) => Ok(data),
                                        Err(e) => Err(format!("Parse error: {}", e)),
                                    }
                                } else {
                                    Err(format!("HTTP {}", resp.status().as_u16()))
                                }
                            }
                            Err(e) => Err(format!("Connection error: {}", e)),
                        }
                    },
                    Message::QrLoginResult,
                )
            } else {
                state.qr_scanning = false;
                Task::none()
            }
        }
        Message::NavigateTo(page) => {
            if page != AppPage::Alarms {
                state.show_alarm_pop = false;
            }
            state.page = page;
            Task::none()
        }
        Message::GoToRegister => {
            state.page = AppPage::Register;
            Task::none()
        }
        Message::GoToLogin => {
            state.page = AppPage::Login;
            Task::none()
        }
        Message::RegisterFirstNameChanged(name) => {
            state.register.first_name = name;
            update_register_validity(state);
            Task::none()
        }
        Message::RegisterLastNameChanged(name) => {
            state.register.last_name = name;
            update_register_validity(state);
            Task::none()
        }
        Message::RegisterEmailChanged(email) => {
            state.register.email = email;
            update_register_validity(state);
            Task::none()
        }
        Message::RegisterPasswordChanged(password) => {
            state.register.password = password;
            update_register_validity(state);
            Task::none()
        }
        Message::RegisterConfirmPasswordChanged(password) => {
            state.register.confirm_password = password;
            update_register_validity(state);
            Task::none()
        }
        Message::SubmitRegister => {
            if !state.register.form_valid {
                return Task::none();
            }
            let first_name = state.register.first_name.clone();
            let last_name = state.register.last_name.clone();
            let email = state.register.email.clone();
            let password = state.register.password.clone();
            let server = state.server_address.clone();
            Task::perform(
                async move {
                    #[derive(serde::Serialize)]
                    struct RegisterRequest<'a> {
                        first_name: &'a str,
                        last_name: &'a str,
                        email: &'a str,
                        password: &'a str,
                    }
                    let client = reqwest::Client::new();
                    match client
                        .post(format!("{}/register", server))
                        .json(&RegisterRequest {
                            first_name: &first_name,
                            last_name: &last_name,
                            email: &email,
                            password: &password,
                        })
                        .send()
                        .await
                    {
                        Ok(resp) => {
                            if resp.status().is_success() {
                                Ok(())
                            } else {
                                Err(format!("HTTP {}", resp.status().as_u16()))
                            }
                        }
                        Err(e) => Err(format!("Connection error: {}", e)),
                    }
                },
                Message::RegisterResult,
            )
        }
        Message::RegisterResult(result) => {
            match result {
                Ok(_) => {
                    state.register.registered = true;
                    state.page = AppPage::Login;
                }
                Err(e) => {
                    state.register.error_message = Some(e);
                }
            }
            Task::none()
        }
        Message::ToggleClock24 => {
            state.settings.clock24 = !state.settings.clock24;
            state.welcome.clock24 = state.settings.clock24;
            save_settings_from_state(state);
            Task::none()
        }
        Message::ToggleSettings => {
            state.settings.show_settings = !state.settings.show_settings;
            Task::none()
        }
        Message::SetNavBarTop(value) => {
            state.settings.nav_bar_top = value;
            save_settings_from_state(state);
            Task::none()
        }
        Message::SetPanelSize(size) => {
            state.settings.panel_size = size;
            save_settings_from_state(state);
            Task::none()
        }
        Message::SetVolume(volume) => {
            state.settings.volume = volume;
            audio::set_audio_volume(volume);
            save_settings_from_state(state);
            Task::none()
        }
        Message::SetDialogSize(size) => {
            state.settings.dialog_size = size;
            Task::none()
        }
        Message::WsConnect => {
            if state.ws.ws_token.is_empty() || state.login.session_status != SessionStatus::Valid {
                return Task::none();
            }
            if websocket::is_connected() {
                return Task::none();
            }
            let server = state.server_address.clone();
            let ws_token = state.ws.ws_token.clone();
            let ws_pair = state.ws.ws_pair.clone();
            let (tx, _rx) = mpsc::channel(100);
            let (send_tx, send_rx) = mpsc::channel::<String>(100);
            let _ = crate::websocket::WS_SEND_TX.set(send_tx);
            
            tokio::spawn(async move {
                websocket::ws_connect(&server, &ws_token, &ws_pair, tx, send_rx).await;
            });
            
            iced::Task::perform(async { Message::FetchUpdate }, |m| m)
        }
        Message::WsDisconnect => {
            websocket::disconnect();
            state.ws.connected = false;
            Task::none()
        }
        Message::WsMessageReceived(result) => {
            match result {
                Ok(msg) => {
                    state.ws.connected = true;
                    handle_ws_message(state, msg);
                }
                Err(e) => {
                    println!("WS error: {}", e);
                    state.ws.connected = false;
                }
            }
            Task::none()
        }
        Message::ToggleColors => {
            state.settings.show_colors = !state.settings.show_colors;
            if state.settings.show_colors {
                // Sync picker hue from the currently selected color
                let hex = current_color_hex(&state.settings);
                state.settings.picker_h = hex_to_hue(&hex);
            }
            Task::none()
        }
        Message::SetColorMode(mode) => {
            state.settings.color_mode = mode;
            // Sync picker hue from the newly selected color's hex
            let hex = current_color_hex(&state.settings);
            state.settings.picker_h = hex_to_hue(&hex);
            Task::none()
        }
        Message::SetCardColorEven(color) => {
            state.settings.card_colors.even = color;
            Task::none()
        }
        Message::SetCardColorOdd(color) => {
            state.settings.card_colors.odd = color;
            Task::none()
        }
        Message::SetCardColorInactive(color) => {
            state.settings.card_colors.inactive = color;
            Task::none()
        }
        Message::SetCardColorBackground(color) => {
            state.settings.card_colors.background = color;
            Task::none()
        }
        Message::SetDefaultCardColors => {
            state.settings.card_colors = CardColors::default();
            Task::none()
        }
        Message::SetCurrentCardColor(hex) => {
            match state.settings.color_mode {
                crate::state::ColorMode::Even => state.settings.card_colors.even = hex,
                crate::state::ColorMode::Odd => state.settings.card_colors.odd = hex,
                crate::state::ColorMode::Inactive => state.settings.card_colors.inactive = hex,
                crate::state::ColorMode::Background => state.settings.card_colors.background = hex,
            }
            Task::none()
        }
        Message::SetColorHue(h) => {
            state.settings.picker_h = h;
            // Keep current s/v, update hex
            let hex = current_color_hex(&state.settings);
            let (_, s, v) = hex_to_hsv(&hex);
            let new_hex = hsv_to_hex(h, s, v);
            apply_current_color(&mut state.settings, new_hex);
            Task::none()
        }
        Message::SetColorSV(s, v) => {
            let h = state.settings.picker_h;
            let new_hex = hsv_to_hex(h, s, v);
            apply_current_color(&mut state.settings, new_hex);
            Task::none()
        }
        Message::PlayAudio(path) => {
            let volume = state.settings.volume;
            if let Err(e) = audio::play_audio_file(&path, volume, false) {
                println!("Audio play error: {}", e);
            }
            Task::none()
        }
        Message::StopAudio => {
            audio::stop_audio();
            Task::none()
        }
        Message::StopPreviewTune => {
            audio::stop_audio();
            state.add_alarm.previewing_tune = None;
            state.add_alarm.preview_started = false;
            Task::none()
        }
        Message::PlayPreviewAudio(path) => {
            let volume = state.settings.volume;
            if let Err(e) = audio::play_audio_file(&path, volume, false) {
                println!("Preview play error: {}", e);
                state.add_alarm.previewing_tune = None;
            }
            state.add_alarm.preview_started = true;
            Task::none()
        }
        Message::PreviewTune(tune) => {
            if state.add_alarm.previewing_tune.as_deref() == Some(tune.as_str()) {
                // Toggle off
                audio::stop_audio();
                state.add_alarm.previewing_tune = None;
                state.add_alarm.preview_started = false;
                return Task::none();
            }
            audio::stop_audio();
            state.add_alarm.previewing_tune = Some(tune.clone());
            state.add_alarm.preview_started = false;
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
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
        Message::ToggleAddAlarm => {
            state.show_add_alarm = !state.show_add_alarm;
            if state.show_add_alarm {
                state.add_alarm = crate::state::AddAlarmState::new();
                return Task::perform(async {}, |_| Message::FetchAlarmTunes);
            }
            Task::none()
        }
        Message::SetAlarmLabel(label) => {
            state.add_alarm.label = label;
            Task::none()
        }
        Message::SetAlarmHour(hour) => {
            state.add_alarm.time_hour = hour;
            Task::none()
        }
        Message::SetAlarmMinute(minute) => {
            state.add_alarm.time_minute = minute;
            Task::none()
        }
        Message::SetAlarmWeekday(bit) => {
            state.add_alarm.weekdays ^= bit;
            Task::none()
        }
        Message::SetAlarmOccurrence(occ) => {
            state.add_alarm.occurrence = occ;
            Task::none()
        }
        Message::SetAlarmTune(tune) => {
            state.add_alarm.tune = tune;
            Task::none()
        }
        Message::SetAlarmActive(val) => {
            state.add_alarm.active = val;
            Task::none()
        }
        Message::SetAlarmCloseTask(val) => {
            state.add_alarm.close_task = val;
            Task::none()
        }
        Message::ToggleAlarmDevice(id) => {
            if state.add_alarm.devices.contains(&id) {
                state.add_alarm.devices.retain(|d| d != &id);
            } else {
                state.add_alarm.devices.push(id);
            }
            Task::none()
        }
        Message::FetchAlarmTunes => {
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
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
        Message::AlarmTunesReceived(tunes) => {
            if !tunes.is_empty() {
                state.available_tunes = tunes;
            }
            Task::none()
        }
        Message::SubmitAddAlarm => {
            audio::stop_audio();
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
                    let client = reqwest::Client::new();
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
        Message::CancelAddAlarm => {
            audio::stop_audio();
            state.show_add_alarm = false;
            state.add_alarm = crate::state::AddAlarmState::new();
            Task::none()
        }
        Message::ToggleAlarmPop => {
            state.show_alarm_pop = !state.show_alarm_pop;
            Task::none()
        }
        Message::ResetSnooze(alarm_id) => {
            if let Some(alarm) = state.alarms.iter_mut().find(|a| a.id == alarm_id) {
                alarm.snooze.clear();
                let updated = alarm.clone();
                let server = state.server_address.clone();
                let token = state.ws.token.clone();
                return iced::Task::perform(
                    async move {
                        let client = reqwest::Client::new();
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
        Message::TriggerAlarm(alarm_id) => {
            if let Some(alarm) = state.alarms.iter().find(|a| a.id == alarm_id) {
                let tune = alarm.tune.clone();
                state.playing_alarm = Some(alarm.clone());
                state.alarm_anim_tick = 0.0;
                state.page = AppPage::PlayAlarm;

                let window_task = if let Some(id) = state.window_id {
                    iced::window::gain_focus(id)
                } else {
                    let (id, open_task) = iced::window::open(new_window_settings());
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
                        let client = reqwest::Client::new();
                        for ext in &["wav", "opus", "flac"] {
                            let url = format!("{}/audio-resources/{}.{}", server, tune, ext);
                            if let Ok(resp) = client.get(&url).header("token", &token).send().await {
                                if resp.status().is_success() {
                                    if let Ok(bytes) = resp.bytes().await {
                                        let tmp = std::env::temp_dir()
                                            .join(format!("untamo_alarm.{}", ext));
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
        Message::PlayAlarmAudio(path) => {
            let volume = state.settings.volume;
            if let Err(e) = audio::play_audio_file(&path, volume, true) {
                println!("Alarm audio play error: {}", e);
            }
            Task::none()
        }
        Message::SnoozeAlarm => {
            audio::stop_audio();
            state.playing_alarm = None;
            state.alarm_anim_tick = 0.0;
            state.snooze_press_start = None;
            state.page = AppPage::Alarms;
            add_notification(state, "Alarm", format!("Snoozed for {} minutes", state.snooze_minutes));
            Task::none()
        }
        Message::SnoozePressStart => {
            state.snooze_press_start = Some(std::time::Instant::now());
            Task::none()
        }
        Message::SnoozePressEnd => {
            if let Some(start) = state.snooze_press_start.take() {
                let required = std::time::Duration::from_millis(state.settings.snooze_press_ms as u64);
                if start.elapsed() >= required {
                    audio::stop_audio();
                    state.playing_alarm = None;
                    state.alarm_anim_tick = 0.0;
                    state.page = AppPage::Alarms;
                    add_notification(state, "Alarm", format!("Snoozed for {} minutes", state.snooze_minutes));
                }
            }
            Task::none()
        }
        Message::DismissAlarm => {
            audio::stop_audio();
            let dismissed_alarm = state.playing_alarm.take();
            let turn_off = state.turn_off;
            state.turn_off = false;
            state.alarm_anim_tick = 0.0;
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
                            let client = reqwest::Client::new();
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
        Message::SetTurnOff(value) => {
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
        Message::SetSnoozeMinutes(minutes) => {
            state.snooze_minutes = minutes;
            Task::none()
        }
        Message::DismissNotification(index) => {
            if index < state.notifications.len() {
                state.notifications.remove(index);
            }
            Task::none()
        }
        Message::ShowNotification(title, msg) => {
            add_notification(state, &title, msg);
            Task::none()
        }
        Message::ToggleUserMenu => {
            state.show_user_menu = !state.show_user_menu;
            Task::none()
        }
        Message::ToggleDevicesModal => {
            state.show_devices_modal = !state.show_devices_modal;
            Task::none()
        }
        Message::GoToLogout => {
            state.show_user_menu = false;
            let server = state.server_address.clone();
            let token = state.ws.token.clone();

            websocket::disconnect();
            crate::storage::clear_session();
            
            state.login.session_status = crate::state::SessionStatus::NotValid;
            state.login.user_info = None;
            state.login.email = String::new();
            state.login.password = String::new();
            state.page = AppPage::Login;
            state.alarms.clear();
            state.devices.clear();
            state.ws.token = String::new();
            state.ws.ws_token = String::new();
            state.ws.ws_pair = String::new();
            state.ws.connected = false;

            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    let _ = client
                        .post(format!("{}/logout", server))
                        .header("token", token)
                        .send()
                        .await;
                },
                |_| Message::ClearError,
            )
        }
        Message::AlarmHovered(id) => {
            state.hovered_alarm = Some(id);
            Task::none()
        }
        Message::AlarmUnhovered => {
            state.hovered_alarm = None;
            Task::none()
        }
        Message::EditAlarm(id) => {
            if let Some(alarm) = state.alarms.iter().find(|a| a.id == id) {
                state.add_alarm = crate::state::AddAlarmState::from_alarm(alarm);
                state.show_add_alarm = true;
                return Task::perform(async {}, |_| Message::FetchAlarmTunes);
            }
            Task::none()
        }
        Message::DeleteAlarm(id) => {
            state.pending_delete = Some(PendingDelete::Alarm(id));
            Task::none()
        }
        Message::ToggleAlarmActive(id) => {
            if let Some(alarm) = state.alarms.iter_mut().find(|a| a.id == id) {
                alarm.active = !alarm.active;
                let updated = alarm.clone();
                let server = state.server_address.clone();
                let token = state.ws.token.clone();
                iced::Task::perform(
                    async move {
                        let client = reqwest::Client::new();
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
        Message::ToggleViewableDevice(id) => {
            if let Some(pos) = state.viewable_devices.iter().position(|v| v == &id) {
                state.viewable_devices.remove(pos);
            } else {
                state.viewable_devices.push(id);
            }
            save_settings_from_state(state);
            Task::none()
        }
        Message::SelectWelcomeDevice(selection) => {
            // Persist the chosen device so we skip the welcome screen next launch.
            let device_id = match &selection {
                crate::state::DeviceSelect::Device(d) => Some(d.id.clone()),
                crate::state::DeviceSelect::None => None,
            };
            state.saved_device_id = device_id.clone();
            state.welcome.selected_device = selection;

            let mut s = crate::storage::load_settings();
            s.device_id = device_id;
            if let Err(e) = crate::storage::save_settings(&s) {
                eprintln!("Failed to save settings: {}", e);
            }

            // Navigate straight to alarms once a device is picked.
            state.page = AppPage::Alarms;
            Task::none()
        }
        Message::AddDevice => {
            state.adding_device = true;
            state.editing_device = None;
            state.editing_device_name = String::new();
            state.editing_device_type = crate::state::DeviceType::default();
            Task::none()
        }
        Message::EditDevice(id) => {
            if let Some(device) = state.devices.iter().find(|d| d.id == id) {
                let device_type = crate::state::DeviceType::from(device.device_type.as_str());
                state.editing_device = Some(device.clone());
                state.editing_device_name = device.device_name.clone();
                state.editing_device_type = device_type;
            }
            Task::none()
        }
        Message::SetEditingDeviceName(name) => {
            state.editing_device_name = name;
            Task::none()
        }
        Message::SetEditingDeviceType(device_type) => {
            state.editing_device_type = device_type;
            Task::none()
        }
        Message::SaveDeviceEdit => {
            #[derive(serde::Serialize)]
            struct DeviceOut {
                id: String,
                #[serde(rename = "deviceName")]
                device_name: String,
                #[serde(rename = "type")]
                device_type: String,
            }
            let new_name = state.editing_device_name.clone();
            let new_type = String::from(state.editing_device_type.clone());
            let server = state.server_address.clone();
            let token = state.ws.token.clone();

            if state.adding_device {
                // POST new device
                state.adding_device = false;
                let payload = DeviceOut { id: String::new(), device_name: new_name, device_type: new_type };
                return iced::Task::perform(
                    async move {
                        let client = reqwest::Client::new();
                        match client
                            .post(format!("{}/api/device", server))
                            .header("token", &token)
                            .json(&payload)
                            .send()
                            .await
                        {
                            Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                            Ok(resp) => Message::DeviceAddResult(Err(format!("HTTP {}", resp.status()))),
                            Err(e) => Message::DeviceAddResult(Err(e.to_string())),
                        }
                    },
                    |m| m,
                );
            } else if let Some(ref device) = state.editing_device {
                // PUT existing device
                let id = device.id.clone();
                if let Some(d) = state.devices.iter_mut().find(|d| d.id == id) {
                    d.device_name = new_name.clone();
                    d.device_type = new_type.clone();
                }
                state.editing_device = None;
                let payload = DeviceOut { id: id.clone(), device_name: new_name, device_type: new_type };
                return iced::Task::perform(
                    async move {
                        let client = reqwest::Client::new();
                        match client
                            .put(format!("{}/api/device/{}", server, id))
                            .header("token", &token)
                            .json(&payload)
                            .send()
                            .await
                        {
                            Ok(resp) if resp.status().is_success() => Message::FetchUpdate,
                            Ok(resp) => Message::UpdateError(format!("HTTP {}", resp.status())),
                            Err(e) => Message::UpdateError(e.to_string()),
                        }
                    },
                    |m| m,
                );
            }
            Task::none()
        }
        Message::CloseDeviceEdit => {
            state.editing_device = None;
            state.adding_device = false;
            Task::none()
        }
        Message::DeviceAddResult(Ok(())) => {
            Task::none()
        }
        Message::DeviceAddResult(Err(e)) => {
            add_notification_kind(state, "Device Error", format!("Failed to add device: {}", e), crate::state::NotificationKind::Error);
            Task::none()
        }
        Message::DeleteDevice(id) => {
            state.pending_delete = Some(PendingDelete::Device(id));
            Task::none()
        }
        Message::ToggleEditProfile => {
            state.edit_profile.show = !state.edit_profile.show;
            if state.edit_profile.show {
                state.show_user_menu = false;
                if let Some(ref user) = state.login.user_info {
                    state.edit_profile.screen_name = user.screen_name.clone();
                    state.edit_profile.first_name = user.first_name.clone();
                    state.edit_profile.last_name = user.last_name.clone();
                    state.edit_profile.email = user.email.clone();
                }
                state.edit_profile.password = String::new();
                state.edit_profile.new_password = String::new();
                state.edit_profile.confirm_password = String::new();
                state.edit_profile.change_password = false;
                state.edit_profile.validate();
            }
            Task::none()
        }
        Message::ToggleAbout => {
            state.show_about = !state.show_about;
            Task::none()
        }
        Message::LogoHovered => {
            state.logo_anim_start = Some(std::time::Instant::now());
            Task::none()
        }
        Message::LogoUnhovered => {
            // Let the animation finish naturally; FrameTick clears it after 2s
            Task::none()
        }
        Message::RefreshSession => {
            let token = state.ws.token.clone();
            let server = state.server_address.clone();
            Task::perform(
                async move {
                    let client = reqwest::Client::new();
                    let resp = client
                        .get(format!("{}/api/session", server))
                        .header("token", token)
                        .send()
                        .await;
                    match resp {
                        Ok(r) if r.status().is_success() => Message::ClearError,
                        _ => Message::ClearError,
                    }
                },
                |_| Message::ClearError,
            )
        }
        Message::SetEditScreenName(val) => {
            state.edit_profile.screen_name = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditFirstName(val) => {
            state.edit_profile.first_name = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditLastName(val) => {
            state.edit_profile.last_name = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditEmail(val) => {
            state.edit_profile.email = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditPassword(val) => {
            state.edit_profile.password = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditNewPassword(val) => {
            state.edit_profile.new_password = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SetEditConfirmPassword(val) => {
            state.edit_profile.confirm_password = val;
            state.edit_profile.validate();
            Task::none()
        }
        Message::ToggleEditChangePassword => {
            state.edit_profile.change_password = !state.edit_profile.change_password;
            state.edit_profile.validate();
            Task::none()
        }
        Message::SubmitEditProfile => {
            if !state.edit_profile.form_valid {
                return Task::none();
            }
            let server = state.server_address.clone();
            let token = state.ws.token.clone();
            let email = state.edit_profile.email.clone();
            let first_name = state.edit_profile.first_name.clone();
            let last_name = state.edit_profile.last_name.clone();
            let screen_name = state.edit_profile.screen_name.clone();
            let password = state.edit_profile.password.clone();
            let change_password = if state.edit_profile.change_password {
                Some(state.edit_profile.new_password.clone())
            } else {
                None
            };
            // Optimistic local update
            if let Some(ref mut user) = state.login.user_info {
                user.email = email.clone();
                user.first_name = first_name.clone();
                user.last_name = last_name.clone();
                user.screen_name = screen_name.clone();
            }
            state.edit_profile.show = false;
            iced::Task::perform(
                async move {
                    #[derive(serde::Serialize)]
                    struct EditUser {
                        email: String,
                        #[serde(rename = "firstName")]
                        first_name: String,
                        #[serde(rename = "lastName")]
                        last_name: String,
                        #[serde(rename = "screenName")]
                        screen_name: String,
                        password: String,
                        #[serde(rename = "changePassword", skip_serializing_if = "Option::is_none")]
                        change_password: Option<String>,
                    }
                    let payload = EditUser {
                        email: email.clone(),
                        first_name,
                        last_name,
                        screen_name,
                        password,
                        change_password,
                    };
                    let client = reqwest::Client::new();
                    match client
                        .put(format!("{}/api/edit-user/{}", server, email))
                        .header("token", &token)
                        .json(&payload)
                        .send()
                        .await
                    {
                        Ok(resp) if resp.status().is_success() => {
                            Message::ShowNotification(
                                "Profile Updated".to_string(),
                                "Your profile has been updated".to_string(),
                            )
                        }
                        Ok(resp) => Message::ShowNotification(
                            "Profile Error".to_string(),
                            format!("Failed to save: HTTP {}", resp.status()),
                        ),
                        Err(e) => Message::ShowNotification(
                            "Profile Error".to_string(),
                            format!("Failed to save: {}", e),
                        ),
                    }
                },
                |m| m,
            )
        }
        Message::CancelEditProfile => {
            state.edit_profile.show = false;
            Task::none()
        }
        Message::AlarmAddResult(Ok(_)) => {
            Task::none()
        }
        Message::AlarmAddResult(Err(e)) => {
            add_notification_kind(state, "Alarm Error", format!("Failed to add alarm: {}", e), crate::state::NotificationKind::Error);
            Task::none()
        }
        Message::AlarmEditResult(Ok(_)) => {
            Task::none()
        }
        Message::AlarmEditResult(Err(e)) => {
            add_notification_kind(state, "Alarm Error", format!("Failed to update alarm: {}", e), crate::state::NotificationKind::Error);
            Task::none()
        }
        Message::AlarmDeleteResult(Ok(())) => {
            Task::none()
        }
        Message::AlarmDeleteResult(Err(e)) => {
            add_notification_kind(state, "Alarm Error", format!("Failed to delete alarm: {}", e), crate::state::NotificationKind::Error);
            Task::none()
        }
        Message::RequestDelete(pending) => {
            state.pending_delete = Some(pending);
            Task::none()
        }
        Message::CancelDelete => {
            state.pending_delete = None;
            Task::none()
        }
        Message::ConfirmDelete => {
            let pending = state.pending_delete.take();
            match pending {
                Some(PendingDelete::Alarm(id)) => {
                    state.alarms.retain(|a| a.id != id);
                    add_notification(state, "Alarm Deleted", "Alarm removed successfully".to_string());
                    let server = state.server_address.clone();
                    let token = state.ws.token.clone();
                    iced::Task::perform(
                        async move {
                            let client = reqwest::Client::new();
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
                            let client = reqwest::Client::new();
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
        Message::SetCloseTaskBehavior(behavior) => {
            state.settings.close_task_behavior = behavior;
            Task::none()
        }
        Message::SetSnoozePressMs(ms) => {
            state.settings.snooze_press_ms = ms;
            Task::none()
        }
        Message::SetNotificationsEnabled(enabled) => {
            state.settings.notifications_enabled = enabled;
            Task::none()
        }
        Message::OpenColorPicker => {
            let hex = match state.settings.color_mode {
                crate::state::ColorMode::Even => &state.settings.card_colors.even,
                crate::state::ColorMode::Odd => &state.settings.card_colors.odd,
                crate::state::ColorMode::Inactive => &state.settings.card_colors.inactive,
                crate::state::ColorMode::Background => &state.settings.card_colors.background,
            };
            state.settings.color_picker_value = hex_to_color(hex);
            state.settings.show_color_picker = true;
            Task::none()
        }
        Message::CancelColorPicker => {
            state.settings.show_color_picker = false;
            Task::none()
        }
        Message::SubmitColorPicker(color) => {
            let hex = color_to_hex(color);
            match state.settings.color_mode {
                crate::state::ColorMode::Even => state.settings.card_colors.even = hex,
                crate::state::ColorMode::Odd => state.settings.card_colors.odd = hex,
                crate::state::ColorMode::Inactive => state.settings.card_colors.inactive = hex,
                crate::state::ColorMode::Background => state.settings.card_colors.background = hex,
            }
            state.settings.show_color_picker = false;
            Task::none()
        }
        Message::OpenTimePicker => {
            state.add_alarm.show_time_picker = true;
            Task::none()
        }
        Message::CancelTimePicker => {
            state.add_alarm.show_time_picker = false;
            Task::none()
        }
        Message::SubmitTimePicker(time) => {
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
        Message::OpenDatePicker => {
            state.add_alarm.show_date_picker = true;
            Task::none()
        }
        Message::CancelDatePicker => {
            state.add_alarm.show_date_picker = false;
            Task::none()
        }
        Message::SubmitDatePicker(date) => {
            state.add_alarm.show_date_picker = false;
            state.add_alarm.date_picker_value = date;
            Task::none()
        }
    }
}

fn add_notification(state: &mut AppState, title: &str, message: String) {
    add_notification_kind(state, title, message, crate::state::NotificationKind::Info);
}

fn add_notification_kind(
    state: &mut AppState,
    title: &str,
    message: String,
    kind: crate::state::NotificationKind,
) {
    if !state.settings.notifications_enabled {
        return;
    }
    let notif = crate::state::Notification {
        title: title.to_string(),
        message,
        kind,
        timestamp: std::time::Instant::now(),
    };
    state.notifications.push(notif);
    if state.notifications.len() > 5 {
        state.notifications.remove(0);
    }
}

fn save_settings_from_state(state: &AppState) {
    let s = crate::storage::AppSettings {
        clock24: state.settings.clock24,
        volume: state.settings.volume,
        nav_bar_top: state.settings.nav_bar_top,
        panel_size: state.settings.panel_size,
        device_id: state.saved_device_id.clone(),
        viewable_devices: state.viewable_devices.clone(),
    };
    let _ = crate::storage::save_settings(&s);
}

fn color_to_hex(color: iced::Color) -> String {
    let r = (color.r * 255.0).round() as u8;
    let g = (color.g * 255.0).round() as u8;
    let b = (color.b * 255.0).round() as u8;
    format!("#{:02X}{:02X}{:02X}", r, g, b)
}

fn hex_to_color(hex: &str) -> iced::Color {
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

fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{:x}{:x}", duration.as_secs(), duration.subsec_nanos())
}

fn handle_ws_message(state: &mut AppState, msg: WsMsg) {
    use crate::websocket::WsMessageType;
    
    match msg.msg_type {
        WsMessageType::AlarmAdd => {
            if let Some(alarm) = parse_alarm(&msg.data) {
                if !state.alarms.iter().any(|a| a.id == alarm.id) {
                    state.alarms.push(alarm);
                }
            }
        }
        WsMessageType::AlarmDelete => {
            if let Some(id) = msg.data.as_str() {
                state.alarms.retain(|a| a.id != id);
            }
        }
        WsMessageType::AlarmEdit => {
            if let Some(alarm) = parse_alarm(&msg.data) {
                if let Some(existing) = state.alarms.iter_mut().find(|a| a.id == alarm.id) {
                    *existing = alarm;
                }
            }
        }
        WsMessageType::DeviceAdd => {
            if let Some(device) = parse_device(&msg.data) {
                if !state.devices.iter().any(|d| d.id == device.id) {
                    let id = device.id.clone();
                    state.devices.push(device);
                    if !state.viewable_devices.contains(&id) {
                        state.viewable_devices.push(id);
                        save_settings_from_state(state);
                    }
                }
            }
        }
        WsMessageType::DeviceDelete => {
            if let Some(id) = msg.data.as_str() {
                state.devices.retain(|d| d.id != id);
                state.viewable_devices.retain(|v| v != id);
                save_settings_from_state(state);
            }
        }
        WsMessageType::DeviceEdit => {
            if let Some(device) = parse_device(&msg.data) {
                if let Some(existing) = state.devices.iter_mut().find(|d| d.id == device.id) {
                    *existing = device;
                }
            }
        }
        WsMessageType::UserEdit => {
            if let Some(user) = parse_user_info(&msg.data) {
                state.login.user_info = Some(user);
            }
        }
        WsMessageType::WebColors => {
            if let Some(colors) = parse_web_colors(&msg.data) {
                state.settings.web_colors = colors;
            }
        }
    }
}

fn parse_alarm(value: &serde_json::Value) -> Option<Alarm> {
    Some(Alarm {
        id: value.get("id")?.as_str()?.to_string(),
        occurrence: value.get("occurrence")?.as_str()?.to_string(),
        time: value.get("time")?.as_array()?.iter().filter_map(|v| v.as_u64()).map(|n| n as u8).collect(),
        weekdays: value.get("weekdays")?.as_u64()? as u8,
        date: value.get("date")?.as_array()?.iter().filter_map(|v| v.as_u64()).map(|n| n as u16).collect(),
        label: value.get("label")?.as_str()?.to_string(),
        devices: value.get("devices")?.as_array()?.iter().filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
        snooze: value.get("snooze")?.as_array()?.iter().filter_map(|v| v.as_i64()).collect(),
        active: value.get("active")?.as_bool()?,
        tune: value.get("tune")?.as_str()?.to_string(),
        modified: value.get("modified")?.as_i64().unwrap_or(0),
        fingerprint: value.get("fingerprint")?.as_str()?.to_string(),
        close_task: value.get("closeTask")?.as_bool().unwrap_or(false),
    })
}

fn parse_device(value: &serde_json::Value) -> Option<Device> {
    Some(Device {
        id: value.get("id")?.as_str()?.to_string(),
        device_name: value.get("deviceName").or_else(|| value.get("device_name"))?.as_str()?.to_string(),
        device_type: value.get("type").or_else(|| value.get("deviceType"))?.as_str()?.to_string(),
    })
}

fn parse_user_info(value: &serde_json::Value) -> Option<UserInfo> {
    Some(UserInfo {
        user: value.get("user")?.as_str()?.to_string(),
        email: value.get("email")?.as_str()?.to_string(),
        screen_name: value.get("screenName").or_else(|| value.get("screen_name"))?.as_str()?.to_string(),
        first_name: value.get("firstName").or_else(|| value.get("first_name"))?.as_str()?.to_string(),
        last_name: value.get("lastName").or_else(|| value.get("last_name"))?.as_str()?.to_string(),
        admin: value.get("admin")?.as_bool()?,
        owner: value.get("owner")?.as_bool()?,
        active: value.get("active")?.as_bool()?,
        registered: value.get("registered")?.as_i64().unwrap_or(0),
    })
}

fn parse_web_colors(value: &serde_json::Value) -> Option<WebColors> {
    Some(WebColors {
        even: value.get("even")?.as_str()?.to_string(),
        odd: value.get("odd")?.as_str()?.to_string(),
        inactive: value.get("inactive")?.as_str()?.to_string(),
        background: value.get("background")?.as_str()?.to_string(),
    })
}

fn alarm_should_fire_now(alarm: &crate::state::Alarm, now: &chrono::DateTime<chrono::Local>) -> bool {
    use chrono::{Datelike, Timelike};
    if alarm.time.len() < 2 {
        return false;
    }
    let h = alarm.time[0] as u32;
    let m = alarm.time[1] as u32;
    if now.hour() != h || now.minute() != m {
        return false;
    }
    match alarm.occurrence.to_lowercase().as_str() {
        "daily" => true,
        "weekly" => {
            let today_wd = now.weekday().num_days_from_monday(); // Mon=0..Sun=6
            alarm.weekdays & (1 << today_wd) != 0
        }
        "once" => {
            if alarm.date.len() >= 3 {
                alarm.date[0] as i32 == now.year()
                    && alarm.date[1] as u32 == now.month()
                    && alarm.date[2] as u32 == now.day()
            } else {
                false
            }
        }
        "yearly" => {
            if alarm.date.len() >= 3 {
                alarm.date[1] as u32 == now.month() && alarm.date[2] as u32 == now.day()
            } else {
                false
            }
        }
        _ => false,
    }
}

fn update_register_validity(state: &mut AppState) {
    let r = &state.register;
    let email_ok = validate_email(&r.email);
    let password_ok = r.password.len() > 5;
    let passwords_match = r.password == r.confirm_password && !r.password.is_empty();
    state.register.form_valid = email_ok && password_ok && passwords_match;
}

// ── Color picker helpers ──────────────────────────────────────────────────────

fn current_color_hex(settings: &crate::state::SettingsState) -> String {
    match settings.color_mode {
        crate::state::ColorMode::Even => settings.card_colors.even.clone(),
        crate::state::ColorMode::Odd => settings.card_colors.odd.clone(),
        crate::state::ColorMode::Inactive => settings.card_colors.inactive.clone(),
        crate::state::ColorMode::Background => settings.card_colors.background.clone(),
    }
}

fn apply_current_color(settings: &mut crate::state::SettingsState, hex: String) {
    match settings.color_mode {
        crate::state::ColorMode::Even => settings.card_colors.even = hex,
        crate::state::ColorMode::Odd => settings.card_colors.odd = hex,
        crate::state::ColorMode::Inactive => settings.card_colors.inactive = hex,
        crate::state::ColorMode::Background => settings.card_colors.background = hex,
    }
}

fn hex_to_rgb_f(hex: &str) -> (f32, f32, f32) {
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

fn hex_to_hsv(hex: &str) -> (f32, f32, f32) {
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
        if h < 0.0 { h + 360.0 } else { h }
    } else if (max - g).abs() < 0.001 {
        60.0 * ((b - r) / delta + 2.0)
    } else {
        60.0 * ((r - g) / delta + 4.0)
    };
    (h, s, v)
}

fn hex_to_hue(hex: &str) -> f32 {
    hex_to_hsv(hex).0
}

fn hsv_to_hex(h: f32, s: f32, v: f32) -> String {
    let h = h % 360.0;
    let c = v * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = v - c;
    let (r, g, b) = if h < 60.0 { (c, x, 0.0) }
        else if h < 120.0 { (x, c, 0.0) }
        else if h < 180.0 { (0.0, c, x) }
        else if h < 240.0 { (0.0, x, c) }
        else if h < 300.0 { (x, 0.0, c) }
        else { (c, 0.0, x) };
    format!(
        "#{:02x}{:02x}{:02x}",
        ((r + m) * 255.0).round() as u8,
        ((g + m) * 255.0).round() as u8,
        ((b + m) * 255.0).round() as u8,
    )
}

fn new_window_settings() -> window::Settings {
    let icon = iced::window::icon::from_file_data(
        include_bytes!("../resources/icons/icon_32.png"),
        Some(image::ImageFormat::Png),
    )
    .ok();
    window::Settings {
        icon,
        platform_specific: window::settings::PlatformSpecific {
            application_id: "untamo".to_string(),
            ..Default::default()
        },
        ..window::Settings::default()
    }
}

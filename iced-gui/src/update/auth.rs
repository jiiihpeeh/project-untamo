use crate::messages::Message;
use crate::state::{AppPage, AppState, LoginRequest, LoginResponse, QrLoginRequest, SessionStatus, UserInfo, FRAME_READY, FRAME_VERSION};
use iced::Task;
use std::sync::atomic::Ordering;
use v4l::io::traits::CaptureStream;
use v4l::video::Capture;
use super::helpers::*;

pub(super) static CANCEL: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub(super) fn validate_email(email: &str) -> bool {
    email.contains('@') && email.len() > 3
}

pub(super) fn update_register_validity(state: &mut AppState) {
    let r = &state.register;
    let email_ok = validate_email(&r.email);
    let password_ok = r.password.len() > 5;
    let passwords_match = r.password == r.confirm_password && !r.password.is_empty();
    state.register.form_valid = email_ok && password_ok && passwords_match;
}

pub(super) fn capture_thread(_result_tx: std::sync::mpsc::Sender<Result<Option<String>, String>>) {
    CANCEL.store(false, Ordering::SeqCst);
    FRAME_VERSION.store(0, Ordering::SeqCst);

    let mut dev = match v4l::Device::new(0) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Failed to open camera: {}", e);
            return;
        }
    };

    let fourcc = v4l::FourCC::new(b"MJPG");
    let target_width = 640u32;
    let target_height = 480u32;
    let new_fmt = v4l::Format::new(target_width, target_height, fourcc);

    if dev.set_format(&new_fmt).is_err() {
    }

    let mut stream = match v4l::io::mmap::Stream::with_buffers(&mut dev, v4l::buffer::Type::VideoCapture, 4) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to create stream: {}", e);
            return;
        }
    };

    for attempt in 0.. {
        if CANCEL.load(Ordering::SeqCst) {
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

            let mut frame = crate::state::LATEST_FRAME.lock().unwrap();
            *frame = Some((width, height, pixels));
            drop(frame);
            FRAME_VERSION.fetch_add(1, Ordering::SeqCst);
            FRAME_READY.store(true, Ordering::SeqCst);
        }

        std::thread::sleep(std::time::Duration::from_millis(33));
    }
}

pub fn validate_session(state: &mut AppState) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    Task::perform(
        async move {
            let client = http_client();
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

pub fn session_invalid(state: &mut AppState) -> Task<Message> {
    crate::storage::clear_session();
    state.login.session_status = crate::state::SessionStatus::NotValid;
    state.login.user_info = None;
    state.page = AppPage::Login;
    state.ws.token = String::new();
    state.ws.ws_token = String::new();
    state.ws.ws_pair = String::new();
    Task::none()
}

pub fn fetch_update(state: &mut AppState) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    Task::perform(
        async move {
            let client = http_client();
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

pub fn update_received(state: &mut AppState, response: crate::state::UpdateResponse) -> Task<Message> {
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

pub fn update_error(_state: &mut AppState, error: String) -> Task<Message> {
    eprintln!("FetchUpdate error: {}", error);
    Task::none()
}

pub fn server_address_changed(state: &mut AppState, address: String) -> Task<Message> {
    state.server_address = address;
    Task::none()
}

pub fn email_changed(state: &mut AppState, email: String) -> Task<Message> {
    state.login.email = email;
    state.login.can_submit = validate_email(&state.login.email)
        && state.login.password.len() > 5;
    Task::none()
}

pub fn password_changed(state: &mut AppState, password: String) -> Task<Message> {
    state.login.password = password;
    state.login.can_submit = validate_email(&state.login.email)
        && state.login.password.len() > 5;
    Task::none()
}

pub fn submit(state: &mut AppState) -> Task<Message> {
    state.login.session_status = SessionStatus::Validating;
    state.login.error_message = None;
    let email = state.login.email.clone();
    let password = state.login.password.clone();
    let server = state.server_address.clone();
    Task::perform(
        async move {
            let client = http_client();
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

fn apply_login_response(state: &mut AppState, resp: LoginResponse) {
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
}

pub fn login_result(state: &mut AppState, result: Result<LoginResponse, String>) -> Task<Message> {
    match result {
        Ok(resp) => {
            apply_login_response(state, resp);
            Task::perform(async { Message::FetchUpdate }, |m| m)
        }
        Err(e) => {
            state.login.error_message = Some(e.clone());
            state.login.session_status = SessionStatus::NotValid;
            Task::none()
        }
    }
}

pub fn clear_error(state: &mut AppState) -> Task<Message> {
    state.login.error_message = None;
    Task::none()
}

pub fn toggle_qr_scanner(state: &mut AppState) -> Task<Message> {
    state.show_qr_scanner = !state.show_qr_scanner;
    state.qr_error = None;
    Task::none()
}

pub fn qr_token_input_changed(state: &mut AppState, value: String) -> Task<Message> {
    state.qr_token_input = value;
    state.qr_error = None;
    Task::none()
}

pub fn qr_submit(state: &mut AppState, qr_token: String) -> Task<Message> {
    if qr_token.is_empty() {
        state.qr_error = Some("Please enter a QR token".to_string());
        return Task::none();
    }
    let server = state.server_address.clone();
    let token = qr_token.clone();
    Task::perform(
        async move {
            let client = http_client();
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

pub fn qr_login_result(state: &mut AppState, result: Result<LoginResponse, String>) -> Task<Message> {
    state.show_qr_scanner = false;
    match result {
        Ok(resp) => {
            apply_login_response(state, resp);
            Task::perform(async { Message::FetchUpdate }, |m| m)
        }
        Err(e) => {
            state.qr_error = Some(e.clone());
            state.login.session_status = SessionStatus::NotValid;
            Task::none()
        }
    }
}

pub fn close_qr_scanner(state: &mut AppState) -> Task<Message> {
    CANCEL.store(true, Ordering::SeqCst);
    state.show_qr_scanner = false;
    state.qr_error = None;
    state.qr_token_input = String::new();
    Task::none()
}

pub fn start_scanner(state: &mut AppState) -> Task<Message> {
    state.show_qr_scanner = true;
    state.qr_scanning = true;
    state.qr_error = None;
    state.qr_frame_count = 0;
    state.qr_frame_data = None;
    FRAME_VERSION.store(0, Ordering::SeqCst);
    FRAME_READY.store(false, Ordering::SeqCst);
    CANCEL.store(false, Ordering::SeqCst);
    let (result_tx, result_rx) = std::sync::mpsc::channel();
    let cancel = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
    let cancel_clone = cancel.clone();
    std::thread::spawn(move || {
        capture_thread(result_tx);
    });
    std::thread::spawn(move || {
        while let Ok(result) = result_rx.recv() {
            if let Err(e) = result {
                eprintln!("capture_thread error: {}", e);
                cancel_clone.store(true, Ordering::SeqCst);
            }
        }
        CANCEL.store(true, Ordering::SeqCst);
    });
    Task::none()
}

pub fn camera_error(state: &mut AppState, err_msg: String) -> Task<Message> {
    state.qr_scanning = false;
    state.qr_error = Some(err_msg);
    Task::none()
}

pub fn qr_frame_refresh(state: &mut AppState, frame_data: Option<(u32, u32, Vec<u8>)>) -> Task<Message> {
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

pub fn qr_scanned(state: &mut AppState, token_opt: Option<String>) -> Task<Message> {
    if let Some(token) = token_opt {
        state.qr_scanning = false;
        let server = state.server_address.clone();
Task::perform(
        async move {
            let client = http_client();
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

pub fn navigate_to(state: &mut AppState, page: AppPage) -> Task<Message> {
    if page != AppPage::Alarms {
        state.show_alarm_pop = false;
    }
    state.page = page;
    Task::none()
}

pub fn go_to_register(state: &mut AppState) -> Task<Message> {
    state.page = AppPage::Register;
    Task::none()
}

pub fn go_to_login(state: &mut AppState) -> Task<Message> {
    state.page = AppPage::Login;
    Task::none()
}

pub fn register_first_name_changed(state: &mut AppState, name: String) -> Task<Message> {
    state.register.first_name = name;
    update_register_validity(state);
    Task::none()
}

pub fn register_last_name_changed(state: &mut AppState, name: String) -> Task<Message> {
    state.register.last_name = name;
    update_register_validity(state);
    Task::none()
}

pub fn register_email_changed(state: &mut AppState, email: String) -> Task<Message> {
    state.register.email = email;
    update_register_validity(state);
    Task::none()
}

pub fn register_password_changed(state: &mut AppState, password: String) -> Task<Message> {
    state.register.password = password;
    update_register_validity(state);
    Task::none()
}

pub fn register_confirm_password_changed(state: &mut AppState, password: String) -> Task<Message> {
    state.register.confirm_password = password;
    update_register_validity(state);
    Task::none()
}

pub fn submit_register(state: &mut AppState) -> Task<Message> {
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
            let client = http_client();
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

pub fn register_result(state: &mut AppState, result: Result<(), String>) -> Task<Message> {
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

pub fn ws_connect(state: &mut AppState) -> Task<Message> {
    use crate::websocket;
    use tokio::sync::mpsc;

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

pub fn ws_disconnect(state: &mut AppState) -> Task<Message> {
    crate::websocket::disconnect();
    state.ws.connected = false;
    Task::none()
}

pub fn ws_message_received(state: &mut AppState, result: Result<crate::websocket::WsMessage, String>) -> Task<Message> {
    match result {
        Ok(msg) => {
            state.ws.connected = true;
            handle_ws_message(state, msg);
        }
        Err(e) => {
            eprintln!("WS error: {}", e);
            state.ws.connected = false;
        }
    }
    Task::none()
}

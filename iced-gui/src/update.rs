use crate::audio;
use crate::messages::Message;
use crate::state::{Alarm, AppState, AppPage, CardColors, Device, LoginRequest, LoginResponse, QrLoginRequest, SessionStatus, LATEST_FRAME, FRAME_VERSION, FRAME_READY, UserInfo, WebColors};
use crate::websocket::{self, WsMessage as WsMsg};
use iced::Task;
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
        Message::FrameTick => Task::none(),
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
                        email: resp.email,
                        screen_name: resp.screen_name,
                        first_name: resp.first_name,
                        last_name: resp.last_name,
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                    });
                    state.page = AppPage::Welcome;
                }
                Err(e) => {
                    state.login.error_message = Some(e.clone());
                    state.login.session_status = SessionStatus::NotValid;
                }
            };
            Task::none()
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
                        email: resp.email,
                        screen_name: resp.screen_name,
                        first_name: resp.first_name,
                        last_name: resp.last_name,
                        admin: resp.admin,
                        owner: resp.owner,
                        active: resp.active,
                    });
                    state.page = AppPage::Welcome;
                }
                Err(e) => {
                    state.qr_error = Some(e.clone());
                    state.login.session_status = SessionStatus::NotValid;
                }
            };
            Task::none()
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
            state.welcome.clock24 = !state.welcome.clock24;
            Task::none()
        }
        Message::ToggleSettings => {
            state.settings.show_settings = !state.settings.show_settings;
            Task::none()
        }
        Message::SetNavBarTop(value) => {
            state.settings.nav_bar_top = value;
            Task::none()
        }
        Message::SetPanelSize(size) => {
            state.settings.panel_size = size;
            Task::none()
        }
        Message::SetVolume(volume) => {
            state.settings.volume = volume;
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
            
            tokio::spawn(async move {
                websocket::ws_connect(&server, &ws_token, &ws_pair, tx).await;
            });
            
            Task::none()
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
            Task::none()
        }
        Message::SetColorMode(mode) => {
            state.settings.color_mode = mode;
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
        Message::ToggleAddAlarm => {
            state.show_add_alarm = !state.show_add_alarm;
            if state.show_add_alarm {
                state.add_alarm = crate::state::AddAlarmState::new();
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
        Message::SubmitAddAlarm => {
            let new_alarm = Alarm {
                id: uuid_simple(),
                occurrence: state.add_alarm.occurrence.clone(),
                time: vec![state.add_alarm.time_hour, state.add_alarm.time_minute],
                weekdays: state.add_alarm.weekdays,
                date: vec![],
                label: state.add_alarm.label.clone(),
                devices: vec![],
                active: true,
                tune: state.add_alarm.tune.clone(),
                message: String::new(),
            };
            state.alarms.push(new_alarm);
            state.show_add_alarm = false;
            state.add_alarm = crate::state::AddAlarmState::new();
            add_notification(state, "Alarm", "Alarm added".to_string());
            Task::none()
        }
        Message::CancelAddAlarm => {
            state.show_add_alarm = false;
            state.add_alarm = crate::state::AddAlarmState::new();
            Task::none()
        }
        Message::TriggerAlarm(alarm_id) => {
            if let Some(alarm) = state.alarms.iter().find(|a| a.id == alarm_id) {
                state.playing_alarm = Some(alarm.clone());
                state.page = AppPage::PlayAlarm;
                if let Err(e) = audio::play_audio_file(&alarm.tune, state.settings.volume, true) {
                    println!("Failed to play alarm: {}", e);
                }
            }
            Task::none()
        }
        Message::SnoozeAlarm => {
            audio::stop_audio();
            state.playing_alarm = None;
            state.page = AppPage::Alarms;
            add_notification(state, "Alarm", format!("Snoozed for {} minutes", state.snooze_minutes));
            Task::none()
        }
        Message::DismissAlarm => {
            audio::stop_audio();
            state.playing_alarm = None;
            state.turn_off = false;
            state.page = AppPage::Alarms;
            Task::none()
        }
        Message::SetTurnOff(value) => {
            state.turn_off = value;
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
        Message::GoToLogout => {
            state.login.session_status = crate::state::SessionStatus::NotValid;
            state.login.user_info = None;
            state.page = AppPage::Login;
            state.alarms.clear();
            state.devices.clear();
            Task::none()
        }
        Message::EditAlarm(id) => {
            add_notification(state, "Edit Alarm", format!("Editing alarm {}", id));
            Task::none()
        }
        Message::DeleteAlarm(id) => {
            if let Some(pos) = state.alarms.iter().position(|a| a.id == id) {
                state.alarms.remove(pos);
                add_notification(state, "Alarm Deleted", "Alarm removed successfully".to_string());
            }
            Task::none()
        }
        Message::ToggleAlarmActive(id) => {
            if let Some(alarm) = state.alarms.iter_mut().find(|a| a.id == id) {
                alarm.active = !alarm.active;
            }
            Task::none()
        }
        Message::AddDevice => {
            add_notification(state, "Add Device", "Device pairing not yet implemented".to_string());
            Task::none()
        }
        Message::EditDevice(id) => {
            add_notification(state, "Edit Device", format!("Editing device {}", id));
            Task::none()
        }
        Message::DeleteDevice(id) => {
            if let Some(pos) = state.devices.iter().position(|d| d.id == id) {
                state.devices.remove(pos);
                add_notification(state, "Device Deleted", "Device removed successfully".to_string());
            }
            Task::none()
        }
        Message::ToggleEditProfile => {
            state.edit_profile.show = !state.edit_profile.show;
            if state.edit_profile.show {
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
            if state.edit_profile.form_valid {
                add_notification(state, "Profile Updated", "Your profile has been updated".to_string());
                state.edit_profile.show = false;
            }
            Task::none()
        }
        Message::CancelEditProfile => {
            state.edit_profile.show = false;
            Task::none()
        }
    }
}

fn add_notification(state: &mut AppState, title: &str, message: String) {
    let notif = crate::state::Notification {
        title: title.to_string(),
        message,
        timestamp: std::time::Instant::now(),
    };
    state.notifications.push(notif);
    if state.notifications.len() > 5 {
        state.notifications.remove(0);
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
                    state.devices.push(device);
                }
            }
        }
        WsMessageType::DeviceDelete => {
            if let Some(id) = msg.data.as_str() {
                state.devices.retain(|d| d.id != id);
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
        date: value.get("date")?.as_array()?.iter().filter_map(|v| v.as_u64()).map(|n| n as u8).collect(),
        label: value.get("label")?.as_str()?.to_string(),
        devices: value.get("devices")?.as_array()?.iter().filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
        active: value.get("active")?.as_bool()?,
        tune: value.get("tune")?.as_str()?.to_string(),
        message: value.get("message")?.as_str()?.to_string(),
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
        email: value.get("email")?.as_str()?.to_string(),
        screen_name: value.get("screenName").or_else(|| value.get("screen_name"))?.as_str()?.to_string(),
        first_name: value.get("firstName").or_else(|| value.get("first_name"))?.as_str()?.to_string(),
        last_name: value.get("lastName").or_else(|| value.get("last_name"))?.as_str()?.to_string(),
        admin: value.get("admin")?.as_bool()?,
        owner: value.get("owner")?.as_bool()?,
        active: value.get("active")?.as_bool()?,
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

fn update_register_validity(state: &mut AppState) {
    let r = &state.register;
    let email_ok = validate_email(&r.email);
    let password_ok = r.password.len() > 5;
    let passwords_match = r.password == r.confirm_password && !r.password.is_empty();
    state.register.form_valid = email_ok && password_ok && passwords_match;
}

use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64};

pub static LATEST_FRAME: std::sync::Mutex<Option<(u32, u32, Vec<u8>)>> =
    std::sync::Mutex::new(None);
pub static FRAME_VERSION: AtomicU64 = AtomicU64::new(0);
pub static FRAME_READY: AtomicBool = AtomicBool::new(false);

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub email: String,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub admin: bool,
    pub owner: bool,
    pub active: bool,
}

#[derive(Clone, Debug, Deserialize)]
pub struct LoginResponse {
    #[allow(dead_code)]
    pub ws_token: String,
    #[allow(dead_code)]
    pub token: String,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub admin: bool,
    pub email: String,
    #[allow(dead_code)]
    pub time: i64,
    pub owner: bool,
    #[allow(dead_code)]
    pub ws_pair: String,
    pub active: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct QrLoginRequest {
    pub qr_token: String,
}

#[derive(Clone, Debug, PartialEq)]
pub enum SessionStatus {
    Unknown,
    NotValid,
    Valid,
    #[allow(dead_code)]
    Activate,
    Validating,
}

#[derive(Clone, Debug)]
pub struct LoginState {
    pub email: String,
    pub password: String,
    pub session_status: SessionStatus,
    pub error_message: Option<String>,
    pub can_submit: bool,
    pub user_info: Option<UserInfo>,
}

impl LoginState {
    pub fn new() -> Self {
        LoginState {
            email: String::new(),
            password: String::new(),
            session_status: SessionStatus::Unknown,
            error_message: None,
            can_submit: false,
            user_info: None,
        }
    }
}

impl Default for LoginState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum AppPage {
    Login,
    Register,
    Welcome,
    Alarms,
    Devices,
    User,
    PlayAlarm,
}

#[derive(Clone, Debug)]
pub struct RegisterState {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub confirm_password: String,
    pub form_valid: bool,
    pub error_message: Option<String>,
    pub registered: bool,
}

impl RegisterState {
    pub fn new() -> Self {
        RegisterState {
            first_name: String::new(),
            last_name: String::new(),
            email: String::new(),
            password: String::new(),
            confirm_password: String::new(),
            form_valid: false,
            error_message: None,
            registered: false,
        }
    }
}

impl Default for RegisterState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct WelcomeState {
    pub clock24: bool,
}

impl WelcomeState {
    pub fn new() -> Self {
        WelcomeState { clock24: true }
    }
}

impl Default for WelcomeState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct Alarm {
    pub id: String,
    pub occurrence: String,
    pub time: Vec<u8>,
    #[allow(dead_code)]
    pub weekdays: u8,
    #[allow(dead_code)]
    pub date: Vec<u8>,
    pub label: String,
    #[allow(dead_code)]
    pub devices: Vec<String>,
    pub active: bool,
    pub tune: String,
    #[allow(dead_code)]
    pub message: String,
}

#[derive(Clone, Debug)]
pub struct Device {
    pub id: String,
    pub device_name: String,
    pub device_type: String,
}

#[derive(Clone, Debug)]
pub struct WebColors {
    #[allow(dead_code)]
    pub even: String,
    #[allow(dead_code)]
    pub odd: String,
    #[allow(dead_code)]
    pub inactive: String,
    #[allow(dead_code)]
    pub background: String,
}

impl Default for WebColors {
    fn default() -> Self {
        WebColors {
            even: "#c4ffff".to_string(),
            odd: "#ffff9d".to_string(),
            inactive: "#ececec".to_string(),
            background: "#ffffff".to_string(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct CardColors {
    pub even: String,
    pub odd: String,
    pub inactive: String,
    pub background: String,
}

impl Default for CardColors {
    fn default() -> Self {
        CardColors {
            even: "#c4ffff".to_string(),
            odd: "#ffff9d".to_string(),
            inactive: "#ececec".to_string(),
            background: "#ffffff".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ColorMode {
    Even,
    Odd,
    Inactive,
    Background,
}

impl ColorMode {
    #[allow(dead_code)]
    pub fn next(&self) -> Self {
        match self {
            ColorMode::Even => ColorMode::Odd,
            ColorMode::Odd => ColorMode::Inactive,
            ColorMode::Inactive => ColorMode::Background,
            ColorMode::Background => ColorMode::Even,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            ColorMode::Even => "Even",
            ColorMode::Odd => "Odd",
            ColorMode::Inactive => "Inactive",
            ColorMode::Background => "Background",
        }
    }
}

#[derive(Clone, Debug)]
pub struct SettingsState {
    pub nav_bar_top: bool,
    pub panel_size: u32,
    pub clock24: bool,
    pub volume: f32,
    pub dialog_size: u32,
    pub show_settings: bool,
    pub show_colors: bool,
    pub web_colors: WebColors,
    pub card_colors: CardColors,
    pub color_mode: ColorMode,
}

impl SettingsState {
    pub fn new() -> Self {
        SettingsState {
            nav_bar_top: true,
            panel_size: 56,
            clock24: true,
            volume: 0.9,
            dialog_size: 1,
            show_settings: false,
            show_colors: false,
            web_colors: WebColors::default(),
            card_colors: CardColors::default(),
            color_mode: ColorMode::Odd,
        }
    }
}

impl Default for SettingsState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct WsState {
    pub ws_token: String,
    pub ws_pair: String,
    pub connected: bool,
}

impl WsState {
    pub fn new() -> Self {
        WsState {
            ws_token: String::new(),
            ws_pair: String::new(),
            connected: false,
        }
    }
}

impl Default for WsState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct Notification {
    pub title: String,
    pub message: String,
    #[allow(dead_code)]
    pub timestamp: std::time::Instant,
}

#[derive(Clone, Debug)]
pub struct AddAlarmState {
    #[allow(dead_code)]
    pub show: bool,
    pub label: String,
    pub time_hour: u8,
    pub time_minute: u8,
    pub weekdays: u8,
    pub occurrence: String,
    pub tune: String,
}

impl AddAlarmState {
    pub fn new() -> Self {
        AddAlarmState {
            show: false,
            label: String::new(),
            time_hour: 8,
            time_minute: 0,
            weekdays: 0,
            occurrence: "Daily".to_string(),
            tune: String::new(),
        }
    }
}

impl Default for AddAlarmState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct EditProfileState {
    pub show: bool,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub new_password: String,
    pub confirm_password: String,
    pub change_password: bool,
    pub form_valid: bool,
}

impl EditProfileState {
    pub fn new() -> Self {
        EditProfileState {
            show: false,
            screen_name: String::new(),
            first_name: String::new(),
            last_name: String::new(),
            email: String::new(),
            password: String::new(),
            new_password: String::new(),
            confirm_password: String::new(),
            change_password: false,
            form_valid: false,
        }
    }

    pub fn validate(&mut self) {
        let base_valid = !self.screen_name.is_empty()
            && !self.first_name.is_empty()
            && !self.last_name.is_empty()
            && !self.email.is_empty()
            && self.email.contains('@')
            && self.password.len() >= 6;

        if self.change_password {
            self.form_valid = base_valid
                && self.new_password.len() >= 6
                && self.new_password == self.confirm_password
                && self.new_password != self.password;
        } else {
            self.form_valid = base_valid;
        }
    }
}

impl Default for EditProfileState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug)]
pub struct AppState {
    pub page: AppPage,
    pub login: LoginState,
    pub register: RegisterState,
    pub welcome: WelcomeState,
    pub settings: SettingsState,
    pub ws: WsState,
    pub alarms: Vec<Alarm>,
    pub devices: Vec<Device>,
    pub server_address: String,
    pub show_qr_scanner: bool,
    pub qr_error: Option<String>,
    pub qr_scanning: bool,
    pub qr_token_input: String,
    pub qr_frame_count: u32,
    pub qr_refresh_toggle: bool,
    pub qr_frame_data: Option<(u32, u32, Vec<u8>)>,
    pub show_add_alarm: bool,
    pub add_alarm: AddAlarmState,
    pub playing_alarm: Option<Alarm>,
    pub snooze_minutes: u32,
    pub turn_off: bool,
    pub notifications: Vec<Notification>,
    pub edit_profile: EditProfileState,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            page: AppPage::Login,
            login: LoginState::new(),
            register: RegisterState::new(),
            welcome: WelcomeState::new(),
            settings: SettingsState::new(),
            ws: WsState::new(),
            alarms: Vec::new(),
            devices: Vec::new(),
            server_address: String::from("http://localhost:8080"),
            show_qr_scanner: false,
            qr_error: None,
            qr_scanning: false,
            qr_token_input: String::new(),
            qr_frame_count: 0,
            qr_refresh_toggle: false,
            qr_frame_data: None,
            show_add_alarm: false,
            add_alarm: AddAlarmState::new(),
            playing_alarm: None,
            snooze_minutes: 5,
            turn_off: false,
            notifications: Vec::new(),
            edit_profile: EditProfileState::new(),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

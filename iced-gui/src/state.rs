use iced::Color;
use iced_aw::date_picker::Date;
use iced_aw::time_picker::{Period, Time};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64};

pub static LATEST_FRAME: std::sync::Mutex<Option<(u32, u32, Vec<u8>)>> =
    std::sync::Mutex::new(None);
pub static FRAME_VERSION: AtomicU64 = AtomicU64::new(0);
pub static FRAME_READY: AtomicBool = AtomicBool::new(false);

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserInfo {
    pub user: String,
    pub email: String,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub admin: bool,
    pub owner: bool,
    pub active: bool,
    pub registered: i64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub token: String,
    pub ws_token: String,
    pub email: String,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub admin: bool,
    pub owner: bool,
    pub active: bool,
    pub time: i64,
    pub ws_pair: String,
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

#[derive(Clone, Debug, PartialEq)]
pub enum DeviceSelect {
    None,
    Device(Device),
}

impl Default for DeviceSelect {
    fn default() -> Self {
        DeviceSelect::None
    }
}

impl std::fmt::Display for DeviceSelect {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DeviceSelect::None => write!(f, ""),
            DeviceSelect::Device(d) => write!(f, "{}", d.device_name),
        }
    }
}

#[derive(Clone, Debug)]
pub struct WelcomeState {
    pub clock24: bool,
    pub selected_device: DeviceSelect,
}

impl WelcomeState {
    pub fn new() -> Self {
        WelcomeState {
            clock24: true,
            selected_device: DeviceSelect::None,
        }
    }
}

impl Default for WelcomeState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Alarm {
    pub id: String,
    pub occurrence: String,
    pub time: Vec<u8>,
    pub weekdays: u8,
    pub date: Vec<u16>,
    pub label: String,
    pub devices: Vec<String>,
    pub snooze: Vec<i64>,
    pub tune: String,
    pub active: bool,
    pub modified: i64,
    pub fingerprint: String,
    pub close_task: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    pub id: String,
    pub device_name: String,
    #[serde(rename = "type")]
    pub device_type: String,
}

impl PartialEq for Device {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum DeviceType {
    Browser,
    Tablet,
    Phone,
    Desktop,
    IoT,
    Other,
}

impl Default for DeviceType {
    fn default() -> Self {
        DeviceType::Other
    }
}

impl From<&str> for DeviceType {
    fn from(s: &str) -> Self {
        match s {
            "Browser" => DeviceType::Browser,
            "Tablet" => DeviceType::Tablet,
            "Phone" => DeviceType::Phone,
            "Desktop" => DeviceType::Desktop,
            "IoT" => DeviceType::IoT,
            _ => DeviceType::Other,
        }
    }
}

impl From<DeviceType> for String {
    fn from(dt: DeviceType) -> String {
        match dt {
            DeviceType::Browser => "Browser".to_string(),
            DeviceType::Tablet => "Tablet".to_string(),
            DeviceType::Phone => "Phone".to_string(),
            DeviceType::Desktop => "Desktop".to_string(),
            DeviceType::IoT => "IoT".to_string(),
            DeviceType::Other => "Other".to_string(),
        }
    }
}

impl std::fmt::Display for DeviceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DeviceType::Browser => write!(f, "Browser"),
            DeviceType::Tablet => write!(f, "Tablet"),
            DeviceType::Phone => write!(f, "Phone"),
            DeviceType::Desktop => write!(f, "Desktop"),
            DeviceType::IoT => write!(f, "IoT"),
            DeviceType::Other => write!(f, "Other"),
        }
    }
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateResponse {
    pub user: UserInfo,
    pub alarms: Vec<Alarm>,
    pub devices: Vec<Device>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct AuthToken {
    pub token: String,
    pub ws_token: String,
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
    pub show_color_picker: bool,
    pub color_picker_value: Color,
    pub web_colors: WebColors,
    pub card_colors: CardColors,
    pub color_mode: ColorMode,
    pub close_task_behavior: CloseTaskBehavior,
    pub snooze_press_ms: u32,
    pub notifications_enabled: bool,
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
            show_color_picker: false,
            color_picker_value: Color::from_rgb(1.0, 1.0, 0.5),
            web_colors: WebColors::default(),
            card_colors: CardColors::default(),
            color_mode: ColorMode::Odd,
            close_task_behavior: CloseTaskBehavior::Obey,
            snooze_press_ms: 200,
            notifications_enabled: true,
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
    pub token: String,
    pub ws_token: String,
    pub ws_pair: String,
    pub connected: bool,
}

impl WsState {
    pub fn new() -> Self {
        WsState {
            token: String::new(),
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

#[derive(Clone, Debug, PartialEq)]
pub enum NotificationKind {
    Success,
    Error,
    Warning,
    Info,
}

#[derive(Clone, Debug)]
pub struct Notification {
    pub title: String,
    pub message: String,
    pub kind: NotificationKind,
    pub timestamp: std::time::Instant,
}

#[derive(Clone, Debug, PartialEq)]
pub enum CloseTaskBehavior {
    Obey,
    Ignore,
    Force,
}

impl std::fmt::Display for CloseTaskBehavior {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CloseTaskBehavior::Obey => write!(f, "Obey"),
            CloseTaskBehavior::Ignore => write!(f, "Ignore"),
            CloseTaskBehavior::Force => write!(f, "Force"),
        }
    }
}

impl CloseTaskBehavior {
    pub fn all() -> &'static [CloseTaskBehavior] {
        &[
            CloseTaskBehavior::Obey,
            CloseTaskBehavior::Ignore,
            CloseTaskBehavior::Force,
        ]
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum AlarmOccurrence {
    Once,
    Daily,
    Weekly,
    Yearly,
}

impl AlarmOccurrence {
    pub fn as_str(&self) -> &'static str {
        match self {
            AlarmOccurrence::Once => "once",
            AlarmOccurrence::Daily => "daily",
            AlarmOccurrence::Weekly => "weekly",
            AlarmOccurrence::Yearly => "yearly",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "once" => AlarmOccurrence::Once,
            "daily" => AlarmOccurrence::Daily,
            "yearly" => AlarmOccurrence::Yearly,
            _ => AlarmOccurrence::Weekly,
        }
    }

    pub fn all() -> &'static [AlarmOccurrence] {
        &[
            AlarmOccurrence::Once,
            AlarmOccurrence::Daily,
            AlarmOccurrence::Weekly,
            AlarmOccurrence::Yearly,
        ]
    }

    pub fn shows_date(&self) -> bool {
        matches!(self, AlarmOccurrence::Once | AlarmOccurrence::Yearly)
    }

    pub fn shows_weekdays(&self) -> bool {
        matches!(self, AlarmOccurrence::Weekly)
    }
}

impl std::fmt::Display for AlarmOccurrence {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AlarmOccurrence::Once => write!(f, "Once"),
            AlarmOccurrence::Daily => write!(f, "Daily"),
            AlarmOccurrence::Weekly => write!(f, "Weekly"),
            AlarmOccurrence::Yearly => write!(f, "Yearly"),
        }
    }
}

#[derive(Clone, Debug)]
pub struct AddAlarmState {
    #[allow(dead_code)]
    pub show: bool,
    pub editing_alarm_id: Option<String>,
    pub previewing_tune: Option<String>,
    pub preview_started: bool,
    pub label: String,
    pub time_hour: u8,
    pub time_minute: u8,
    pub weekdays: u8,
    pub occurrence: AlarmOccurrence,
    pub tune: String,
    pub active: bool,
    pub close_task: bool,
    pub devices: Vec<String>,
    pub show_time_picker: bool,
    pub time_picker_value: Time,
    pub show_date_picker: bool,
    pub date_picker_value: Date,
}

impl AddAlarmState {
    pub fn new() -> Self {
        AddAlarmState {
            show: false,
            editing_alarm_id: None,
            previewing_tune: None,
            preview_started: false,
            label: "Alarm".to_string(),
            time_hour: 8,
            time_minute: 0,
            weekdays: 0,
            occurrence: AlarmOccurrence::Weekly,
            tune: "rooster".to_string(),
            active: true,
            close_task: false,
            devices: Vec::new(),
            show_time_picker: false,
            time_picker_value: Time::Hm {
                hour: 8,
                minute: 0,
                period: Period::H24,
            },
            show_date_picker: false,
            date_picker_value: Date::default(),
        }
    }

    pub fn from_alarm(alarm: &Alarm) -> Self {
        let time_hour = if alarm.time.len() >= 2 {
            alarm.time[0] as u32
        } else {
            8
        };
        let time_minute = if alarm.time.len() >= 2 {
            alarm.time[1] as u32
        } else {
            0
        };
        let date_picker_value = if alarm.date.len() >= 3 {
            Date::from_ymd(
                alarm.date[0] as i32,
                alarm.date[1] as u32,
                alarm.date[2] as u32,
            )
        } else {
            Date::default()
        };
        AddAlarmState {
            show: true,
            editing_alarm_id: Some(alarm.id.clone()),
            previewing_tune: None,
            preview_started: false,
            label: alarm.label.clone(),
            time_hour: time_hour as u8,
            time_minute: time_minute as u8,
            weekdays: alarm.weekdays,
            occurrence: AlarmOccurrence::from_str(&alarm.occurrence),
            tune: alarm.tune.clone(),
            active: alarm.active,
            close_task: alarm.close_task,
            devices: alarm.devices.clone(),
            show_time_picker: false,
            time_picker_value: Time::Hm {
                hour: time_hour,
                minute: time_minute,
                period: Period::H24,
            },
            show_date_picker: false,
            date_picker_value,
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

/// What the user is being asked to confirm deleting.
#[derive(Clone, Debug)]
pub enum PendingDelete {
    Alarm(String),
    Device(String),
}

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
    pub editing_device: Option<Device>,
    pub editing_device_name: String,
    pub editing_device_type: DeviceType,
    pub available_tunes: Vec<String>,
    pub window_id: Option<iced::window::Id>,
    pub pending_delete: Option<PendingDelete>,
    pub show_user_menu: bool,
    pub hovered_alarm: Option<String>,
    pub show_devices_modal: bool,
    pub show_about: bool,
    pub adding_device: bool,
    /// Device ID persisted from last session; used to skip the welcome screen.
    pub saved_device_id: Option<String>,
    /// Which device IDs should show their alarms (mirrors frontend viewableDevices).
    pub viewable_devices: Vec<String>,
    /// When the logo hover animation started (runs for 2 s then stops).
    pub logo_anim_start: Option<std::time::Instant>,
    /// Accumulated tick for the play-alarm animation (seconds, wraps freely).
    pub alarm_anim_tick: f32,
    /// When the snooze button was first pressed (for hold-to-snooze timing).
    pub snooze_press_start: Option<std::time::Instant>,
    /// Last (hour, minute) when alarm scheduling was checked — avoids duplicate triggers.
    pub last_alarm_minute: Option<(u32, u32)>,
    /// Whether the alarm info pop-bubble is visible.
    pub show_alarm_pop: bool,
}

impl AppState {
    pub fn new() -> Self {
        let settings = crate::storage::load_settings();
        let saved_session = crate::storage::load_session();

        let mut login = LoginState::new();
        let mut ws = WsState::new();

        let session_valid = if let Some(session) = saved_session {
            login.session_status = SessionStatus::Valid;
            login.user_info = Some(crate::state::UserInfo {
                user: String::new(),
                email: session.email,
                screen_name: session.screen_name,
                first_name: session.first_name,
                last_name: session.last_name,
                admin: session.admin,
                owner: session.owner,
                active: session.active,
                registered: 0,
            });
            ws.token = session.token;
            ws.ws_token = session.ws_token;
            ws.ws_pair = session.ws_pair;
            true
        } else {
            false
        };

        let saved_device_id = settings.device_id.clone();
        let viewable_devices = settings.viewable_devices.clone();

        AppState {
            page: if session_valid {
                AppPage::Welcome
            } else {
                AppPage::Login
            },
            login,
            register: RegisterState::new(),
            welcome: WelcomeState {
                clock24: settings.clock24,
                selected_device: DeviceSelect::None,
            },
            settings: SettingsState {
                clock24: settings.clock24,
                volume: settings.volume,
                nav_bar_top: settings.nav_bar_top,
                panel_size: settings.panel_size,
                ..SettingsState::new()
            },
            ws,
            alarms: Vec::new(),
            devices: Vec::new(),
            server_address: String::from("http://localhost:3001"),
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
            editing_device: None,
            editing_device_name: String::new(),
            editing_device_type: DeviceType::default(),
            available_tunes: vec!["rooster".to_string()],
            window_id: None,
            pending_delete: None,
            show_user_menu: false,
            show_devices_modal: false,
            show_about: false,
            hovered_alarm: None,
            adding_device: false,
            saved_device_id,
            viewable_devices,
            logo_anim_start: None,
            alarm_anim_tick: 0.0,
            snooze_press_start: None,
            last_alarm_minute: None,
            show_alarm_pop: false,
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

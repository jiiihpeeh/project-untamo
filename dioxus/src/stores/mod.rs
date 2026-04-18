use dioxus::prelude::*;

#[derive(Clone, Debug)]
pub struct AppStore {
    pub alarms: Vec<super::Alarm>,
    pub devices: Vec<super::Device>,
    pub current_device: Option<super::Device>,
    pub viewable_devices: Vec<super::Device>,
    pub user: Option<super::User>,
    pub session_valid: super::SessionStatus,
    pub ws_token: Option<String>,
    pub token: Option<String>,
    pub signed_in: bool,
    pub expire: u64,
    pub token_time: u64,
    pub ws_pair: Option<String>,
    pub nav_bar_top: bool,
    pub mt: i32,
    pub mb: i32,
    pub height: i32,
    pub card_colors: super::CardColors,
    pub clock_24: bool,
    pub close_task: super::CloseTask,
    pub snooze_press: u32,
    pub is_light: bool,
    pub volume: f32,
    pub notification_type: super::NotificationType,
    pub web_colors: super::WebColors,
    pub address: String,
    pub ws_address: String,
    pub current_path: super::Path,
    pub admin_time: u64,
    pub show_settings: bool,
    pub show_user_menu: bool,
    pub show_device_menu: bool,
    pub show_admin_pop: bool,
    pub show_alarm_pop: bool,
    pub show_edit_alarm: bool,
    pub show_delete_alarm: bool,
    pub show_about: bool,
    pub show_server_edit: bool,
    pub plays: bool,
    pub show_edit_device: bool,
    pub show_delete_device: bool,
    pub show_add_device: bool,
    pub show_qr_pairing: bool,
    pub show_qr_login: bool,
    pub show_logout: bool,
    pub show_edit_profile: bool,
    pub show_admin_login: bool,
    pub logo: String,
    pub is_mobile: bool,
    pub window_size: WindowSize,
    pub navigation_triggered: u32,
}

#[derive(Clone, Debug, Default)]
pub struct WindowSize {
    pub width: i32,
    pub height: i32,
    pub landscape: bool,
}

impl Default for AppStore {
    fn default() -> Self {
        AppStore {
            alarms: Vec::new(),
            devices: Vec::new(),
            current_device: None,
            viewable_devices: Vec::new(),
            user: None,
            session_valid: super::SessionStatus::Unknown,
            ws_token: None,
            token: None,
            signed_in: false,
            expire: 0,
            token_time: 0,
            ws_pair: None,
            nav_bar_top: true,
            mt: 0,
            mb: 0,
            height: 50,
            card_colors: super::CardColors {
                even: "#ffffff".into(),
                odd: "#f0f0f0".into(),
                inactive: "#cccccc".into(),
            },
            clock_24: true,
            close_task: super::CloseTask::Obey,
            snooze_press: 5,
            is_light: true,
            volume: 0.8,
            notification_type: super::NotificationType::Both,
            web_colors: super::WebColors {
                primary: "#347ce4".into(),
            },
            address: "http://localhost:8080".into(),
            ws_address: "ws://localhost:8080".into(),
            current_path: super::Path::Login,
            admin_time: 0,
            show_settings: false,
            show_user_menu: false,
            show_device_menu: false,
            show_admin_pop: false,
            show_alarm_pop: false,
            show_edit_alarm: false,
            show_delete_alarm: false,
            show_about: false,
            show_server_edit: false,
            plays: false,
            show_edit_device: false,
            show_delete_device: false,
            show_add_device: false,
            show_qr_pairing: false,
            show_qr_login: false,
            show_logout: false,
            show_edit_profile: false,
            show_admin_login: false,
            logo: String::new(),
            is_mobile: false,
            window_size: WindowSize {
                width: 450,
                height: 790,
                landscape: false,
            },
            navigation_triggered: 0,
        }
    }
}

pub fn use_store() -> Signal<AppStore> {
    use_context()
}

#[component]
pub fn StoreProvider(children: Element) -> Element {
    let store = use_signal(AppStore::default);
    provide_context(store);
    rsx! { {children} }
}

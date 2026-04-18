use dioxus::prelude::*;

pub mod stores;
pub use stores::{use_store, AppStore, StoreProvider};

pub fn run() {
    dioxus::LaunchBuilder::new().launch(App);
}

#[derive(Debug, Clone, Copy, PartialEq, Default, serde::Serialize, serde::Deserialize)]
pub enum Path {
    #[default]
    Login,
    Register,
    Welcome,
    Alarms,
    Admin,
    NotFound,
    PlayAlarm,
    Activate,
    Owner,
    ResetPassword,
    Base,
}

#[derive(Debug, Clone, Copy, PartialEq, Default, serde::Serialize, serde::Deserialize)]
pub enum SessionStatus {
    #[default]
    Unknown,
    Valid,
    NotValid,
    Activate,
}

#[derive(Debug, Clone, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct CardColors {
    pub even: String,
    pub odd: String,
    pub inactive: String,
}

fn get_bg_color(colors: &CardColors, idx: usize, active: bool) -> String {
    if !active {
        colors.inactive.clone()
    } else if idx % 2 == 0 {
        colors.even.clone()
    } else {
        colors.odd.clone()
    }
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct WebColors {
    pub primary: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Default, serde::Serialize, serde::Deserialize)]
pub enum NotificationType {
    #[default]
    Sound,
    Popup,
    Both,
}

#[derive(Debug, Clone, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Alarm {
    pub id: String,
    pub label: String,
    pub time: [u8; 2],
    pub active: bool,
    pub occurrence: String,
}

#[derive(Debug, Clone, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Device {
    pub id: String,
    pub device_name: String,
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct User {
    pub screen_name: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Default, serde::Serialize, serde::Deserialize)]
pub enum CloseTask {
    #[default]
    Obey,
    Ignore,
    Force,
}

#[component]
fn App() -> Element {
    rsx! {
        StoreProvider {
            NavGrid {}
            main { id: "App-Container",
                Router {}
            }
            ToastContainer {}
            SettingsModal {}
            AboutModal {}
            ServerModal {}
        }
    }
}

#[component]
fn Router() -> Element {
    let store = use_store();
    let path = store.read().current_path;

    match path {
        Path::Login | Path::Base => rsx! { LogIn {} },
        Path::Register => rsx! { Register {} },
        Path::Welcome => rsx! { Welcome {} },
        Path::Alarms => rsx! { Alarms {} },
        Path::Activate => rsx! { Activate {} },
        Path::Admin => rsx! { Admin {} },
        Path::Owner => rsx! { Owner {} },
        Path::ResetPassword => rsx! { ResetPassword {} },
        Path::PlayAlarm => rsx! { PlayAlarm {} },
        Path::NotFound => rsx! { Clueless {} },
    }
}

#[derive(Props, Clone, PartialEq)]
pub struct NavItem {
    pub path: Path,
    pub label: &'static str,
    pub onclick: Option<EventHandler>,
}

#[component]
fn NavGrid() -> Element {
    let mut store = use_store();
    let session = store.read().session_valid;
    let path = store.read().current_path;
    let plays = store.read().plays;
    let height = store.read().height;

    let valid_items = match session {
        SessionStatus::Valid => vec![
            ("alarms", Path::Alarms),
            ("devices", Path::Alarms),
            ("user", Path::Welcome),
        ],
        SessionStatus::Activate => vec![("user", Path::Welcome), ("user", Path::Alarms)],
        _ => {
            if path == Path::Login {
                vec![
                    ("register", Path::Register),
                    ("server", Path::Login),
                    ("about", Path::Login),
                ]
            } else {
                vec![
                    ("login", Path::Login),
                    ("server", Path::Login),
                    ("about", Path::Login),
                ]
            }
        }
    };

    let logo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23347ce4'/%3E%3Cpath d='M50 20 L50 50 L75 65' stroke='white' stroke-width='5' fill='none'/%3E%3C/svg%3E";

    rsx! {
        header {
            id: "NavBar",
            div { class: "navbar-start",
                button {
                    class: "btn-ghost gap-2 px-2",
                    style: format!("height: {}px; min-height: {}px;", height, height),
                    onclick: move |_| {
                        let mut s = store.write();
                        s.show_settings = !s.show_settings;
                    },
                    img { src: "{logo}", class: "brand-logo" }
                    span { class: "font-bold text-base", "Untamo" }
                }
            }
            div { class: "navbar-end gap-1",
                for (label, target_path) in valid_items {
                    match label {
                        "login" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    let mut s = store.write();
                                    s.current_path = Path::Login;
                                },
                                "LogIn"
                            }
                        },
                        "register" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    let mut s = store.write();
                                    s.current_path = Path::Register;
                                },
                                "Register"
                            }
                        },
                        "alarms" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    let mut s = store.write();
                                    s.current_path = Path::Alarms;
                                },
                                "Alarms"
                                if plays { " ▶" }
                            }
                        },
                        "devices" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    // TODO: show device menu
                                },
                                "Devices"
                            }
                        },
                        "server" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    let mut s = store.write();
                                    s.show_server_edit = true;
                                },
                                "Server Location"
                            }
                        },
                        "about" => rsx! {
                            button {
                                class: "btn",
                                onclick: move |_| {
                                    let mut s = store.write();
                                    s.show_about = true;
                                },
                                "About"
                            }
                        },
                        "user" => {
                            let user_name = store.read().user.as_ref().map(|u| u.screen_name.clone()).unwrap_or_default();
                            let initials = user_name.split(' ').map(|w| w.chars().next().unwrap_or('?')).take(2).collect::<String>().to_uppercase();
                            let display = if initials.is_empty() { "?".to_string() } else { initials };
                            let final_display = display.as_str();
                            rsx! {
                                div { class: "avatar placeholder",
                                    style: "width: 40px; height: 40px;",
                                    "{final_display}"
                                }
                            }
                        },
                        _ => rsx! { div {} },
                    }
                }
            }
        }
    }
}

#[component]
fn ToastContainer() -> Element {
    rsx! { div { class: "toast toast-top toast-center" } }
}

fn ToastProps(show: bool, msg: &str) -> Element {
    if !show {
        return rsx! { div {} };
    }
    rsx! {
        div { class: "toast toast-top toast-center",
            div { class: "alert alert-info", span { "{msg}" } }
        }
    }
}

#[component]
fn LogIn() -> Element {
    let mut email = use_signal(String::new);
    let mut password = use_signal(String::new);
    let mut error = use_signal(String::new);
    let mut store = use_store();

    rsx! {
        div { class: "UserForm",
            h2 { class: "card-title", style: "text-align: center; margin-bottom: 16px;", "Log In" }

            if !error.read().is_empty() {
                div { class: "alert alert-error", span { "{error.read()}" } }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Email" }
                input {
                    class: "input input-bordered",
                    r#type: "email",
                    placeholder: "email@example.com",
                    value: "{email.read()}",
                    oninput: move |e| *email.write() = e.value().clone()
                }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Password" }
                input {
                    class: "input input-bordered",
                    r#type: "password",
                    placeholder: "••••••••",
                    value: "{password.read()}",
                    oninput: move |e| *password.write() = e.value().clone()
                }
            }

            button {
                class: "btn btn-primary",
                onclick: move |_| {
                    if email.read().is_empty() || password.read().is_empty() {
                        *error.write() = "Please fill in all fields".to_string();
                        return;
                    }
                    let mut s = store.write();
                    s.session_valid = SessionStatus::Valid;
                    s.token = Some("demo_token".to_string());
                    s.user = Some(User { screen_name: "Demo User".to_string() });
                    if s.current_device.is_none() {
                        s.current_path = Path::Welcome;
                    } else {
                        s.current_path = Path::Alarms;
                    }
                },
                "Log In"
            }

            div { style: "margin-top: 16px; text-align: center;",
                a {
                    class: "link",
                    onclick: move |_| {
                        let mut s = store.write();
                        s.current_path = Path::ResetPassword;
                    },
                    "Forgot Password?"
                }
                br {}
                a {
                    class: "link",
                    onclick: move |_| {
                        let mut s = store.write();
                        s.current_path = Path::Register;
                    },
                    "Create account"
                }
            }
        }
    }
}

#[component]
fn Register() -> Element {
    let mut screen_name = use_signal(String::new);
    let mut email = use_signal(String::new);
    let mut password = use_signal(String::new);
    let mut confirm = use_signal(String::new);
    let mut error = use_signal(String::new);
    let mut store = use_store();

    rsx! {
        div { class: "UserForm",
            h2 { class: "card-title", style: "text-align: center; margin-bottom: 16px;", "Register" }

            if !error.read().is_empty() {
                div { class: "alert alert-error", span { "{error.read()}" } }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Screen Name" }
                input {
                    class: "input input-bordered",
                    r#type: "text",
                    value: "{screen_name.read()}",
                    oninput: move |e| *screen_name.write() = e.value().clone()
                }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Email" }
                input {
                    class: "input input-bordered",
                    r#type: "email",
                    value: "{email.read()}",
                    oninput: move |e| *email.write() = e.value().clone()
                }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Password" }
                input {
                    class: "input input-bordered",
                    r#type: "password",
                    value: "{password.read()}",
                    oninput: move |e| *password.write() = e.value().clone()
                }
            }

            div { class: "form-control",
                label { class: "FormLabel", "Confirm Password" }
                input {
                    class: "input input-bordered",
                    r#type: "password",
                    value: "{confirm.read()}",
                    oninput: move |e| *confirm.write() = e.value().clone()
                }
            }

            button {
                class: "btn btn-primary",
                onclick: move |_| {
                    if password.read().as_str() != confirm.read().as_str() {
                        *error.write() = "Passwords don't match".to_string();
                        return;
                    }
                    let mut s = store.write();
                    s.session_valid = SessionStatus::Activate;
                    s.user = Some(User { screen_name: screen_name.read().clone() });
                    s.current_path = Path::Activate;
                },
                "Register"
            }

            div { style: "margin-top: 16px; text-align: center;",
                a {
                    class: "link",
                    onclick: move |_| {
                        let mut s = store.write();
                        s.current_path = Path::Login;
                    },
                    "Already have an account?"
                }
            }
        }
    }
}

#[component]
fn Welcome() -> Element {
    let mut store = use_store();
    let user = store.read().user.clone();
    let clock_24 = store.read().clock_24;
    let devices = store.read().devices.clone();
    let current_device = store.read().current_device.clone();

    let user_name = user
        .as_ref()
        .map(|u| u.screen_name.clone())
        .unwrap_or_default();

    if current_device.is_some() {
        let mut s = store.write();
        s.current_path = Path::Alarms;
    }

    rsx! {
        div { style: "max-width: 400px; margin: 0 auto; padding: 24px; text-align: center;",
            if !user_name.is_empty() {
                h2 { style: "font-size: 1.25rem; font-weight: bold; margin-bottom: 16px;", "Welcome, ", b { "{user_name}" } }
            }

            div { style: "padding: 16px 0;",
                b { style: "display: block; margin-bottom: 12px;", "Time Format" }
                div { style: "display: flex; gap: 12px; justify-content: center;",
                    button {
                        class: if clock_24 { "btn btn-primary" } else { "btn" },
                        onclick: move |_| {
                            let mut s = store.write();
                            s.clock_24 = true;
                        },
                        "24 h"
                    }
                    button {
                        class: if clock_24 { "btn" } else { "btn btn-primary" },
                        onclick: move |_| {
                            let mut s = store.write();
                            s.clock_24 = false;
                        },
                        "12 h"
                    }
                }
            }

            div { style: "padding: 16px 0; text-align: center;",
                if devices.is_empty() {
                    button {
                        class: "btn btn-primary",
                        style: "width: 50%; padding: 12px;",
                        onclick: move |_| {
                            let mut s = store.write();
                            let new_device = Device { id: "demo".to_string(), device_name: "My Device".to_string() };
                            s.devices.push(new_device.clone());
                            s.current_device = Some(new_device);
                            s.current_path = Path::Alarms;
                        },
                        "Add a device"
                    }
                } else {
                    DeviceMenuList { devices: devices.clone() }
                }
            }
        }
    }
}

#[component]
fn DeviceMenuList(devices: Vec<Device>) -> Element {
    let mut store = use_store();

    rsx! {
        div { style: "text-align: center;",
            div { style: "margin-bottom: 16px;", "Select a Device" }
            DeviceButtons { devices: devices }
            div { style: "margin: 8px 0;", "or" }
            button {
                class: "btn btn-primary",
                style: "width: 50%;",
                onclick: move |_| {
                    let mut s = store.write();
                    let new_device = Device { id: "demo".to_string(), device_name: "My Device".to_string() };
                    s.devices.push(new_device.clone());
                    s.current_device = Some(new_device);
                    s.current_path = Path::Alarms;
                },
                "Add a device"
            }
        }
    }
}

#[component]
fn DeviceButtons(devices: Vec<Device>) -> Element {
    let mut store = use_store();
    let n = devices.len();

    rsx! {
        div { style: "display: flex; flex-direction: column; align-items: center; gap: 8px;",
            if n > 0 {
                DeviceButton { id: devices[0].id.clone(), name: devices[0].device_name.clone() }
            }
            if n > 1 {
                DeviceButton { id: devices[1].id.clone(), name: devices[1].device_name.clone() }
            }
        }
    }
}

#[component]
fn DeviceButton(id: String, name: String) -> Element {
    let mut store = use_store();

    rsx! {
        button {
            class: "btn",
            style: "width: 60%;",
            onclick: move |_| {
                let mut s = store.write();
                s.current_device = Some(Device { id: id.clone(), device_name: name.clone() });
                s.current_path = Path::Alarms;
            },
            "{name}"
        }
    }
}

#[component]
fn AlarmCard(alarm: Alarm, clock_24: bool, card_colors: CardColors, idx: usize) -> Element {
    let time_str = if clock_24 {
        format!("{:02}:{:02}", alarm.time[0], alarm.time[1])
    } else {
        let h = alarm.time[0];
        if h == 0 {
            format!("12:{:02} AM", alarm.time[1])
        } else if h < 12 {
            format!("{}:{:02} AM", h, alarm.time[1])
        } else if h == 12 {
            format!("12:{:02} PM", alarm.time[1])
        } else {
            format!("{}:{:02} PM", h - 12, alarm.time[1])
        }
    };

    let bg = if !alarm.active {
        &card_colors.inactive
    } else if idx % 2 == 0 {
        &card_colors.even
    } else {
        &card_colors.odd
    };

    rsx! {
        div {
            class: "card",
            style: "background-color: {bg}; margin-bottom: 8px;",
            div { class: "card-body",
                div { style: "font-size: 1.5rem; font-weight: bold; text-transform: uppercase;", "{time_str}" }
                div { style: "font-size: 0.875rem;", "{alarm.label}" }
                div { style: "font-size: 0.75rem; color: #666;", "{alarm.occurrence}" }
            }
        }
    }
}

#[component]
fn Alarms() -> Element {
    let mut store = use_store();
    let alarms = store.read().alarms.clone();
    let clock_24 = store.read().clock_24;
    let card_colors = store.read().card_colors.clone();

    rsx! {
        div { style: "max-width: 80%; margin: 0 auto; padding: 16px;",
            if alarms.is_empty() {
                div { style: "text-align: center; padding: 40px; color: #666;",
                    p { "No alarms set" }
                    p { style: "font-size: 0.875rem;", "Tap + to add your first alarm" }
                }
            } else {
                for (idx, alarm) in alarms.iter().enumerate() {
                    AlarmCard { alarm: alarm.clone(), clock_24, card_colors: card_colors.clone(), idx }
                }
            }

            button {
                class: "btn btn-primary",
                style: "position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; font-size: 28px;",
                onclick: move |_| {
                    let mut s = store.write();
                    s.show_edit_alarm = true;
                },
                "+"
            }
        }
    }
}

#[component]
fn Activate() -> Element {
    rsx! {
        div { style: "text-align: center; padding: 40px;",
            h1 { style: "font-size: 2rem;", "Activate Your Account" }
            p { style: "margin-top: 16px;", "Please check your email for activation instructions" }
        }
    }
}

#[component]
fn ResetPassword() -> Element {
    let mut email = use_signal(String::new);
    let mut sent = use_signal(|| false);
    let mut store = use_store();

    rsx! {
        div { class: "UserForm",
            h2 { class: "card-title", style: "text-align: center; margin-bottom: 16px;", "Reset Password" }

            if *sent.read() {
                div { class: "alert alert-info", span { "Password reset email sent!" } }
            } else {
                div { class: "form-control",
                    label { class: "FormLabel", "Email" }
                    input {
                        class: "input input-bordered",
                        r#type: "email",
                        value: "{email.read()}",
                        oninput: move |e| *email.write() = e.value().clone()
                    }
                }

                button {
                    class: "btn btn-primary",
                    onclick: move |_| {
                        *sent.write() = true;
                    },
                    "Send Reset Link"
                }
            }

            div { style: "margin-top: 16px; text-align: center;",
                a {
                    class: "link",
                    onclick: move |_| {
                        let mut s = store.write();
                        s.current_path = Path::Login;
                    },
                    "Back to Login"
                }
            }
        }
    }
}

#[component]
fn Admin() -> Element {
    let store = use_store();
    let is_admin = store
        .read()
        .user
        .as_ref()
        .map(|u| u.screen_name.contains("admin"))
        .unwrap_or(false);

    if is_admin {
        rsx! {
            div { style: "padding: 16px;",
                h2 { "Admin Panel" }
                div { class: "card",
                    div { class: "card-body", p { "Admin features coming soon..." } }
                }
            }
        }
    } else {
        let mut store = use_store();
        store.write().current_path = Path::Login;
        rsx! { Clueless {} }
    }
}

#[component]
fn Owner() -> Element {
    let store = use_store();
    let is_owner = store
        .read()
        .user
        .as_ref()
        .map(|u| u.screen_name.contains("owner"))
        .unwrap_or(false);

    if is_owner {
        rsx! {
            div { style: "padding: 16px;",
                h2 { "Owner Panel" }
                div { class: "card",
                    div { class: "card-body", p { "Owner features coming soon..." } }
                }
            }
        }
    } else {
        let mut store = use_store();
        store.write().current_path = Path::Login;
        rsx! { Clueless {} }
    }
}

#[component]
fn PlayAlarm() -> Element {
    let mut store = use_store();
    rsx! {
        div { style: "text-align: center; padding: 40px;",
            div { style: "font-size: 3rem; font-weight: bold; margin-bottom: 24px;", "Alarm Playing!" }
            div { style: "font-size: 1.5rem; margin-bottom: 32px;", "Wake up!" }
            div { style: "display: flex; gap: 16px; justify-content: center;",
                button { class: "btn btn-primary", "Snooze" }
                button {
                    class: "btn btn-error",
                    onclick: move |_| {
                        let mut s = store.write();
                        s.plays = false;
                        s.current_path = Path::Alarms;
                    },
                    "Dismiss"
                }
            }
        }
    }
}

#[component]
fn Clueless() -> Element {
    rsx! {
        div { style: "text-align: center; padding: 40px;",
            h1 { style: "font-size: 4rem;", "404" }
            p { "Page not found" }
        }
    }
}

#[component]
fn SettingsModal() -> Element {
    let mut store = use_store();
    let show = store.read().show_settings;

    if !show {
        return rsx! { div {} };
    }

    let clock_24 = store.read().clock_24;
    let nav_bar_top = store.read().nav_bar_top;

    rsx! {
        div { class: "modal modal-open",
            div { class: "modal-box",
                h3 { class: "font-bold text-lg", "Settings" }
                div { style: "padding: 16px 0;",
                    div { class: "form-control",
                        label { class: "label",
                            span { class: "label-text", "24-Hour Clock" }
                        }
                        input {
                            class: "toggle",
                            r#type: "checkbox",
                            checked: clock_24,
                            onchange: move |_| {
                                let mut s = store.write();
                                s.clock_24 = !s.clock_24;
                            },
                        }
                    }
                    div { class: "form-control",
                        label { class: "label",
                            span { class: "label-text", "Navigation Bar Top" }
                        }
                        input {
                            class: "toggle",
                            r#type: "checkbox",
                            checked: nav_bar_top,
                            onchange: move |_| {
                                let mut s = store.write();
                                s.nav_bar_top = !s.nav_bar_top;
                            },
                        }
                    }
                }
                div { class: "modal-action",
                    button {
                        class: "btn",
                        onclick: move |_| {
                            let mut s = store.write();
                            s.show_settings = false;
                        },
                        "Close"
                    }
                }
            }
        }
    }
}

#[component]
fn AboutModal() -> Element {
    let mut store = use_store();
    let show = store.read().show_about;

    if !show {
        return rsx! { div {} };
    }

    rsx! {
        div { class: "modal modal-open",
            div { class: "modal-box",
                h3 { class: "font-bold text-lg", "About Untamo" }
                div { style: "padding: 16px 0;",
                    p { "Version 0.2.0" }
                    p { "A synchronized alarm clock application" }
                    p { "Built with Dioxus" }
                }
                div { class: "modal-action",
                    button {
                        class: "btn",
                        onclick: move |_| {
                            let mut s = store.write();
                            s.show_about = false;
                        },
                        "Close"
                    }
                }
            }
        }
    }
}

#[component]
fn ServerModal() -> Element {
    let mut store = use_store();
    let show = store.read().show_server_edit;

    if !show {
        return rsx! { div {} };
    }

    let addr = store.read().address.clone();
    let mut address = use_signal(move || addr);

    rsx! {
        div { class: "modal modal-open",
            div { class: "modal-box",
                h3 { class: "font-bold text-lg", "Server Location" }
                div { style: "padding: 16px 0;",
                    div { class: "form-control",
                        label { class: "label",
                            span { class: "label-text", "Server Address" }
                        }
                        input {
                            class: "input input-bordered",
                            r#type: "text",
                            value: "{address.read()}",
                            oninput: move |e| *address.write() = e.value().clone(),
                        }
                    }
                }
                div { class: "modal-action",
                    button {
                        class: "btn btn-primary",
                        onclick: move |_| {
                            let mut s = store.write();
                            s.address = address.read().clone();
                            s.show_server_edit = false;
                        },
                        "Save"
                    }
                    button {
                        class: "btn",
                        onclick: move |_| {
                            let mut s = store.write();
                            s.show_server_edit = false;
                        },
                        "Cancel"
                    }
                }
            }
        }
    }
}

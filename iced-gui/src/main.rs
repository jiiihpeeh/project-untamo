mod audio;
mod components;
mod constants;
mod messages;
mod state;
mod storage;
mod theme;
mod tray;
mod update;
mod views;
mod websocket;

use crate::messages::Message;
use crate::state::AppState;
use iced::window;
use iced::{Subscription, Task};
use update::update_app;
use views::view;

pub fn main() -> iced::Result {
    println!("Server: {}", constants::DEFAULT_SERVER);
    audio::start_audio_thread();
    tray::init_tray();

    let saved_session = crate::storage::load_session();

    iced::daemon(
        move || {
            let icon = window::icon::from_file_data(
                include_bytes!("../resources/icons/icon_32.png"),
                Some(image::ImageFormat::Png),
            )
            .ok();

            let (wid, open_task) = window::open(window::Settings {
                icon,
                platform_specific: window::settings::PlatformSpecific {
                    application_id: "untamo".to_string(),
                    ..Default::default()
                },
                ..window::Settings::default()
            });

            let mut state = AppState::default();
            state.window_id = Some(wid);

            let tasks = if let Some(session) = saved_session.clone() {
                state.ws.token.clone_from(&session.token);
                state.ws.ws_token.clone_from(&session.ws_token);
                state.ws.ws_pair.clone_from(&session.ws_pair);
                Task::batch([
                    open_task.map(|id| Message::WindowIdReceived(Some(id))),
                    Task::perform(async {}, |_| Message::ValidateSession),
                    Task::perform(async {}, |_| Message::WsConnect),
                ])
            } else {
                open_task.map(|id| Message::WindowIdReceived(Some(id)))
            };

            (state, tasks)
        },
        update_app,
        view,
    )
    .font(iced_aw::ICED_AW_FONT_BYTES)
    .subscription(|_state: &AppState| {
        Subscription::batch([
            frame_tick_subscription(),
            window::close_requests().map(Message::CloseRequested),
            tray::subscription(),
        ])
    })
    .title("Untamo")
    .run()
}

fn frame_tick_subscription() -> Subscription<messages::Message> {
    use std::time::Duration;
    iced::time::every(Duration::from_millis(16)).map(|_| messages::Message::FrameTick)
}

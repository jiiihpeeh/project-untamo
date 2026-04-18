mod audio;
mod components;
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
    audio::start_audio_thread();
    tray::init_tray();

    let icon = iced::window::icon::from_file_data(
        include_bytes!("../resources/icons/icon_32.png"),
        Some(image::ImageFormat::Png),
    )
    .expect("Failed to load icon");

    let saved_session = crate::storage::load_session();

    iced::application(
        move || {
            let fetch_window_id = iced::window::get_oldest().map(Message::WindowIdReceived);
            if let Some(session) = saved_session.clone() {
                let mut app_state = AppState::default();
                app_state.ws.token.clone_from(&session.token);
                app_state.ws.ws_token.clone_from(&session.ws_token);
                app_state.ws.ws_pair.clone_from(&session.ws_pair);
                (
                    app_state,
                    Task::batch([
                        fetch_window_id,
                        Task::perform(async {}, |_| Message::ValidateSession),
                        Task::perform(async {}, |_| Message::WsConnect),
                    ]),
                )
            } else {
                (AppState::default(), fetch_window_id)
            }
        },
        update_app,
        view,
    )
    .font(iced_aw::ICED_AW_FONT_BYTES)
    .subscription(|_state: &AppState| {
        Subscription::batch([
            frame_tick_subscription(),
            window::close_requests().map(Message::CloseRequested),
        ])
    })
    .window(window::Settings {
        icon: Some(icon),
        ..window::Settings::default()
    })
    .title("Untamo")
    .run()
}

fn frame_tick_subscription() -> Subscription<messages::Message> {
    use std::time::Duration;
    iced::time::every(Duration::from_millis(50)).map(|_| messages::Message::FrameTick)
}

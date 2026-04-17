mod audio;
mod components;
mod messages;
mod state;
mod storage;
mod theme;
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

    let icon = iced::window::icon::from_file_data(
        include_bytes!("../resources/icons/icon_32.png"),
        Some(image::ImageFormat::Png),
    )
    .expect("Failed to load icon");

    let has_valid_session = crate::storage::load_session().is_some();

    iced::application(
        move || {
            if has_valid_session {
                (
                    AppState::default(),
                    Task::batch([
                        Task::perform(async {}, |_| Message::FetchUpdate),
                        Task::perform(async {}, |_| Message::WsConnect),
                    ]),
                )
            } else {
                (AppState::default(), Task::none())
            }
        },
        update_app,
        view,
    )
    .font(iced_aw::ICED_AW_FONT_BYTES)
    .subscription(|_state: &AppState| {
        Subscription::batch([
            frame_tick_subscription(),
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

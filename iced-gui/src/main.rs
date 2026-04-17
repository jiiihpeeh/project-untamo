mod audio;
mod components;
mod messages;
mod state;
mod theme;
mod update;
mod views;
mod websocket;

use crate::state::AppState;
use iced::window;
use iced::{Subscription, Task};
use update::update_app;
use views::view;

pub fn main() -> iced::Result {
    audio::start_audio_thread();

    let icon = iced::window::icon::from_file_data(
        include_bytes!("../resources/icons/icon.png"),
        Some(image::ImageFormat::Png),
    )
    .expect("Failed to load icon");

    iced::application(
        || (AppState::default(), Task::none()),
        update_app,
        view,
    )
    .subscription(|_state: &AppState| {
        frame_tick_subscription()
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

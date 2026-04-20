use crate::state::AppState;
use iced::Task;

pub fn start(state: &mut AppState) -> Task<crate::messages::Message> {
    if !state.stopwatch_running {
        state.stopwatch_running = true;
        state.stopwatch_start = Some(std::time::Instant::now());
    }
    Task::none()
}

pub fn stop(state: &mut AppState) -> Task<crate::messages::Message> {
    if state.stopwatch_running {
        if let Some(start) = state.stopwatch_start.take() {
            state.stopwatch_elapsed_ms += start.elapsed().as_millis() as u64;
        }
        state.stopwatch_running = false;
    }
    Task::none()
}

pub fn reset(state: &mut AppState) -> Task<crate::messages::Message> {
    state.stopwatch_running = false;
    state.stopwatch_elapsed_ms = 0;
    state.stopwatch_start = None;
    state.stopwatch_laps.clear();
    Task::none()
}

pub fn lap(state: &mut AppState) -> Task<crate::messages::Message> {
    if state.stopwatch_running {
        if let Some(start) = state.stopwatch_start {
            let current_elapsed = state.stopwatch_elapsed_ms + start.elapsed().as_millis() as u64;
            state.stopwatch_laps.push(current_elapsed);
        }
    }
    Task::none()
}

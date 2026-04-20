use crate::audio;
use crate::messages::Message;
use crate::state::AppState;
use iced::Task;

pub fn start(state: &mut AppState) -> Task<Message> {
    if !state.countdown_running && state.countdown_duration_secs > 0 {
        state.countdown_running = true;
        state.countdown_target = Some(std::time::Instant::now());
    }
    Task::none()
}

pub fn stop(state: &mut AppState) -> Task<Message> {
    if state.countdown_running {
        if let Some(target) = state.countdown_target.take() {
            let elapsed = target.elapsed().as_secs();
            if elapsed < state.countdown_duration_secs {
                state.countdown_duration_secs -= elapsed;
            } else {
                state.countdown_duration_secs = 0;
            }
        }
        state.countdown_running = false;
        audio::stop_audio();
    }
    Task::none()
}

pub fn reset(state: &mut AppState) -> Task<Message> {
    state.countdown_running = false;
    state.countdown_target = None;
    audio::stop_audio();
    Task::none()
}

pub fn set_hours(state: &mut AppState, hours: u8) -> Task<Message> {
    let new_total = (hours as u64 * 3600) + (state.countdown_duration_secs % 3600);
    state.countdown_duration_secs = new_total;
    Task::none()
}

pub fn set_minutes(state: &mut AppState, minutes: u8) -> Task<Message> {
    let hours = state.countdown_duration_secs / 3600;
    let new_total = hours * 3600 + (minutes as u64);
    state.countdown_duration_secs = new_total;
    Task::none()
}

pub fn set_seconds(state: &mut AppState, seconds: u8) -> Task<Message> {
    let hours = state.countdown_duration_secs / 3600;
    let mins = (state.countdown_duration_secs % 3600) / 60;
    let new_total = hours * 3600 + mins * 60 + (seconds as u64);
    state.countdown_duration_secs = new_total;
    Task::none()
}

pub fn tick(state: &mut AppState) {
    if state.countdown_running {
        if let Some(_target) = state.countdown_target {
            let elapsed = _target.elapsed().as_secs();
            if elapsed >= state.countdown_duration_secs {
                state.countdown_running = false;
                state.countdown_target = None;
                state.countdown_duration_secs = 0;
                trigger_alarm();
            }
        }
    }
}

fn trigger_alarm() {
    audio::stop_audio();
    play_beep();
}

fn play_beep() {
    use rodio::Source;
    use std::thread;
    use std::time::Duration;

    struct BeepSource {
        freq: f32,
        sample_idx: u64,
        total_samples: u64,
    }

    impl Iterator for BeepSource {
        type Item = f32;

        fn next(&mut self) -> Option<Self::Item> {
            if self.sample_idx >= self.total_samples {
                return None;
            }
            let sample =
                ((self.sample_idx as f32) * self.freq / 44100.0 * 2.0 * std::f32::consts::PI).sin();
            self.sample_idx += 1;
            Some(sample * 0.3)
        }

        fn size_hint(&self) -> (usize, Option<usize>) {
            let remaining = (self.total_samples - self.sample_idx) as usize;
            (remaining, Some(remaining))
        }
    }

    impl Source for BeepSource {
        fn current_frame_len(&self) -> Option<usize> {
            None
        }
        fn channels(&self) -> u16 {
            1
        }
        fn sample_rate(&self) -> u32 {
            44100
        }
        fn total_duration(&self) -> Option<Duration> {
            None
        }
    }

    // Play 3 beeps
    for i in 0..3 {
        if let Ok((_stream, stream_handle)) = rodio::OutputStream::try_default() {
            if let Ok(sink) = rodio::Sink::try_new(&stream_handle) {
                let freq = if i == 1 { 1100.0 } else { 880.0 };
                let source = BeepSource {
                    freq,
                    sample_idx: 0,
                    total_samples: 44100,
                };
                sink.append(source);
                thread::sleep(Duration::from_millis(600));
            }
        }
    }
}

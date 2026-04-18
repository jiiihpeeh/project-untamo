use rodio::{Decoder, OutputStream, Sink, Source};
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

enum AudioCommand {
    Play(String, f32, bool),
    Stop,
    SetVolume(f32),
    CheckFinished,
}

struct AudioState {
    stream: Option<OutputStream>,
    stream_handle: Option<rodio::OutputStreamHandle>,
    sink: Option<Sink>,
    looping: bool,
}

impl AudioState {
    fn new() -> Self {
        Self {
            stream: None,
            stream_handle: None,
            sink: None,
            looping: false,
        }
    }

    fn ensure_output(&mut self) -> bool {
        if self.stream.is_none() {
            match OutputStream::try_default() {
                Ok((stream, handle)) => {
                    self.stream = Some(stream);
                    self.stream_handle = Some(handle);
                    true
                }
                Err(e) => {
                    eprintln!("[audio] Failed to open audio output: {}", e);
                    false
                }
            }
        } else {
            true
        }
    }
}

fn set_playing(val: bool) {
    AUDIO_PLAYING.store(val, std::sync::atomic::Ordering::SeqCst);
}

fn audio_thread(rx: mpsc::Receiver<AudioCommand>) {
    let mut state = AudioState::new();

    loop {
        match rx.recv_timeout(Duration::from_millis(100)) {
            Ok(AudioCommand::Play(path, volume, repeat)) => {
                if !state.ensure_output() {
                    continue;
                }

                if let Some(ref s) = state.sink {
                    s.stop();
                }
                state.sink = None;

                if let Some(ref handle) = state.stream_handle {
                    if let Ok(file) = File::open(&path) {
                        if let Ok(source) = Decoder::new(BufReader::new(file)) {
                            match Sink::try_new(handle) {
                                Ok(new_sink) => {
                                    if repeat {
                                        new_sink.append(source.repeat_infinite());
                                    } else {
                                        new_sink.append(source);
                                    }

                                    new_sink.set_volume(0.0);
                                    new_sink.play();

                                    let target_volume = volume;
                                    let steps = 20;
                                    let step_duration = 50;

                                    for i in 1..=steps {
                                        thread::sleep(Duration::from_millis(step_duration));
                                        let vol = (target_volume * i as f32) / steps as f32;
                                        new_sink.set_volume(vol);
                                    }
                                    new_sink.set_volume(target_volume);

                                    state.sink = Some(new_sink);
                                    state.looping = repeat;
                                    set_playing(true);
                                }
                                Err(e) => {
                                    eprintln!("[audio] Failed to create sink: {}", e);
                                }
                            }
                        } else {
                            eprintln!("[audio] Failed to decode: {}", path);
                        }
                    } else {
                        eprintln!("[audio] Failed to open file: {}", path);
                    }
                }
            }
            Ok(AudioCommand::CheckFinished) => {
                if let Some(ref s) = state.sink {
                    if s.empty() && !s.is_paused() && !state.looping {
                        drop(state.sink.take());
                        drop(state.stream.take());
                        drop(state.stream_handle.take());
                        state.looping = false;
                        set_playing(false);
                    }
                }
            }
            Ok(AudioCommand::Stop) => {
                if let Some(ref s) = state.sink {
                    s.stop();
                }
                state.sink = None;
                state.looping = false;
                drop(state.stream.take());
                drop(state.stream_handle.take());
                set_playing(false);
            }
            Ok(AudioCommand::SetVolume(volume)) => {
                if let Some(ref s) = state.sink {
                    s.set_volume(volume);
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                if let Some(ref s) = state.sink {
                    if s.empty() && !s.is_paused() && !state.looping {
                        drop(state.sink.take());
                        drop(state.stream.take());
                        drop(state.stream_handle.take());
                        state.looping = false;
                        set_playing(false);
                    }
                }
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                break;
            }
        }
    }
}

static AUDIO_TX: std::sync::Mutex<Option<mpsc::Sender<AudioCommand>>> = std::sync::Mutex::new(None);
static AUDIO_PLAYING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn start_audio_thread() {
    let (tx, rx) = mpsc::channel();
    *AUDIO_TX.lock().unwrap() = Some(tx);
    thread::spawn(|| audio_thread(rx));
}

pub fn play_audio_file(file_path: &str, volume: f32, loop_audio: bool) -> Result<(), String> {
    let tx = AUDIO_TX.lock().unwrap();
    if let Some(ref sender) = *tx {
        sender
            .send(AudioCommand::Play(
                file_path.to_string(),
                volume,
                loop_audio,
            ))
            .map_err(|e| format!("Failed to send play command: {}", e))
    } else {
        Err("Audio thread not started".to_string())
    }
}

pub fn is_audio_playing() -> bool {
    AUDIO_PLAYING.load(std::sync::atomic::Ordering::SeqCst)
}

pub fn stop_audio() {
    let tx = AUDIO_TX.lock().unwrap();
    if let Some(ref sender) = *tx {
        let _ = sender.send(AudioCommand::Stop);
    }
}

#[allow(dead_code)]
pub fn set_audio_volume(volume: f32) {
    let tx = AUDIO_TX.lock().unwrap();
    if let Some(ref sender) = *tx {
        let _ = sender.send(AudioCommand::SetVolume(volume));
    }
}

pub fn check_audio_finished() {
    let tx = AUDIO_TX.lock().unwrap();
    if let Some(ref sender) = *tx {
        let _ = sender.send(AudioCommand::CheckFinished);
    }
}

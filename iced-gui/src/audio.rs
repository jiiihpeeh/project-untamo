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
}

#[allow(dead_code)]
fn audio_thread(rx: mpsc::Receiver<AudioCommand>) {
    let (_stream, stream_handle) = match OutputStream::try_default() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[audio] Failed to open audio output: {}", e);
            return;
        }
    };

    let mut sink: Option<Sink> = None;

    loop {
        match rx.recv() {
            Ok(AudioCommand::Play(path, volume, repeat)) => {
                if let Some(ref s) = sink {
                    s.stop();
                }
                sink = None;

                if let Ok(file) = File::open(&path) {
                    if let Ok(source) = Decoder::new(BufReader::new(file)) {
                        match Sink::try_new(&stream_handle) {
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

                                sink = Some(new_sink);
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
            Ok(AudioCommand::Stop) => {
                if let Some(ref s) = sink {
                    s.stop();
                }
                sink = None;
            }
            Ok(AudioCommand::SetVolume(volume)) => {
                if let Some(ref s) = sink {
                    s.set_volume(volume);
                }
            }
            Err(_) => {
                break;
            }
        }
    }
}

static AUDIO_TX: std::sync::Mutex<Option<mpsc::Sender<AudioCommand>>> = std::sync::Mutex::new(None);

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

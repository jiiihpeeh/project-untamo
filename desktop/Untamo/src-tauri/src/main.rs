use std::path::{PathBuf, Path};
use std::sync::{Mutex, mpsc};
use std::io::BufReader;
use serde::ser::{Serialize, SerializeStruct, Serializer};
use serde::Deserialize;
use tauri::{
    AppHandle, Emitter, Manager, State, Window,
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
};
use itertools::Itertools;
use chrono::{Local, TimeZone, Datelike, NaiveDate, Duration as ChronoDuration};
use tokio::sync::watch;
use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};

// ─── Directory paths ──────────────────────────────────────────────────────────

struct SetDirs {
    app_dir: Option<PathBuf>,
    resource_dir: Option<PathBuf>,
    is_set: bool,
}
static SETDIRS: Mutex<SetDirs> = Mutex::new(SetDirs {
    app_dir: None,
    resource_dir: None,
    is_set: false,
});

// ─── Audio resources ──────────────────────────────────────────────────────────

struct AudioResources {
    tracks: Vec<String>,
    resource_audio_path: Option<PathBuf>,
    audio_app_path: Option<PathBuf>,
}

impl AudioResources {
    fn new() -> AudioResources {
        AudioResources {
            tracks: Vec::new(),
            resource_audio_path: None,
            audio_app_path: None,
        }
    }

    fn set_resource_path(&mut self) {
        if !SETDIRS.lock().unwrap().is_set {
            return;
        }
        self.resource_audio_path = Some(SETDIRS.lock().unwrap().resource_dir.clone().unwrap().join("audio"));
    }

    fn set_audio_app_path(&mut self) {
        if !SETDIRS.lock().unwrap().is_set {
            return;
        }
        self.audio_app_path = Some(SETDIRS.lock().unwrap().app_dir.clone().unwrap().join("audio"));

        if self.audio_app_path.is_some() {
            let path = self.audio_app_path.clone().unwrap();
            if !path.exists() {
                if let Err(e) = std::fs::create_dir(path) {
                    println!("Failed to create audio directory: {}", e);
                }
            }
        }
    }

    fn get_audio_app_path(&mut self) -> Option<PathBuf> {
        self.audio_app_path.clone()
    }

    fn get_tracks(&mut self) -> Vec<String> {
        self.set_tracks();
        let mut named_tracks = self.tracks.clone();
        for track in &mut named_tracks {
            *track = Path::new(&track).file_name()
                .unwrap()
                .to_str()
                .unwrap()
                .split('.')
                .next()
                .unwrap()
                .to_string();
        }
        named_tracks.into_iter().unique().collect()
    }

    fn get_track_path(&mut self, track: &str) -> Option<String> {
        self.set_tracks();
        // User-uploaded .opus files take priority (AppLocalData/audio/), then
        // bundled .flac resources, with .opus fallback in resources too.
        let app_base   = self.audio_app_path.clone().unwrap();
        let res_base   = self.resource_audio_path.clone().unwrap();
        let candidates = [
            app_base.join(format!("{}.opus", track)),
            app_base.join(format!("{}.flac", track)),
            res_base.join(format!("{}.flac", track)),
            res_base.join(format!("{}.opus", track)),
        ];
        for path in &candidates {
            if path.exists() {
                return Some(path.to_str().unwrap().to_string());
            }
        }
        None
    }

    fn set_tracks(&mut self) {
        if self.resource_audio_path.is_none() || self.audio_app_path.is_none() {
            self.set_resource_path();
            self.set_audio_app_path();
            if self.resource_audio_path.is_none() || self.audio_app_path.is_none() {
                return;
            }
        }
        let mut tracks = Vec::new();
        let path = self.resource_audio_path.clone().unwrap();
        for i in std::fs::read_dir(path).unwrap() {
            let file = i.unwrap();
            let file_name = file.file_name().into_string().unwrap();
            if file_name.ends_with(".flac") || file_name.ends_with(".opus") {
                tracks.push(file_name);
            }
        }
        for i in std::fs::read_dir(self.audio_app_path.clone().unwrap()).unwrap() {
            let file = i.unwrap();
            let file_name = file.file_name().into_string().unwrap();
            if file_name.ends_with(".flac") || file_name.ends_with(".opus") {
                tracks.push(file_name);
            }
        }
        self.tracks = tracks.into_iter().unique().collect();
    }

    fn delete_track(&mut self, track: &str) -> bool {
        self.set_tracks();
        let track_file_name = format!("{}.flac", track);
        let app_track_path = self.audio_app_path.clone().unwrap().join(track_file_name);
        if app_track_path.exists() {
            match std::fs::remove_file(app_track_path) {
                Ok(_) => true,
                Err(e) => {
                    println!("Failed to delete track: {}", e);
                    false
                }
            }
        } else {
            false
        }
    }

    fn save_track(&mut self, track: &str, data: &[u8]) -> bool {
        self.set_tracks();
        let track_file_name = format!("{}.flac", track);
        let app_track_path = self.audio_app_path.clone().unwrap().join(track_file_name);
        if app_track_path.exists() {
            println!("Track already exists in app directory");
            false
        } else {
            println!("Saving track to app directory");
            match std::fs::write(app_track_path, data) {
                Ok(_) => {
                    self.set_tracks();
                    true
                }
                Err(e) => {
                    println!("Failed to save track: {}", e);
                    false
                }
            }
        }
    }
}

struct AudioResourceState(Mutex<AudioResources>);

// ─── Alarm daemon ─────────────────────────────────────────────────────────────

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct AlarmData {
    id:         String,
    occurrence: String,          // "once" | "daily" | "weekly" | "yearly"
    time:       [u32; 2],        // [hour, minute]
    date:       [i32; 3],        // [year, month, day]
    weekdays:   u32,             // bitmask: bit 0=Mon … bit 6=Sun
    active:     bool,
    snooze:     Vec<i64>,        // unix-ms timestamps
    devices:    Vec<String>,
    tune:       String,
}

#[derive(Clone, Debug)]
struct DaemonState {
    alarms:    Vec<AlarmData>,
    device_id: String,
    volume:    f32,
}

struct AlarmDaemonHandle {
    sender: watch::Sender<DaemonState>,
}

struct AlarmDaemonState(Mutex<Option<AlarmDaemonHandle>>);

// ─── Audio player ─────────────────────────────────────────────────────────────

#[allow(dead_code)]
enum AudioCommand {
    Play { path: String, loop_audio: bool, volume: f32 },
    Stop,
    SetVolume(f32),
    Quit,
}

struct AudioPlayerState(Mutex<mpsc::SyncSender<AudioCommand>>);

fn play_file(handle: &OutputStreamHandle, path: &str, volume: f32) -> Result<Sink, String> {
    let file   = std::fs::File::open(path).map_err(|e| e.to_string())?;
    let source = Decoder::new(BufReader::new(file)).map_err(|e| e.to_string())?;
    let sink   = Sink::try_new(handle).map_err(|e| e.to_string())?;
    sink.set_volume(volume);
    sink.append(source);
    Ok(sink)
}

/// Dedicated OS thread that owns the OutputStream (which is !Send).
/// Receives AudioCommand via a sync_channel; polls every 100 ms to detect
/// when a non-looping track has finished naturally.
fn audio_thread(rx: mpsc::Receiver<AudioCommand>, app: AppHandle) {
    let (_stream, handle) = match OutputStream::try_default() {
        Ok(pair) => pair,
        Err(e)   => { eprintln!("[audio] init failed: {e}"); return; }
    };

    let mut sink:         Option<Sink>   = None;
    let mut current_path: Option<String> = None;
    let mut is_looping                   = false;

    loop {
        match rx.recv_timeout(std::time::Duration::from_millis(100)) {
            Ok(AudioCommand::Play { path, loop_audio, volume }) => {
                if let Some(s) = sink.take() { s.stop(); }
                match play_file(&handle, &path, volume) {
                    Ok(s) => {
                        is_looping   = loop_audio;
                        current_path = Some(path);
                        sink         = Some(s);
                        let _ = app.emit("audio-state", true);
                    }
                    Err(e) => {
                        eprintln!("[audio] play error: {e}");
                        current_path = None;
                        is_looping   = false;
                        let _ = app.emit("audio-state", false);
                    }
                }
            }
            Ok(AudioCommand::Stop) => {
                if let Some(s) = sink.take() { s.stop(); }
                current_path = None;
                is_looping   = false;
                let _ = app.emit("audio-state", false);
            }
            Ok(AudioCommand::SetVolume(vol)) => {
                if let Some(ref s) = sink { s.set_volume(vol); }
            }
            Ok(AudioCommand::Quit) => break,
            Err(mpsc::RecvTimeoutError::Timeout) => {
                // Detect natural track end
                if sink.as_ref().map_or(false, |s| s.empty()) {
                    if is_looping {
                        // Re-open file for the next loop iteration
                        if let Some(ref path) = current_path.clone() {
                            let vol  = sink.as_ref().map_or(1.0, |s| s.volume());
                            sink     = None;
                            match play_file(&handle, path, vol) {
                                Ok(s)  => { sink = Some(s); }
                                Err(e) => {
                                    eprintln!("[audio] loop replay error: {e}");
                                    current_path = None;
                                    is_looping   = false;
                                    let _ = app.emit("audio-state", false);
                                }
                            }
                        }
                    } else {
                        sink         = None;
                        current_path = None;
                        let _ = app.emit("audio-state", false);
                    }
                }
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => break,
        }
    }
}

// ── Time calculations ──────────────────────────────────────────────────────────

/// Milliseconds from now until the alarm should next fire.
/// Returns None if the alarm has no future occurrence or is past its window.
fn time_to_next_alarm_ms(alarm: &AlarmData) -> Option<i64> {
    let now_ms = Local::now().timestamp_millis();

    // Snooze window: if all snoozes are within 30 min of the first and the
    // earliest snooze happened within the last 30 min, fire 5 min after the
    // most recent snooze.
    let active_snooze: Vec<i64> = alarm.snooze.iter().filter(|&&s| s > 0).cloned().collect();
    let snooze_fire_ms: Option<i64> = if !active_snooze.is_empty() {
        let min_s = *active_snooze.iter().min().unwrap();
        let max_s = *active_snooze.iter().max().unwrap();
        let snooze_max = min_s + 30 * 60 * 1000;
        let snooze_min = now_ms - 30 * 60 * 1000;
        if max_s < snooze_max && min_s > snooze_min {
            Some(max_s + 5 * 60 * 1000)
        } else {
            None
        }
    } else {
        None
    };

    let next_fire_ms = match alarm.occurrence.as_str() {
        "once"   => next_alarm_once_ms(&alarm.time, &alarm.date)?,
        "daily"  => next_alarm_daily_ms(&alarm.time),
        "weekly" => next_alarm_weekly_ms(&alarm.time, alarm.weekdays)?,
        "yearly" => next_alarm_yearly_ms(&alarm.time, &alarm.date)?,
        _        => return None,
    };

    let time_to_alarm  = next_fire_ms - now_ms;
    let time_to_snooze = snooze_fire_ms.map(|s| s - now_ms);

    let launch_ms = match time_to_snooze {
        Some(ts) if ts >= 0 => time_to_alarm.min(ts),
        _                   => time_to_alarm,
    };

    // Ignore alarms firing in less than 100 ms (likely already handled)
    if launch_ms > 100 { Some(launch_ms) } else { None }
}

fn next_alarm_daily_ms(time: &[u32; 2]) -> i64 {
    let now    = Local::now();
    let today  = now.date_naive().and_hms_opt(time[0], time[1], 0).unwrap();
    let target = Local.from_local_datetime(&today).earliest().unwrap();
    let ms     = target.timestamp_millis();
    if ms > now.timestamp_millis() { ms } else { ms + 24 * 60 * 60 * 1000 }
}

fn next_alarm_once_ms(time: &[u32; 2], date: &[i32; 3]) -> Option<i64> {
    let now_ms  = Local::now().timestamp_millis();
    let nd      = NaiveDate::from_ymd_opt(date[0], date[1] as u32, date[2] as u32)?;
    let naive   = nd.and_hms_opt(time[0], time[1], 0)?;
    let local   = Local.from_local_datetime(&naive).earliest()?;
    let fire_ms = local.timestamp_millis();
    // Once alarms in the past are treated as now (will be filtered by > 100 ms check)
    Some(if fire_ms > now_ms { fire_ms } else { now_ms })
}

fn next_alarm_yearly_ms(time: &[u32; 2], date: &[i32; 3]) -> Option<i64> {
    let now    = Local::now();
    let now_ms = now.timestamp_millis();
    let month  = date[1] as u32;
    let day    = date[2] as u32;

    for year in [now.year(), now.year() + 1] {
        if let Some(nd) = NaiveDate::from_ymd_opt(year, month, day) {
            if let Some(naive) = nd.and_hms_opt(time[0], time[1], 0) {
                if let Some(local) = Local.from_local_datetime(&naive).earliest() {
                    let ms = local.timestamp_millis();
                    if ms > now_ms {
                        return Some(ms);
                    }
                }
            }
        }
    }
    None
}

fn next_alarm_weekly_ms(time: &[u32; 2], weekdays: u32) -> Option<i64> {
    let now    = Local::now();
    let now_ms = now.timestamp_millis();
    // chrono: number_from_monday() → 1=Mon … 7=Sun
    // bitmask: bit 0=Mon … bit 6=Sun  → day_num = bit_index + 1
    let day_now = now.weekday().number_from_monday() as i64;

    let mut candidates: Vec<i64> = Vec::new();

    for bit in 0u32..7 {
        if (weekdays & (1 << bit)) == 0 {
            continue;
        }
        let target_day = (bit + 1) as i64;            // 1=Mon … 7=Sun
        let mut diff   = target_day - day_now;
        if diff < 0 {
            diff += 7;
        }

        let target_date  = now.date_naive() + ChronoDuration::days(diff);
        let naive        = target_date.and_hms_opt(time[0], time[1], 0)?;
        let local        = Local.from_local_datetime(&naive).earliest()?;
        let fire_ms      = local.timestamp_millis();

        // Same weekday but time already passed → push to next week
        let final_ms = if diff == 0 && fire_ms <= now_ms {
            let nd2  = target_date + ChronoDuration::days(7);
            let ndt2 = nd2.and_hms_opt(time[0], time[1], 0)?;
            Local.from_local_datetime(&ndt2).earliest()?.timestamp_millis()
        } else {
            fire_ms
        };
        candidates.push(final_ms);
    }

    candidates.into_iter().min()
}

/// Returns (alarm_id, tune, ms_until_fire) for the soonest alarm on this device.
fn find_next_alarm(state: &DaemonState) -> Option<(String, String, i64)> {
    let now_ms = Local::now().timestamp_millis();
    let device = &state.device_id;
    let mut best: Option<(i64, String, String, i64)> = None;

    for alarm in state.alarms.iter().filter(|a| a.active && a.devices.contains(device)) {
        if let Some(ms) = time_to_next_alarm_ms(alarm) {
            let fire_at = now_ms + ms;
            let is_better = best.as_ref().map_or(true, |(b, _, _, _)| fire_at < *b);
            if is_better {
                best = Some((fire_at, alarm.id.clone(), alarm.tune.clone(), ms));
            }
        }
    }

    best.map(|(_, id, tune, ms)| (id, tune, ms))
}

#[derive(serde::Serialize, Clone)]
struct AlarmFirePayload {
    id:   String,
    tune: String,
}

async fn alarm_daemon_task(mut rx: watch::Receiver<DaemonState>, app: AppHandle) {
    loop {
        // Mark current value as seen, grab a snapshot
        let state = rx.borrow_and_update().clone();

        match find_next_alarm(&state) {
            None => {
                // No scheduled alarms — wait for the list to change
                if rx.changed().await.is_err() { break; }
            }
            Some((id, tune, ms)) => {
                let duration = std::time::Duration::from_millis(ms as u64);
                tokio::select! {
                    _ = tokio::time::sleep(duration) => {
                        // Alarm fires — verify it's still active before emitting
                        let current = rx.borrow().clone();
                        let still_valid = current.alarms.iter().any(|a| {
                            a.id == id && a.active && a.devices.contains(&current.device_id)
                        });
                        if still_valid {
                            // Start audio directly from Rust before notifying the frontend.
                            // Resolve the track path via AudioResources, then send Play to
                            // the dedicated audio thread.
                            let path = app
                                .state::<AudioResourceState>()
                                .0.lock().unwrap()
                                .get_track_path(&tune);
                            if let Some(path) = path {
                                let _ = app
                                    .state::<AudioPlayerState>()
                                    .0.lock().unwrap()
                                    .send(AudioCommand::Play {
                                        path,
                                        loop_audio: true,
                                        volume: current.volume,
                                    });
                            }
                            let _ = app.emit("alarm-fire", AlarmFirePayload { id, tune });
                        }
                        // Wait for the frontend to acknowledge / update the list
                        if rx.changed().await.is_err() { break; }
                    }
                    _ = rx.changed() => {
                        // Alarm list updated — restart the loop to recalculate
                    }
                }
            }
        }
    }
}

// ─── Tauri commands ───────────────────────────────────────────────────────────

#[tauri::command]
fn close_window() {
    println!("Closing Application");
    std::process::exit(0);
}

#[tauri::command]
async fn interval_check(millis: u64) -> bool {
    tokio::time::sleep(std::time::Duration::from_secs(millis)).await;
    true
}

#[tauri::command]
async fn sleep(millis: u64) -> bool {
    tokio::time::sleep(std::time::Duration::from_millis(millis)).await;
    true
}

#[tauri::command]
async fn send_event_to_frontend(window: Window) {
    let message = "Hello, frontend!";
    println!("Sending event to frontend");
    window.emit("event_name", message).unwrap();
}

#[tauri::command]
fn get_qr_svg(qr_string: String) -> String {
    let result = qrcode_generator::to_svg_to_string(qr_string, qrcode_generator::QrCodeEcc::Low, 1024, None::<&str>);
    match result {
        Ok(s) => s,
        Err(e) => format!("Error: {}", e),
    }
}

/// Called by the frontend whenever the alarm list or current device changes.
/// Starts the daemon on first call; sends updated state on subsequent calls.
/// Returns milliseconds until the next alarm fires (for the UI countdown),
/// or null if no alarm is scheduled.
#[tauri::command]
async fn update_alarm_daemon(
    alarms:    Vec<AlarmData>,
    device_id: String,
    volume:    f32,
    state:     State<'_, AlarmDaemonState>,
    app:       AppHandle,
) -> Result<Option<i64>, ()> {
    let new_state = DaemonState { alarms, device_id, volume };

    let needs_spawn = state.0.lock().unwrap().is_none();
    if needs_spawn {
        let (tx, rx) = watch::channel(new_state.clone());
        *state.0.lock().unwrap() = Some(AlarmDaemonHandle { sender: tx });
        tokio::spawn(alarm_daemon_task(rx, app));
    } else {
        if let Some(handle) = state.0.lock().unwrap().as_ref() {
            let _ = handle.sender.send(new_state.clone());
        }
    }

    // Return time-to-next for the frontend countdown
    Ok(find_next_alarm(&new_state).map(|(_, _, ms)| ms))
}

#[tauri::command]
fn audio_play(path: String, loop_audio: bool, volume: f32, state: State<'_, AudioPlayerState>) {
    let _ = state.0.lock().unwrap().send(AudioCommand::Play { path, loop_audio, volume });
}

#[tauri::command]
fn audio_stop(state: State<'_, AudioPlayerState>) {
    let _ = state.0.lock().unwrap().send(AudioCommand::Stop);
}

#[tauri::command]
fn audio_set_volume(volume: f32, state: State<'_, AudioPlayerState>) {
    let _ = state.0.lock().unwrap().send(AudioCommand::SetVolume(volume));
}

async fn wait_paths() {
    let mut count = 0;
    while !SETDIRS.lock().unwrap().is_set {
        tokio::time::sleep(std::time::Duration::from_micros(30)).await;
        count += 1;
        if count > 100000 {
            break;
        }
    }
}

async fn configured() -> bool {
    if SETDIRS.lock().unwrap().is_set {
        return true;
    }
    wait_paths().await;
    !SETDIRS.lock().unwrap().is_set
}

#[tauri::command]
async fn get_tracks(state: State<'_, AudioResourceState>) -> Result<Vec<String>, Vec<String>> {
    if !configured().await {
        return Err(vec!["".to_string()]);
    }
    let tracks = state.0.lock().unwrap().get_tracks();
    Ok(tracks)
}

#[tauri::command]
async fn get_audio_app_path(state: State<'_, AudioResourceState>) -> Result<String, String> {
    if !configured().await {
        return Err("".to_string());
    }
    let path = state.0.lock().unwrap().get_audio_app_path().unwrap().to_str().unwrap().to_string();
    Ok(path)
}

#[tauri::command]
async fn get_track_path(track: String, state: State<'_, AudioResourceState>) -> Result<String, String> {
    if !configured().await {
        return Err("".to_string());
    }
    let path = state.0.lock().unwrap().get_track_path(&track);
    match path {
        Some(p) => Ok(p),
        None    => Ok("".to_string()),
    }
}

struct DeleteResult {
    deleted: bool,
    tracks:  Vec<String>,
}

impl Serialize for DeleteResult {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("DeleteResult", 2)?;
        s.serialize_field("tracks", &self.tracks)?;
        s.serialize_field("deleted", &self.deleted)?;
        s.end()
    }
}

#[tauri::command]
fn delete_track(track: &str, state: State<'_, AudioResourceState>) -> DeleteResult {
    let result = state.0.lock().unwrap().delete_track(track);
    let tracks  = state.0.lock().unwrap().get_tracks();
    DeleteResult { tracks, deleted: result }
}

#[tauri::command]
fn save_track(track: &str, data: &[u8], state: State<'_, AudioResourceState>) -> bool {
    state.0.lock().unwrap().save_track(track, data)
}

// ─── App entry point ──────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let quit   = MenuItem::with_id(app, "quit",   "Quit",      true, None::<&str>)?;
            let toggle = MenuItem::with_id(app, "toggle", "Show/Hide", true, None::<&str>)?;
            let menu   = Menu::with_items(app, &[&toggle, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "quit"   => std::process::exit(0),
                        "toggle" => {
                            if let Some(w) = app.get_webview_window("main") {
                                if w.is_visible().unwrap() { let _ = w.hide(); }
                                else                       { let _ = w.show(); }
                            }
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        if let Some(w) = tray.app_handle().get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            let mut set_dirs = SETDIRS.lock().unwrap();
            if let Some(d) = app.path().app_local_data_dir().ok() { set_dirs.app_dir      = Some(d); }
            if let Some(d) = app.path().resource_dir().ok()       { set_dirs.resource_dir = Some(d); }
            set_dirs.is_set = true;

            // Spawn the dedicated audio thread that owns the OutputStream (!Send)
            let (audio_tx, audio_rx) = mpsc::sync_channel::<AudioCommand>(8);
            let audio_app = app.handle().clone();
            std::thread::spawn(move || audio_thread(audio_rx, audio_app));
            app.manage(AudioPlayerState(Mutex::new(audio_tx)));

            Ok(())
        })
        .manage(AudioResourceState(Mutex::new(AudioResources::new())))
        .manage(AlarmDaemonState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            close_window,
            interval_check,
            sleep,
            send_event_to_frontend,
            get_qr_svg,
            get_tracks,
            get_audio_app_path,
            get_track_path,
            delete_track,
            save_track,
            update_alarm_daemon,
            audio_play,
            audio_stop,
            audio_set_volume,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}

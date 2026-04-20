use crate::state::{AppState, Timer};
use crate::messages::Message;
use iced::Task;
use super::helpers::*;

pub fn start(state: &mut AppState) -> Task<Message> {
    if !state.stopwatch_running {
        state.stopwatch_running = true;
        state.stopwatch_start = Some(std::time::Instant::now());
    }
    Task::none()
}

pub fn stop(state: &mut AppState) -> Task<Message> {
    if state.stopwatch_running {
        if let Some(start) = state.stopwatch_start.take() {
            state.stopwatch_elapsed_ms += start.elapsed().as_millis() as u64;
        }
        state.stopwatch_running = false;
    }
    Task::none()
}

pub fn reset(state: &mut AppState) -> Task<Message> {
    state.stopwatch_running = false;
    state.stopwatch_elapsed_ms = 0;
    state.stopwatch_start = None;
    state.stopwatch_laps.clear();
    state.show_saved_timers = false;
    Task::none()
}

pub fn lap(state: &mut AppState) -> Task<Message> {
    if state.stopwatch_running {
        if let Some(start) = state.stopwatch_start {
            let current_elapsed = state.stopwatch_elapsed_ms + start.elapsed().as_millis() as u64;
            state.stopwatch_laps.push(current_elapsed);
        }
    }
    Task::none()
}

pub fn fetch_timers(state: &mut AppState) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    Task::perform(
        async move {
            let client = http_client();
            match client
                .get(format!("{}/api/timers", server))
                .header("token", &token)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<Vec<Timer>>().await {
                        Ok(timers) => Message::TimersReceived(timers),
                        Err(e) => Message::TimerSaveResult(Err(format!("Parse error: {}", e))),
                    }
                }
                Ok(resp) => Message::TimerSaveResult(Err(format!("HTTP {}", resp.status().as_u16()))),
                Err(e) => Message::TimerSaveResult(Err(format!("Connection error: {}", e))),
            }
        },
        |m| m,
    )
}

pub fn timers_received(state: &mut AppState, timers: Vec<Timer>) -> Task<Message> {
    state.timers = timers;
    Task::none()
}

pub fn save_timer(state: &mut AppState, title: String) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    
    let laps = state.stopwatch_laps.clone();
    
    Task::perform(
        async move {
            let client = http_client();
            let body = Timer {
                id: String::new(),
                title,
                laps,
                created: 0,
            };
            match client
                .post(format!("{}/api/timer", server))
                .header("token", &token)
                .json(&body)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => Message::TimerSaveResult(Ok(())),
                Ok(resp) => Message::TimerSaveResult(Err(format!("HTTP {}", resp.status().as_u16()))),
                Err(e) => Message::TimerSaveResult(Err(format!("Connection error: {}", e))),
            }
        },
        |m| m,
    )
}

pub fn timer_save_result(_state: &mut AppState, result: Result<(), String>) -> Task<Message> {
    if result.is_err() {
        eprintln!("Failed to save timer: {}", result.unwrap_err());
    }
    Task::none()
}

pub fn timer_delete_result(_state: &mut AppState, result: Result<(), String>) -> Task<Message> {
    if result.is_err() {
        eprintln!("Failed to delete timer: {}", result.unwrap_err());
    }
    Task::none()
}

pub fn load_timer(state: &mut AppState, timer: Timer) -> Task<Message> {
    state.stopwatch_running = false;
    state.stopwatch_elapsed_ms = timer.laps.last().copied().unwrap_or(0);
    state.stopwatch_start = None;
    state.stopwatch_laps = timer.laps;
    Task::none()
}

pub fn delete_timer(state: &mut AppState, timer_id: String) -> Task<Message> {
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    let timer_id = timer_id.clone();
    
    Task::perform(
        async move {
            let client = http_client();
            match client
                .delete(format!("{}/api/timer/{}", server, timer_id))
                .header("token", &token)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => Message::FetchTimers,
                Ok(resp) => Message::TimerDeleteResult(Err(format!("HTTP {}", resp.status().as_u16()))),
                Err(e) => Message::TimerDeleteResult(Err(format!("Connection error: {}", e))),
            }
        },
        |m| m,
    )
}

pub fn toggle_saved_timers(state: &mut AppState) -> Task<Message> {
    state.show_saved_timers = !state.show_saved_timers;
    if state.show_saved_timers && state.timers.is_empty() {
        return fetch_timers(state);
    }
    Task::none()
}

fn format_lap_time_csv(elapsed_ms: u64) -> String {
    let total_seconds = elapsed_ms / 1000;
    let minutes = (total_seconds / 60) % 60;
    let hours = total_seconds / 3600;
    let seconds = total_seconds % 60;
    let centiseconds = (elapsed_ms % 1000) / 10;

    if hours > 0 {
        format!("{:02}:{:02}:{:02}.{:02}", hours, minutes, seconds, centiseconds)
    } else {
        format!("{:02}:{:02}.{:02}", minutes, seconds, centiseconds)
    }
}

pub fn export_timer_csv(state: &mut AppState, timer_id: String, as_excel: bool) -> Task<Message> {
    eprintln!("ExportTimerCsv called: timer_id={}, as_excel={}", timer_id, as_excel);
    let server = state.server_address.clone();
    let token = state.ws.token.clone();
    let timer_id = timer_id.clone();
    
    Task::perform(
        async move {
            eprintln!("ExportTimerCsv async started");
            let client = http_client();
            match client
                .get(format!("{}/api/timers", server))
                .header("token", &token)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<Vec<Timer>>().await {
                        Ok(timers) => {
                            if let Some(timer) = timers.iter().find(|t| t.id == timer_id) {
                                use std::fs;
                                use std::path::PathBuf;
                                
                                if let Some(downloads_dir) = dirs::download_dir() {
                                    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
                                    let extension = if as_excel { "xlsx" } else { "csv" };
                                    let filename = format!("stopwatch_{}.{}", timestamp, extension);
                                    let file_path: PathBuf = downloads_dir.join(&filename);
                                    
                                    let result = if as_excel {
                                        let mut workbook = rust_xlsxwriter::Workbook::new();
                                        let mut sheet = workbook.add_worksheet();
                                        sheet.set_name(format!("stopwatch_{}", timestamp)).ok();
                                        
                                        sheet.write(0, 0, "Lap Number").ok();
                                        sheet.write(0, 1, "Lap Time").ok();
                                        sheet.write(0, 2, "Cumulative Time").ok();
                                        
                                        sheet.set_column_width(0, 12).ok();
                                        sheet.set_column_width(1, 15).ok();
                                        sheet.set_column_width(2, 18).ok();
                                        
                                        for (i, lap) in timer.laps.iter().enumerate() {
                                            let lap_num = (i + 1) as u32;
                                            let prev = if i == 0 { 0u64 } else { timer.laps[i-1] };
                                            let diff = lap - prev;
                                            
                                            sheet.write((i + 1) as u32, 0, lap_num).ok();
                                            sheet.write((i + 1) as u32, 1, &format_lap_time_csv(diff)).ok();
                                            sheet.write((i + 1) as u32, 2, &format_lap_time_csv(*lap)).ok();
                                        }
                                        
                                        let xlsx_data = workbook.save_to_buffer().unwrap();
                                        fs::write(&file_path, xlsx_data)
                                    } else {
                                        let mut csv_content = String::new();
                                        csv_content.push_str("Lap Number,Lap Time,Cumulative Time\n");
                                        for (i, lap) in timer.laps.iter().enumerate() {
                                            let lap_num = i + 1;
                                            let prev = if i == 0 { 0u64 } else { timer.laps[i-1] };
                                            let diff = lap - prev;
                                            csv_content.push_str(&format!(
                                                "{},{},{}\n",
                                                lap_num,
                                                format_lap_time_csv(diff),
                                                format_lap_time_csv(*lap)
                                            ));
                                        }
                                        fs::write(&file_path, csv_content)
                                    };
                                    
                                    match result {
                                        Ok(_) => {
                                            eprintln!("Saved {} to: {:?}", extension, file_path);
                                            Message::TimerSaveResult(Ok(()))
                                        }
                                        Err(e) => Message::TimerSaveResult(Err(format!("Failed to save: {}", e)))
                                    }
                                } else {
                                    Message::TimerSaveResult(Err("Could not find Downloads directory".to_string()))
                                }
                            } else {
                                Message::TimerSaveResult(Err("Timer not found".to_string()))
                            }
                        }
                        Err(e) => Message::TimerSaveResult(Err(format!("Parse error: {}", e))),
                    }
                }
                Ok(resp) => Message::TimerSaveResult(Err(format!("HTTP {}", resp.status().as_u16()))),
                Err(e) => Message::TimerSaveResult(Err(format!("Connection error: {}", e))),
            }
        },
        |m| m,
    )
}

pub fn save_csv_file(_state: &mut AppState, _data: String, _is_excel: bool) -> Task<Message> {
    Task::none()
}

pub fn load_timer_by_id(state: &mut AppState, timer_id: String) -> Task<Message> {
    if let Some(timer) = state.timers.iter().find(|t| t.id == timer_id) {
        load_timer(state, timer.clone());
        state.show_saved_timers = false;
    }
    Task::none()
}

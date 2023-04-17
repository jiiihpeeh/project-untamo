use std::{str,env};
use std::time::Duration; 
use serde::ser::{Serialize, SerializeStruct, Serializer};
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, State, Manager, Window, command };
use qrcode_generator::QrCodeEcc;
use async_std::task::{sleep as async_sleep};
// use std::fs::File;
// use std::io::BufReader;
// use std::error::Error;
//use tokio::fs::File;
use std::sync::{ Mutex};
//use tauri_sys::path::app_local_data_dir;
use std::path::{PathBuf, Path};
// use tokio::sync::mpsc::{Sender, Receiver, channel};
// use tracing::info;
// use tracing_subscriber;
//use tokio::sync::Mutex as AsyncMutex;
use itertools::Itertools;
struct SetDirs {
  app_dir: Option<PathBuf>,
  resource_dir: Option<PathBuf>,
  is_set: bool,
}
static SETDIRS : Mutex<SetDirs> = Mutex::new(SetDirs{app_dir: None, resource_dir: None, is_set: false});



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
    //check if RESOURCEDIR is set
    if  ! SETDIRS.lock().unwrap().is_set {
      return ;
    }
    self.resource_audio_path = Some(SETDIRS.lock().unwrap().resource_dir.clone().unwrap().join("audio")) ;
  }
  fn set_audio_app_path(&mut self) {
    //check if APPDIR is set
    if  ! SETDIRS.lock().unwrap().is_set {
      return ;
    }
    self.audio_app_path = Some(SETDIRS.lock().unwrap().app_dir.clone().unwrap().join("audio"));

    //check if Some
    if self.audio_app_path.is_some(){
      //create directory if it does not exist
      let path = self.audio_app_path.clone().unwrap();
      if !path.exists() {
        match std::fs::create_dir(path){
          Ok(_) => println!("Created audio directory"),
          Err(e) => println!("Failed to create audio directory: {}", e),
        }
      }
    }
  }
  fn get_audio_app_path(&mut self) -> Option<PathBuf> {
    self.audio_app_path.clone()
  }
  fn get_tracks (& mut self) -> Vec<String> {
    self.set_tracks();
    let mut named_tracks = self.tracks.clone();
    for i in 0..named_tracks.len(){
      //get basename and remove extension
      named_tracks[i] = Path::new(&named_tracks[i]).file_name().unwrap().to_str().unwrap().to_string().split('.').next().unwrap().to_string() ;
    }
    //remove duplicates using itertools
    named_tracks
  }
  fn get_track_path(&mut self, track: &str) -> Option<String> {
    self.set_tracks();
    let track_file_name = format!("{}.flac", track);
    let app_track_path = self.audio_app_path.clone().unwrap().join(track_file_name.clone()).to_str().unwrap().to_string();
    //check if app_track_path is system path
    if PathBuf::from(&app_track_path).exists(){
      return Some(app_track_path);
    }
    let resource_track_path = self.resource_audio_path.clone().unwrap().join(track_file_name.clone()).to_str().unwrap().to_string();
    if PathBuf::from(&resource_track_path).exists(){
      return Some(resource_track_path);
    }else {
      return None;
    }
  }
  fn set_tracks(&mut self) {
    //list files in resource path
    if self.resource_audio_path.is_none() || self.audio_app_path.is_none() {
      self.set_resource_path();
      self.set_audio_app_path();
      if self.resource_audio_path.is_none() || self.audio_app_path.is_none(){
        return;
      }
    }
    let mut tracks = Vec::new();
    let path = self.resource_audio_path.clone().unwrap();
    //get list of files in path that ends with flac
    for i in  std::fs::read_dir(path).unwrap(){
      let file = i.unwrap();
      let file_name = file.file_name().into_string().unwrap();
      if file_name.ends_with(".flac"){
        tracks.push(file_name);
      }
    }
    //list files in app path
    for i in std::fs::read_dir(self.audio_app_path.clone().unwrap()).unwrap(){
      let file = i.unwrap();
      let file_name = file.file_name().into_string().unwrap();
      if file_name.ends_with(".flac"){
        tracks.push(file_name);
      }
    }
    self.tracks = tracks.into_iter().unique().collect();

  }
  fn delete_track(&mut self, track: &str)-> bool  {
    self.set_tracks();
    let track_file_name = format!("{}.flac", track);
    let app_track_path = self.audio_app_path.clone().unwrap().join(track_file_name.clone());
    if app_track_path.exists(){
      println!("Deleting track from app directory");
      match std::fs::remove_file(app_track_path){
        Ok(_) => return true,
        Err(e) => {
          println!("Failed to delete track: {}", e);
          return false;
        }
      }
    }else{
      return false;
    }
  }
}
struct AudioResourceState(Mutex<AudioResources>);


// Prevents additional console window on Windows in release, DO NOT REMOVE!!



#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
    )]
     

#[command]
fn close_window() {
  println!("Closing Application");
  std::process::exit(0);
}
#[command]
async fn interval_check(t : u64 ) -> bool{
  async_sleep(Duration::from_secs(t)).await;
  return true;
}

#[command]
async fn sleep(millis : u64 ) -> bool{
  async_sleep(Duration::from_millis(millis)).await;
  return true;
}

#[command]
async fn send_event_to_frontend(window: Window) {
    let message = "Hello, frontend!";
    println!("Sending event to frontend");
    //println!("{}", moro);
    window.emit("event_name", message).unwrap();
}

#[command]
fn get_qr_svg(qr_string: String) -> String {
  let result = qrcode_generator::to_svg_to_string(qr_string, QrCodeEcc::Low, 1024, None::<&str>);
  match result {
    Ok(svg) => svg,
    Err(e) => format!("Error: {}", e),
  }
}
async fn wait_paths() {
  let mut count = 0;
  while ! SETDIRS.lock().unwrap().is_set{    
      async_sleep(Duration::from_micros(30)).await;
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
  if ! SETDIRS.lock().unwrap().is_set{
    return false;
  }
  return true;
}

#[command]
async fn get_tracks(state: State<'_,AudioResourceState>) -> Result<Vec<String>, Vec<String>>{
  //check if SETDIRS is set and sleep for 100 usecond if not
  if ! configured().await{
    return Err(vec!["".to_string()]);
  }
  let tracks = state.0.lock().unwrap().get_tracks();
  Ok(tracks)
}

#[command]
async fn get_audio_app_path(state: State<'_,AudioResourceState>) ->  Result<String, String> {
  if ! configured().await{
    return Err("".to_string());
  }
  let path = state.0.lock().unwrap().get_audio_app_path().unwrap().to_str().unwrap().to_string();
  Ok(path)
}

#[command]
async fn get_track_path(track: &str, state: State<'_,AudioResourceState>) ->  Result<String, String> {
  if ! configured().await{
    return Err("".to_string());
  }
  let path = state.0.lock().unwrap().get_track_path(track);
  match path {
    Some(p) => Ok(p),
    None => Ok("".to_string()),
  }
}

struct DeleteResult {
  deleted: bool,
  tracks: Vec<String>,
}

// This is what #[derive(Serialize)] would generate.
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

#[command]
fn delete_track(track: &str, state: State<'_,AudioResourceState>) ->  DeleteResult{
  let result = state.0.lock().unwrap().delete_track(track);
  let tracks = state.0.lock().unwrap().get_tracks();

  DeleteResult{
    tracks: tracks,
    deleted: result,
  }
}
fn main() {

  let tray_menu = SystemTrayMenu::new()
    .add_item(CustomMenuItem::new("toggle".to_string(), "Show/Hide window"))
    .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));
    
    
    tauri::Builder::default()
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a left click");
      }
      SystemTrayEvent::RightClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a double click");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "toggle" => {
            let window = app.get_window("main").unwrap();
            if window.is_visible().unwrap() {
              window.hide().unwrap();
              "Show"
            } else {
              window.show().unwrap();
              "Hide"
            };
          }
          _ => {}
        }
        }
        _ => {}
      })
      .setup(|app| {
        let mut set_dirs = SETDIRS.lock().unwrap();
        *set_dirs = SetDirs{
                              app_dir: app.path_resolver().app_local_data_dir(), 
                              resource_dir: app.path_resolver().resource_dir(), 
                              is_set: true
                            };

        Ok(())
      })
      .manage(AudioResourceState(Mutex::new(AudioResources::new())))  
      .plugin(tauri_plugin_websocket::init())
      .invoke_handler(tauri::generate_handler![
                                                  close_window, 
                                                  interval_check, 
                                                  sleep, 
                                                  send_event_to_frontend,
                                                  get_qr_svg,
                                                  get_tracks,
                                                  get_audio_app_path,
                                                  get_track_path,
                                                  delete_track
                                              ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
              api.prevent_exit();
            }
            _ => {}
          });

}
 
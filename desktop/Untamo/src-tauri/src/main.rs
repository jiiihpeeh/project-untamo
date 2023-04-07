use libc::c_char;
use std::ffi::CStr;
use std::str;
use std::env;
use std::time::Duration; 
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;
use async_std::task;

fn rstr_to_cchar (s:&str) ->   *const c_char {
    let cchar: *const c_char = s.as_ptr() as *const c_char;
    return cchar;
}
fn cchar_to_string (s: *const c_char) -> String {
    let init_str: &CStr = unsafe { CStr::from_ptr(s) };
    let init_slice: &str = init_str.to_str().unwrap();
    let init: String = init_slice.to_owned();
    return init;
}   

#[link(name = "callnim", kind = "static")]
extern "C" {
    fn NimMain();
    fn callNim(a: *const c_char) -> *const c_char;
}

fn run_nim(args: &str)-> String {
    // initialize nim gc memory, types and stack
    unsafe {
        NimMain();
    }
    return cchar_to_string(unsafe { callNim(rstr_to_cchar(args)) });
}


// Prevents additional console window on Windows in release, DO NOT REMOVE!!

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
    )]
     
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn nim_caller(name: &str) -> String {
    //println!("{}", name); 
    return run_nim(name);
}

#[tauri::command]
fn void_func() {

}
#[tauri::command]
fn close_window() {
  println!("Closing Application");
  std::process::exit(0);
}
#[tauri::command]
async fn interval_check(t : u64 ) -> bool{
  task::sleep(Duration::from_secs(t)).await;
  return true;
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
        .invoke_handler(tauri::generate_handler![nim_caller, void_func, close_window, interval_check])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
              api.prevent_exit();
            }
            _ => {}
          });
}
 
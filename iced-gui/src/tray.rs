use std::cell::RefCell;
use std::sync::OnceLock;
use tray_icon::{
    menu::{Menu, MenuEvent, MenuItem, MenuId, PredefinedMenuItem},
    Icon as TrayIconInner, TrayIcon, TrayIconBuilder,
};

// TrayIcon is !Send so we keep it on the main thread only
thread_local! {
    static TRAY: RefCell<Option<TrayIcon>> = RefCell::new(None);
}

static SHOW_ID: OnceLock<MenuId> = OnceLock::new();
static QUIT_ID: OnceLock<MenuId> = OnceLock::new();

pub fn init_tray() {
    let icon = load_tray_icon();

    let show_item = MenuItem::new("Show Untamo", true, None);
    let quit_item = MenuItem::new("Quit", true, None);

    let _ = SHOW_ID.set(show_item.id().clone());
    let _ = QUIT_ID.set(quit_item.id().clone());

    let menu = Menu::new();
    let _ = menu.append_items(&[
        &show_item,
        &PredefinedMenuItem::separator(),
        &quit_item,
    ]);

    match TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_icon(icon)
        .with_tooltip("Untamo")
        .build()
    {
        Ok(tray) => {
            TRAY.with(|t| *t.borrow_mut() = Some(tray));
        }
        Err(e) => eprintln!("System tray: {}", e),
    }
}

pub enum TrayAction {
    ShowWindow,
    Quit,
}

/// Call from FrameTick (main thread) to check for tray menu events.
pub fn poll_events() -> Option<TrayAction> {
    let show_id = SHOW_ID.get()?;
    let quit_id = QUIT_ID.get()?;

    if let Ok(event) = MenuEvent::receiver().try_recv() {
        if event.id == *quit_id {
            return Some(TrayAction::Quit);
        }
        if event.id == *show_id {
            return Some(TrayAction::ShowWindow);
        }
    }
    None
}

fn load_tray_icon() -> TrayIconInner {
    // Use the pre-rendered PNG icon from resources
    let png_bytes = include_bytes!("../resources/icons/icon_32.png");
    if let Ok(img) = image::load_from_memory(png_bytes) {
        let rgba = img.into_rgba8();
        let (w, h) = rgba.dimensions();
        if let Ok(icon) = TrayIconInner::from_rgba(rgba.into_raw(), w, h) {
            return icon;
        }
    }
    // Fallback: blue circle
    let size = 32u32;
    let mut rgba = vec![0u8; (size * size * 4) as usize];
    let cx = size as f32 / 2.0;
    let cy = size as f32 / 2.0;
    let r = size as f32 / 2.0 - 1.0;
    for y in 0..size {
        for x in 0..size {
            let dx = x as f32 - cx;
            let dy = y as f32 - cy;
            let idx = ((y * size + x) * 4) as usize;
            if (dx * dx + dy * dy).sqrt() <= r {
                rgba[idx] = 52;
                rgba[idx + 1] = 124;
                rgba[idx + 2] = 228;
                rgba[idx + 3] = 255;
            }
        }
    }
    TrayIconInner::from_rgba(rgba, size, size).expect("fallback tray icon")
}

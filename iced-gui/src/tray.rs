use ksni::{menu::StandardItem, Tray, TrayService};
use std::sync::{mpsc, Mutex, OnceLock};

use crate::messages::Message;
use iced::Subscription;

enum TrayCmd {
    Toggle,
    Quit,
}

static RX: OnceLock<Mutex<mpsc::Receiver<TrayCmd>>> = OnceLock::new();

struct UntamoTray {
    tx: mpsc::Sender<TrayCmd>,
}

impl Tray for UntamoTray {
    fn icon_pixmap(&self) -> Vec<ksni::Icon> {
        load_tray_icon()
    }

    fn title(&self) -> String {
        "Untamo".into()
    }

    fn tool_tip(&self) -> ksni::ToolTip {
        ksni::ToolTip {
            title: "Untamo".into(),
            ..Default::default()
        }
    }

    fn activate(&mut self, _x: i32, _y: i32) {
        let _ = self.tx.send(TrayCmd::Toggle);
    }

    fn menu(&self) -> Vec<ksni::MenuItem<Self>> {
        use ksni::menu::*;
        vec![
            StandardItem {
                label: "Toggle Untamo".into(),
                activate: Box::new(|tray: &mut Self| {
                    let _ = tray.tx.send(TrayCmd::Toggle);
                }),
                ..Default::default()
            }
            .into(),
            MenuItem::Separator,
            StandardItem {
                label: "Quit".into(),
                activate: Box::new(|tray: &mut Self| {
                    let _ = tray.tx.send(TrayCmd::Quit);
                }),
                ..Default::default()
            }
            .into(),
        ]
    }
}

pub fn init_tray() {
    let (tx, rx) = mpsc::channel();
    let _ = RX.set(Mutex::new(rx));
    let service = TrayService::new(UntamoTray { tx });
    service.spawn();
}

pub fn subscription() -> Subscription<Message> {
    Subscription::run(tray_event_stream)
}

fn tray_event_stream() -> impl futures::Stream<Item = Message> {
    async_stream::stream! {
        loop {
            tokio::time::sleep(std::time::Duration::from_millis(100)).await;
            let msgs: Vec<Message> = RX.get()
                .and_then(|rx| rx.try_lock().ok())
                .map(|guard| {
                    let mut out = Vec::new();
                    while let Ok(cmd) = guard.try_recv() {
                        out.push(match cmd {
                            TrayCmd::Toggle => Message::TrayToggle,
                            TrayCmd::Quit => Message::TrayQuit,
                        });
                    }
                    out
                })
                .unwrap_or_default();
            for msg in msgs {
                yield msg;
            }
        }
    }
}

fn load_tray_icon() -> Vec<ksni::Icon> {
    let png_bytes = include_bytes!("../resources/icons/icon_32.png");
    if let Ok(img) = image::load_from_memory(png_bytes) {
        let rgba = img.into_rgba8();
        let (w, h) = rgba.dimensions();
        let argb: Vec<u8> = rgba
            .into_raw()
            .chunks(4)
            .flat_map(|p| [p[3], p[0], p[1], p[2]])
            .collect();
        return vec![ksni::Icon {
            width: w as i32,
            height: h as i32,
            data: argb,
        }];
    }
    let size = 32i32;
    let mut argb = vec![0u8; (size * size * 4) as usize];
    for y in 0..size {
        for x in 0..size {
            let dx = x as f32 - 15.5;
            let dy = y as f32 - 15.5;
            if (dx * dx + dy * dy).sqrt() <= 15.0 {
                let i = ((y * size + x) * 4) as usize;
                argb[i] = 255;
                argb[i + 1] = 52;
                argb[i + 2] = 124;
                argb[i + 3] = 228;
            }
        }
    }
    vec![ksni::Icon {
        width: size,
        height: size,
        data: argb,
    }]
}

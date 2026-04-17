use futures_util::{SinkExt, StreamExt};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

static WS_CONNECTED: AtomicBool = AtomicBool::new(false);

#[derive(Clone, Debug)]
pub enum WsMessageType {
    AlarmAdd,
    AlarmDelete,
    AlarmEdit,
    DeviceAdd,
    DeviceDelete,
    DeviceEdit,
    UserEdit,
    WebColors,
}

#[derive(Clone, Debug)]
pub struct WsMessage {
    pub msg_type: WsMessageType,
    pub data: serde_json::Value,
}

impl WsMessage {
    pub fn from_json(json: &str) -> Option<Self> {
        let parsed: serde_json::Value = serde_json::from_str(json).ok()?;
        let type_str = parsed.get("type")?.as_str()?;
        
        let msg_type = match type_str {
            "alarmAdd" => WsMessageType::AlarmAdd,
            "alarmDelete" => WsMessageType::AlarmDelete,
            "alarmEdit" => WsMessageType::AlarmEdit,
            "deviceAdd" => WsMessageType::DeviceAdd,
            "deviceDelete" => WsMessageType::DeviceDelete,
            "deviceEdit" => WsMessageType::DeviceEdit,
            "userEdit" => WsMessageType::UserEdit,
            "webColors" => WsMessageType::WebColors,
            _ => return None,
        };
        
        let data = parsed.get("data")?.clone();
        
        Some(WsMessage { msg_type, data })
    }
}

#[derive(Clone, Debug)]
pub struct AlarmData {
    #[allow(dead_code)]
    pub id: String,
    #[allow(dead_code)]
    pub occurrence: String,
    #[allow(dead_code)]
    pub time: Vec<u8>,
    #[allow(dead_code)]
    pub weekdays: u8,
    #[allow(dead_code)]
    pub date: Vec<u8>,
    #[allow(dead_code)]
    pub label: String,
    #[allow(dead_code)]
    pub devices: Vec<String>,
    #[allow(dead_code)]
    pub active: bool,
    #[allow(dead_code)]
    pub tune: String,
    #[allow(dead_code)]
    pub message: String,
}

impl AlarmData {
    #[allow(dead_code)]
    pub fn from_json(value: &serde_json::Value) -> Self {
        AlarmData {
            id: value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            occurrence: value.get("occurrence").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            time: value.get("time").and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_u64()).map(|n| n as u8).collect())
                .unwrap_or_default(),
            weekdays: value.get("weekdays").and_then(|v| v.as_u64()).unwrap_or(0) as u8,
            date: value.get("date").and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_u64()).map(|n| n as u8).collect())
                .unwrap_or_default(),
            label: value.get("label").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            devices: value.get("devices").and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str()).map(|s| s.to_string()).collect())
                .unwrap_or_default(),
            active: value.get("active").and_then(|v| v.as_bool()).unwrap_or(true),
            tune: value.get("tune").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            message: value.get("message").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct DeviceData {
    #[allow(dead_code)]
    pub id: String,
    #[allow(dead_code)]
    pub device_name: String,
    #[allow(dead_code)]
    pub device_type: String,
}

impl DeviceData {
    #[allow(dead_code)]
    pub fn from_json(value: &serde_json::Value) -> Self {
        DeviceData {
            id: value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            device_name: value.get("deviceName").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            device_type: value.get("type").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        }
    }
}

pub fn websocket_url(server: &str) -> String {
    let base = server.trim_start_matches("http://").trim_start_matches("https://");
    if server.starts_with("https") {
        format!("wss://{}/action", base)
    } else {
        format!("ws://{}/action", base)
    }
}

pub async fn ws_connect(
    server: &str,
    ws_token: &str,
    ws_pair: &str,
    result_tx: mpsc::Sender<Result<WsMessage, String>>,
) {
    let url = format!("{}/{}", websocket_url(server), ws_token);
    println!("WS: Connecting to {}", url);
    
    match connect_async(&url).await {
        Ok((ws_stream, _)) => {
            println!("WS: Connected!");
            WS_CONNECTED.store(true, Ordering::SeqCst);
            
            let (mut write, mut read) = ws_stream.split();
            
            if let Err(e) = write.send(Message::Text(ws_pair.to_string())).await {
                eprintln!("WS: Failed to send pairing token: {}", e);
                let _ = result_tx.send(Err(format!("Send error: {}", e))).await;
                return;
            }
            
            loop {
                tokio::select! {
                    msg = read.next() => {
                        match msg {
                            Some(Ok(Message::Text(text))) => {
                                let text_str = text.to_string();
                                if text_str == "." {
                                    let _ = write.send(Message::Text(".".to_string())).await;
                                    continue;
                                }
                                
                                if let Some(ws_msg) = WsMessage::from_json(&text_str) {
                                    if result_tx.send(Ok(ws_msg)).await.is_err() {
                                        break;
                                    }
                                }
                            }
                            Some(Ok(Message::Close(_))) | None => {
                                println!("WS: Disconnected");
                                WS_CONNECTED.store(false, Ordering::SeqCst);
                                let _ = result_tx.send(Err("Disconnected".to_string())).await;
                                break;
                            }
                            Some(Err(e)) => {
                                eprintln!("WS: Error: {}", e);
                                let _ = result_tx.send(Err(format!("Error: {}", e))).await;
                                break;
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("WS: Connection failed: {}", e);
            WS_CONNECTED.store(false, Ordering::SeqCst);
            let _ = result_tx.send(Err(format!("Connection failed: {}", e))).await;
        }
    }
}

pub fn is_connected() -> bool {
    WS_CONNECTED.load(Ordering::SeqCst)
}

pub fn disconnect() {
    WS_CONNECTED.store(false, Ordering::SeqCst);
}

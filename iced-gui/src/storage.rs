use aes::cipher::block_padding::Pkcs7;
use aes::cipher::{BlockDecryptMut, BlockEncryptMut, KeyIvInit};
use aes::Aes256;
use cbc::{Decryptor, Encryptor};
use machineid_rs::{Encryption, HWIDComponent, IdBuilder};
use serde::{Deserialize, Serialize};
use std::fs;

type Aes256CbcEnc = Encryptor<Aes256>;
type Aes256CbcDec = Decryptor<Aes256>;

static MACHINE_ID: std::sync::OnceLock<String> = std::sync::OnceLock::new();

fn get_machine_id() -> String {
    MACHINE_ID
        .get_or_init(|| {
            let mut builder = IdBuilder::new(Encryption::SHA256);
            builder.add_component(HWIDComponent::SystemID);
            builder.add_component(HWIDComponent::CPUCores);
            builder.add_component(HWIDComponent::MachineName);
            builder
                .build("untamo-salt-v1")
                .unwrap_or_else(|_| "fallback-id".to_string())
        })
        .clone()
}

fn derive_key(machine_id: &str) -> [u8; 32] {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    machine_id.hash(&mut hasher);
    let h1 = hasher.finish();

    let mut hasher = DefaultHasher::new();
    format!("{:016x}", h1).hash(&mut hasher);
    let h2 = hasher.finish();

    let mut hasher = DefaultHasher::new();
    format!("{:016x}{:016x}", h1, h2).hash(&mut hasher);
    let h3 = hasher.finish();

    let mut hasher = DefaultHasher::new();
    format!("{:016x}{:016x}{:016x}", h1, h2, h3).hash(&mut hasher);
    let h4 = hasher.finish();

    let mut key = [0u8; 32];
    key[..8].copy_from_slice(&h1.to_be_bytes());
    key[8..16].copy_from_slice(&h2.to_be_bytes());
    key[16..24].copy_from_slice(&h3.to_be_bytes());
    key[24..32].copy_from_slice(&h4.to_be_bytes());
    key
}

fn get_config_dir() -> std::path::PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("untamo");
    if !config_dir.exists() {
        let _ = fs::create_dir_all(&config_dir);
    }
    config_dir
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SessionData {
    pub token: String,
    pub ws_token: String,
    pub ws_pair: String,
    pub email: String,
    pub screen_name: String,
    pub first_name: String,
    pub last_name: String,
    pub admin: bool,
    pub owner: bool,
    pub active: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub clock24: bool,
    pub volume: f32,
    pub nav_bar_top: bool,
    pub panel_size: u32,
    #[serde(default)]
    pub device_id: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            clock24: true,
            volume: 0.9,
            nav_bar_top: true,
            panel_size: 56,
            device_id: None,
        }
    }
}

fn encrypt_data(data: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, String> {
    let mut iv = [0u8; 16];
    getrandom::getrandom(&mut iv).map_err(|e| e.to_string())?;
    let cipher = Aes256CbcEnc::new(key.as_slice().into(), (&iv).into());
    let mut buf = data.to_vec();
    buf.resize(data.len() + 16, 0);
    let padded = cipher
        .encrypt_padded_mut::<Pkcs7>(&mut buf, data.len())
        .map_err(|e| format!("{:?}", e))?;
    let mut result = iv.to_vec();
    result.extend(padded);
    Ok(result)
}

fn decrypt_data(encrypted: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, String> {
    if encrypted.len() < 16 {
        return Err("Invalid encrypted data".to_string());
    }
    let iv: [u8; 16] = encrypted[..16]
        .try_into()
        .map_err(|_| "Invalid IV".to_string())?;
    let ciphertext = &encrypted[16..];
    let cipher = Aes256CbcDec::new(key.as_slice().into(), (&iv).into());
    let mut buf = ciphertext.to_vec();
    let decrypted = cipher
        .decrypt_padded_mut::<Pkcs7>(&mut buf)
        .map_err(|e| format!("{:?}", e))?;
    Ok(decrypted.to_vec())
}

pub fn save_session(session: &SessionData) -> Result<(), String> {
    let machine_id = get_machine_id();
    let key = derive_key(&machine_id);
    let json = serde_json::to_vec(session).map_err(|e| e.to_string())?;
    let encrypted = encrypt_data(&json, &key)?;
    let path = get_config_dir().join("session.enc");
    fs::write(&path, encrypted).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn load_session() -> Option<SessionData> {
    let machine_id = get_machine_id();
    let key = derive_key(&machine_id);
    let path = get_config_dir().join("session.enc");
    if !path.exists() {
        return None;
    }
    let encrypted = fs::read(&path).ok()?;
    let json = decrypt_data(&encrypted, &key).ok()?;
    serde_json::from_slice(&json).ok()
}

pub fn clear_session() {
    let path = get_config_dir().join("session.enc");
    let _ = fs::remove_file(path);
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let machine_id = get_machine_id();
    let key = derive_key(&machine_id);
    let json = serde_json::to_vec(settings).map_err(|e| e.to_string())?;
    let encrypted = encrypt_data(&json, &key)?;
    let path = get_config_dir().join("settings.enc");
    fs::write(&path, encrypted).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn load_settings() -> AppSettings {
    let machine_id = get_machine_id();
    let key = derive_key(&machine_id);
    let path = get_config_dir().join("settings.enc");
    if !path.exists() {
        return AppSettings::default();
    }
    let encrypted = match fs::read(&path) {
        Ok(data) => data,
        Err(_) => return AppSettings::default(),
    };
    let json = match decrypt_data(&encrypted, &key) {
        Ok(j) => j,
        Err(_) => return AppSettings::default(),
    };
    serde_json::from_slice(&json).unwrap_or_default()
}

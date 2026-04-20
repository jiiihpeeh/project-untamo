pub const DEFAULT_SERVER: &str = "http://localhost:3001";

pub fn get_server() -> String {
    std::env::var("UNTAMO_SERVER").unwrap_or_else(|_| DEFAULT_SERVER.to_string())
}

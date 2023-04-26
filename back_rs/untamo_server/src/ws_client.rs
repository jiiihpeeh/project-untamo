use std::net::TcpStream;

use tungstenite::http::Response;
use tungstenite::{connect , Message, WebSocket};
use tungstenite::stream::MaybeTlsStream;
use tungstenite::error::Error;
use url::Url;

pub struct WsClient{
    socket: WebSocket<MaybeTlsStream<TcpStream>>,
    response: Response<Option<Vec<u8>>>,
    url: String,
}
impl WsClient {
    //derive WsClient from url
    pub fn new(url: &str) -> Result<WsClient, Error> {
        let url_parsed = String::from(url);
        let (mut socket, response) = connect(url_parsed)?;
        let client = WsClient {
            socket,
            response,
            url: String::from(url),
        };
        Ok(client)
    }
    pub fn connect(&mut self) -> Result<(), Error> {
        let url = Url::parse(&self.url).unwrap();
        let (mut socket, response) = connect(url)?;
        self.socket = socket;
        self.response = response;
        Ok(())
    }
}
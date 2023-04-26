use std::net::TcpStream;
use serde::{Serialize, Deserialize};
use tungstenite::http::Response;
use tungstenite::{connect , Message, WebSocket};
use tungstenite::stream::MaybeTlsStream;
use tungstenite::error::Error;
use url::Url;

//serialize and deserialize websocket messages
#[derive(Debug, Clone, Serialize, Deserialize)]
struct  WsMessage{
    mode: String,
    url: String,
}

struct WsClient{
    socket: WebSocket<MaybeTlsStream<TcpStream>>,
    response: Response<Option<Vec<u8>>>,
    url: String,
}
impl WsClient {
    //derive WsClient from url
    fn new(url: &str) -> Result<WsClient, Error> {
        let url_parsed = String::from(url);
        let (mut socket, response) = connect(url_parsed)?;
        let client = WsClient {
            socket,
            response,
            url: String::from(url),
        };
        Ok(client)
    }
    fn connect(&mut self) -> Result<(), Error> {
        let url = Url::parse(&self.url).unwrap();
        let (mut socket, response) = connect(url)?;
        self.socket = socket;
        self.response = response;
        Ok(())
    }
    fn send(&mut self, msg: &str) -> Result<(), Error> {
        let message = WsMessage{
            mode: String::from("url"),
            url: msg.to_string(),
        };
        let message_ser = serde_json::to_string(&message).unwrap();
        self.socket.write_message(Message::Text(message_ser))
    }
}
pub struct WsClientConnect{
    uri: String,
    client: Option<WsClient>,
    connection: bool
}

impl WsClientConnect {
    pub fn new(uri: &str) -> WsClientConnect {
        WsClientConnect {
            uri: String::from(uri),
            client: None,
            connection: false,
        }
    }
    pub fn connect(&mut self) ->bool{
        match WsClient::new(&self.uri) {
            Ok(client) => {
                self.client = Some(client);
                self.connection = true;
                true
            },
            Err(_) => {
                self.connection = false;
                false
            },
        }
    }
    pub fn send(&mut self, msg: &str) -> bool {
        if self.connection {
            match &mut self.client {
                Some(client) => {
                    match client.send(msg) {
                        Ok(_) => true,
                        Err(_) => false,
                    }
                },
                None => false,
            }
        } else {
            false
        }
    }
}
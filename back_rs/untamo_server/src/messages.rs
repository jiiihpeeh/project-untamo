use actix::prelude::{Message, Recipient};
use uuid::Uuid;

//#[derive(Message)]
#[rtype(result = "()")]
//pub struct WsMessage(pub String);
#[derive(Serialize, Deserialize, Debug, Clone, Message)]
pub struct WsMsg{
    pub mode: Option<String>,
    pub token: Option<String>,
    pub url: Option<String>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub addr: Recipient<WsMessage>,
    pub targets_db_id: Uuid,
    pub self_id: Uuid,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: Uuid,
    pub room_id: Uuid,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientActorMessage {
    pub id: Uuid,
    pub msg: String,
    pub room_id: Uuid
}
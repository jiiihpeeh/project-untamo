use crate::messages::{ClientActorMessage, Connect, Disconnect, WsMessage};
use actix::prelude::{Actor, Context, Handler, Recipient};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;


type Socket = Recipient<WsMessage>;

pub struct TargetsDb {
    //sessions: HashMap<Uuid, Socket>, //self id to self
    //rooms: HashMap<Uuid, HashSet<Uuid>>,      //room id  to list of users id
    token_socket: HashMap<String, Socket>, //token to self
    user_tokens : HashMap<String, Vec<String>>, //self id to token
    token_user : HashMap<String, String>, //token to self id
}

impl Default for TargetsDb {
    fn default() -> TargetsDb {
        TargetsDb {
            token_socket: HashMap::new(),
            user_tokens: HashMap::new(),
            token_user: HashMap::new(),
        }
    }
}

impl TargetsDb {
    fn send_message(&self, message: &str, token: &str) {    
        if let Some(user) = self.token_user.get(token) {
            //get all the tokens for the user excluding the one we are sending to
            let tokens = self.user_tokens.get(user).unwrap().iter().filter(|t| *t != token);
            //send the message to all the tokens
            for token in tokens {
                if let Some(socket_recipient) = self.token_socket.get(token) {
                    let _ = socket_recipient
                        .do_send(WsMessage(message.to_owned()));
                } else {
                    println!("attempting to send message but couldn't find user token.");
                }
            }

        } else {
            println!("attempting to send message but couldn't find user id.");
        }
    }
}

impl Actor for TargetsDb {
    type Context = Context<Self>;
}

impl Handler<Disconnect> for TargetsDb {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        if self.token_socket.remove(&msg.token).is_some() {
            //remove the token from the user's list of tokens
            if let Some(user) = self.token_user.get(&msg.token) {
                if let Some(tokens) = self.user_tokens.get_mut(user) {
                    tokens.retain(|t| *t != msg.token);
                }
            }
            self.token_user.remove(&msg.token);     
        }
        // if self.sessions.remove(&msg.id).is_some() {
        //     self.rooms
        //         .get(&msg.room_id)
        //         .unwrap()
        //         .iter()
        //         .filter(|conn_id| *conn_id.to_owned() != msg.id)
        //         .for_each(|user_id| self.send_message(&format!("{} disconnected.", &msg.id), user_id));
        //     if let Some(targets_db) = self.rooms.get_mut(&msg.room_id) {
        //         if targets_db.len() > 1 {
        //             targets_db.remove(&msg.id);
        //         } else {
        //             //only one in the targets_db, remove it entirely
        //             self.rooms.remove(&msg.room_id);
        //         }
        //     }
        // }
    }
}

impl Handler<Connect> for TargetsDb {
    type Result = ();

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        // self.rooms
        //     .entry(msg.targets_db_id)
        //     .or_insert_with(HashSet::new).insert(msg.self_id);

        // self
        //     .rooms
        //     .get(&msg.targets_db_id)
        //     .unwrap()
        //     .iter()
        //     .filter(|conn_id| *conn_id.to_owned() != msg.self_id)
        //     .for_each(|conn_id| self.send_message(&format!("{} just joined!", msg.self_id), conn_id));

        // self.sessions.insert(
        //     msg.self_id,
        //     msg.addr,
        // );

        // self.send_message(&format!("your id is {}", msg.self_id), &msg.self_id);
    }
}

// impl Handler<WsMessage> for TargetsDb {
//     type Result = ();

//     fn handle(&mut self, msg: WsMessage, _ctx: &mut Context<Self>) -> Self::Result {
//         //handle client's connect message and add to token and user lists
        


//         // if msg.msg.starts_with("\\w") {
//         //     if let Some(id_to) = msg.msg.split(' ').collect::<Vec<&str>>().get(1) {
//         //         self.send_message(&msg.msg, &Uuid::parse_str(id_to).unwrap());
//         //     }
//         // } else {
//         //     self.rooms.get(&msg.room_id).unwrap().iter().for_each(|client| self.send_message(&msg.msg, client));
//         // }
//     }
// }
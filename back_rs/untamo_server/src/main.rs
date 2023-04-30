// use actix_rt::net::TcpStream;
// use actix_web::http::header::Header;
// use actix_web::web::Payload;
//use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_cors::Cors;
use actix_files::NamedFile;
use actix_web::error::{ErrorInternalServerError, InternalError};
use actix_web::http::StatusCode;
use actix_web::{get, post, put, delete, web, App, HttpResponse, HttpServer, Responder, HttpRequest, http};
use futures::{StreamExt, TryStreamExt};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use mongodb::{bson::doc, options::IndexOptions, Client, Collection, IndexModel};
use utils::new_token;
use std::fs;
use std::path::{PathBuf, Path};
use std::{collections::HashMap, ops::Deref};
use std::option::Option;
use itertools::Itertools;
use std::sync::Mutex;
use actix_ws::{self, Message, Session as WsSession};
mod ws_client;
mod password_hash;
mod utils;
mod form_check;
extern crate zxcvbn;

use zxcvbn::zxcvbn;

//use::crate::{utils, password_hash, ws_client};
//{random_string, random_capital, new_token, time_now}
//{verify_password, hash_password}
const MONGODB_URI: &str = "mongodb://root:example@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.5.4";
const DB_NAME: &str = "Untamo";
const USERCOLL: &str = "users";
const SESSIONCOLL: &str = "sessions";
const QRCOLL : &str = "qr";
const ALARMCOLL : &str = "alarms";
const DEVICECOLL : &str = "devices";
const ADMINCOLL : &str = "admins";
const PORT : u16 = 8080;


//establish a ws client connection using rust websocket and ClientBuilder


#[derive(Debug, Clone, Serialize, Deserialize)]
struct SessionNotValid {
    message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
pub struct User {
    _id: ObjectId,
    email: String,
    password: String,
    first_name: Option<String>,
    last_name: Option<String>,
    screen_name: String,
    active: bool,
    admin: bool,
    owner: bool,
}



#[derive(Debug, Clone, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
pub struct Session {
    _id: ObjectId,
    user_id: String,
    token: String,
    time: i64,
}

impl Session {
    pub fn new (user_id: String ) -> Session {
        let time = utils::time_now();
        let token = utils::new_token(64);
        Session { _id: ObjectId::new(), user_id, token, time }
    }
}
 
#[derive(Debug, Clone, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
struct LogIn {
    email: String,
    password: String,
}



#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LogInResponse {
    token: String,
    email: String,
    screen_name: Option<String>,
    first_name: Option<String>,
    last_name: Option<String>,
    admin: bool,
    owner: bool,
    time: i64,
}

async fn get_user_from_email(email: &str, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    //number of items in collection
    match collection.find_one(doc! {"email": email}, None).await {
        Ok(result) => {
            match result {
                Some(user) => {
                    println!("Found user: {}", user.email);
                    return Some(user);
                },
                None => {
                    println!("User not found");
                    return None;
                }
            }
        },
        Err(e) => {
            println!("Error: {}", e);
            return None;
        }
    };
}

async fn set_new_session(session: Session, client: web::Data<Client>)-> bool {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    match collection.insert_one(session.clone(), None).await {
        Ok(result) => {
            match result.inserted_id.as_object_id() {
                Some(id) => {
                    println!("Inserted id {}", id.to_hex());
                    return true;
                },
                None => {
                    println!("Could not get id");
                    return false;
                }
            }
        },
        Err(e) => {
            println!("Error: {}", e);
            return false;
        }
    };
}   

#[post("/login")]
async fn login(login: web::Json<LogIn>,client: web::Data<Client>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    //number of items in collection
    let user = match  get_user_from_email(&login.email, &client).await {
        Some(user) => user,
        None => {
            return HttpResponse::BadRequest().json("User not found");
        }
    };
    
    if !password_hash::verify_password(&login.password, &user.password) {
        return HttpResponse::BadRequest().json("Invalid password");
    }
    println!("User: {:?}", user);
    //let session = Session::new(user.id.clone());
  
    let response = LogInResponse {
        token: utils::new_token(64),
        email: user.email.clone(),
        screen_name: Some(user.screen_name.clone()),
        first_name: user.first_name.clone(),
        last_name: user.last_name.clone(),
        admin: user.admin,
        owner: user.owner,
        //add 5 years to time
        time: utils::time_now() + 157680000000,
    };
    let session = Session{ _id: ObjectId::new(), user_id: user._id.to_hex(), token: response.token.clone(), time: response.time };
    set_new_session(session, client.clone()).await;
    let login_response = LogInResponse {
        token: response.token,
        email: response.email,
        screen_name: response.screen_name,
        first_name: response.first_name,
        last_name: response.last_name,
        admin: response.admin,
        owner: response.owner,
        time: response.time,
    };
    println!("Login response: {:?}", login_response);
    ws_client.lock().unwrap().try_send("/login", &login_response.token).await;

    HttpResponse::Ok().json(login_response)   
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Register {
    email: String,
    password: String,
    first_name: Option<String>,
    last_name: Option<String>,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
struct DefaultResponse {
    message: String
}

struct RegisterMessage{
    message: String,
    success: bool,
}
async fn add_user_to_db(user: &User, client: &web::Data<Client>) -> RegisterMessage {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    //check if email is already in use and return error if it is
    match collection.find_one(doc! {"email": &user.email}, None).await {
        Ok(_) => return RegisterMessage { message: String::from("email in use"), success: false },
        Err(_) => ()
    };
    //check if id is already in use 
    match collection.find_one(doc! {"_id": &user._id}, None).await {
        Ok(_) => return RegisterMessage { message: String::from("id in use"), success: false },
        Err(_) => ()
    };
    match  collection.insert_one(&*user, None).await {
        Ok(_) => {
            return RegisterMessage { message: String::from("success"), success: true };
        },
        Err(e) => {
            println!("Error: {}", e);
            return RegisterMessage { message: String::from("error"), success: false };
        }
    };
}

#[post("/register")]
async fn register(register: web::Json<Register>,client: web::Data<Client>,) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let estimate = zxcvbn(&register.password, &[]).unwrap();
    if register.password.len() < 6 || estimate.score() < 3 {
        response.message = String::from("Password is too weak");
        return HttpResponse::BadRequest().json(response);
    }
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    //number of items in collection
    let count = collection.count_documents(None, None).await.unwrap();
    let admin = count == 0;
    //check if email has pattern of email using regex

    //register user

    if !utils::email_is_valid(&register.email) {
        response.message = String::from("Email is not valid");
        return HttpResponse::BadRequest().json(response);
    }
    let screen_name = match register.first_name.is_none() && register.last_name.is_none() {
        true => register.email.split("@").next().unwrap().to_string(),
        false => format!("{} {}", register.first_name.as_ref().unwrap(), register.last_name.as_ref().unwrap()),
    };
    let mut form_check_hash = HashMap::new();
    form_check_hash.insert(String::from("first_name"), &register.first_name);
    form_check_hash.insert(String::from("last_name"), &register.last_name);
    // form_check_hash.insert(String::from("email"), &Some(register.email.to_string()));
    // form_check_hash.insert(String::from("password"), &Some(register.password));
    let form_check_result: form_check::Message = form_check::form_check(&form_check_hash);
    let hashed = match password_hash::hash_password(&register.password) {
        Some(hashed) => hashed,
        None => {
            response.message = String::from("Could not hash password");
            return HttpResponse::BadRequest().json(response);
        }
    };
        
    let user = User {
        _id: ObjectId::new(),
        email: register.email.clone(),
        password: hashed,
        first_name: register.first_name.clone(),
        last_name: register.last_name.clone(),
        screen_name: screen_name.clone(),
        active: true,
        admin: admin,
        owner: admin,
    };
    //check if email is valid

    //add user to mongo db
    println!("User: {:?}", user);
    match add_user_to_db(&user, &client).await {
        RegisterMessage { message, success } => {
            if !success {
                response.message = message;
                return HttpResponse::BadRequest().json(response);
            }
        }
    };

    response.message = String::from("User registered");
    HttpResponse::Ok().json(response)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Qr{
    qr_token: String,
    qr_originator: String,
    user: String,
    time: i64,
}

//get user from token
async fn token_to_user(token: &str, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session = match  collection.find_one(doc! {"token": token}, None).await {
        Ok(session) => {
            match session {
                Some(session) => session,
                None => return None,
            }
        },
        Err(e) => {
            println!("Error: {:?}", e);
            return None;
        }
    };

    //check if session is expired
    
    //timeout after 15 years
    if utils::time_now() > session.time  {
        return None;
    }
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    match  collection.find_one(doc! {"_id": ObjectId::parse_str(session.user_id).unwrap()}, None).await {
        Ok(user) => {
            match user {
                Some(user) => {
                    return Some(user);
                },
                None => return None,
            }
        }
        Err(e) => {
            println!("Error: {:?}", e);
            return None;
        }
    };
}

#[derive(Debug, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
struct Alarm {
    _id: ObjectId,
    occurrence: String,
    time: String,
    weekdays: Vec<String>,
    date: String,
    label: String,
    devices: Vec<String>,
    snooze: Vec<i64>,
    tone: String,
    active: bool,
    user: String,
    modified: i64,
    fingerprint: String,
    close_task: bool,
}
#[derive(Debug, Serialize, Deserialize)]
struct AlarmMsg{
    #[serde(rename = "id")]
    _id: Option<String>,
    occurrence: String,
    time: String,
    weekdays: Vec<String>,
    date: String,
    label: String,
    devices: Vec<String>,
    snooze: Vec<i64>,
    tone: String,
    active: bool,
    modified: i64,
    fingerprint: String,
    #[serde(rename = "closeTask")]
    close_task: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AlarmResponse {
    alarms: Vec<Alarm>,
}

//get alarms by header
async fn get_alarms_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Vec<Alarm> {
    let session = match get_session_from_header(&req, &client).await {
        Some(session) => session,
        None => return vec![],
    };

    let user_id = session.user_id;
    get_alarms_by_user_id( &user_id, &client).await
}
//get alarms by user
async fn get_alarms_by_user_id(user: &str, client: &web::Data<Client>) -> Vec<Alarm> {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let alarms_fetched = collection.find(doc! {"user_id": user}, None).await;
    let alarms = match alarms_fetched {
        Ok(alarms_fetched) => alarms_fetched,
        Err(_) => return vec![],
    };
    alarms.try_collect().await.unwrap_or_else(|_| vec![])
}

//get token from header
fn get_token_from_header(req: &HttpRequest) -> Option<String> {
    let token = req.headers().get("token")?.to_str().ok()?;
    Some(token.to_string())
}

//get user from header and check if session is timed out
async fn get_user_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Option<User> {
    let token = match get_token_from_header(&req){
        Some(token) => token,
        None => return None,
    };

    match token_to_user(&token, &client).await {
        Some(user) => return Some(user),
        None => return None,
    };
}
//get user from session
async fn get_user_from_session(session: &Session, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    println!("{}", ObjectId::parse_str(&session.user_id).unwrap());

    match  collection.find_one(doc! {"_id": ObjectId::parse_str(&session.user_id).unwrap()}, None).await {
        Ok(user_fetch) => {
            match user_fetch {
                Some(user_fetch) => return Some(user_fetch),

                None => return None,
            }
        },
        Err(_) => return None,
    };
}

//get session by header

async fn get_session_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Option<Session> {
    let token = match get_token_from_header(&req) {
        Some(token) => token,
        None => return None,
    } ;
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session = match collection.find_one(doc! {"token": &token}, None).await {
        Ok(session) => {
            match session {
                Some(session) => session,
                None => return None,
            }
        },
        Err(_) => return None,
    };

    //current time
    
    //check if session is expired
    if utils::time_now() > session.time {
        //delete session
        collection.find_one_and_delete(doc! {"token": &token}, None).await.unwrap();
        return None;
    }
    Some(session)
}

async fn remove_session_from_header(req: &HttpRequest, client: &web::Data<Client>)-> bool {
    let token = match get_token_from_header(&req) {
        Some(token) => token,
        None => return false,
    };

    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    match collection.find_one_and_delete(doc! {"token": token}, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}
//find qr by qr_token
async fn find_qr_from_token(qr_token: &str, client: &web::Data<Client>) -> Option<Qr> {
    let collection: Collection<Qr> = client.database(DB_NAME).collection(QRCOLL);
    match  collection.find_one(doc! {"qr_token": qr_token}, None).await {
        Ok(qr) => return  qr,
        Err(_) => return None,
    };
}


#[post("/qr-login")]
async fn qr_login(qr: web::Json<Qr>,client: web::Data<Client>) -> impl Responder {
    let mut error_response = DefaultResponse {
        message: String::from(""),
    };
    //number of items in collection
    let qr = match find_qr_from_token(&qr.qr_token, &client).await {
        Some(qr) => qr,
        None => {
            error_response.message = String::from("QR not found");
            return HttpResponse::BadRequest().json(error_response);
        }
    };

    //verify password
    if qr.user != qr.user {
        error_response.message = String::from("Invalid QR");
        return HttpResponse::BadRequest().json(error_response);
    }
    //add 5 years to current time
    let timeout =  utils::time_now() + 157680000000;
    let response = LogInResponse {
        token: utils::new_token(64),
        email: qr.qr_originator.clone(),
        screen_name: Some(qr.qr_originator.clone()),
        first_name: None,
        last_name: None,
        admin: false,
        owner: false,
        time: timeout,
    };
    let session = Session{ _id: ObjectId::new(), user_id: qr.user.clone(), token: response.token.clone(), time: response.time };
    set_new_session(session, client).await;

    let login_response = LogInResponse {
        token: response.token,
        email: response.email,
        screen_name: response.screen_name,
        first_name: response.first_name,
        last_name: response.last_name,
        admin: response.admin,
        owner: response.owner,
        time: response.time,
    };
    println!("Login response: {:?}", login_response);
    HttpResponse::Ok().json(login_response)    
}



#[post("/logout")]
async fn logout(req:  HttpRequest, client: web::Data<Client>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };

    if !remove_session_from_header(&req, &client).await {
        response.message = String::from("Session not found");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Logged out");
    HttpResponse::Ok().json(response)
}

fn alarm_to_alarm_msg(alarm: Alarm) -> AlarmMsg {
    AlarmMsg {
        _id: Some(alarm._id.to_hex()),
        occurrence: alarm.occurrence,
        time: alarm.time,
        weekdays: alarm.weekdays,
        date: alarm.date,
        label: alarm.label,
        devices: alarm.devices,
        snooze: alarm.snooze,
        tone: alarm.tone,
        active: alarm.active,
        modified: alarm.modified,
        fingerprint: alarm.fingerprint,
        close_task: alarm.close_task,
    }
}

fn alarm_msg_to_alarm(alarm_msg: AlarmMsg, user_id: ObjectId) -> Alarm {
    let id = match alarm_msg._id {
        Some(id) => ObjectId::parse_str(&id).unwrap(),
        None => ObjectId::new(),
    };
    Alarm {
        _id: id,
        occurrence: alarm_msg.occurrence,
        time: alarm_msg.time,
        weekdays: alarm_msg.weekdays,
        date: alarm_msg.date,
        label: alarm_msg.label,
        devices: alarm_msg.devices,
        snooze: alarm_msg.snooze,
        tone: alarm_msg.tone,
        active: alarm_msg.active,
        modified: alarm_msg.modified,
        user: user_id.to_hex(),
        fingerprint: alarm_msg.fingerprint,
        close_task: alarm_msg.close_task,
    }
}


#[get("/api/alarms")]
async fn get_alarms(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    //get user from header
    println!("get alarms");
    match get_token_from_header(&req){
        Some(_) => (),
        None => return HttpResponse::BadRequest().json(DefaultResponse{message: String::from("Invalid token")})
    };

    let alarms =  get_alarms_from_header(&req, &client).await;
    
    //ws_client.lock().unwrap().try_send("/api/alarms", &token.unwrap()).await;
    //map alarms to AlarmMsg
    let mut alarm_msgs: Vec<AlarmMsg> = Vec::new();
    for alarm in alarms {
        let alarm_msg = alarm_to_alarm_msg(alarm);
        alarm_msgs.push(alarm_msg);
    };

    HttpResponse::Ok().json(alarm_msgs)
}

async fn add_alarm_to_db(alarm: &Alarm, client: &web::Data<Client>) ->bool{
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    match collection.insert_one(alarm.clone(), None).await {
        Ok(result) => {
            match result.inserted_id.as_object_id() {
                Some(id) => {
                    println!("Inserted id {}", id.to_hex());
                    return true;
                },
                None => {
                    println!("Could not get id");
                    return false;
                }
            }
        },
        Err(_) => return false,
    };
}

#[post("/api/alarm")]
async fn add_alarm(req: HttpRequest, client: web::Data<Client>, alarm_in: web::Json<AlarmMsg>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let token = match get_token_from_header(&req) {
        Some(token) => token,
        None => {
            response.message = String::from("Invalid token");
            return HttpResponse::BadRequest().json(response);
        }
    };

    let user = match get_user_from_header(&req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    };
    //AlarmMsg to Alarm
    let mut alarm = alarm_msg_to_alarm(alarm_in.into_inner(), user._id);

    alarm.devices = alarm.devices.into_iter().unique().collect();
    //get unique items from weekdays
    alarm.weekdays = utils::check_weekdays(&alarm.weekdays);//alarm.weekdays.into_iter().unique().collect();

    let result = add_alarm_to_db(&alarm, &client).await;
    if !result {
        response.message = String::from("Failed to add alarm");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Alarm added");
    ws_client.lock().unwrap().try_send("/api/alarm", &token).await;
    let alarm_msg = alarm_to_alarm_msg(alarm);
    HttpResponse::Ok().json(alarm_msg)
}


//edit alarm by id
async fn edit_alarm_from_id(alarm: &Alarm, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let alarm_id = alarm._id;
    let alarm = match collection.find_one(doc! {"_id": alarm_id}, None).await {
        Ok(alarm) => {
            match alarm {
                Some(alarm) => alarm,
                None => return false,
            }
        },
        Err(_) => return false,
    };
    //check if users are the same

    if alarm.user != alarm.user {
        return false;
    }
    match collection.find_one_and_replace(doc! {"_id": alarm_id}, alarm, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}


#[put("/api/alarm/{id}")]
async fn edit_alarm(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, alarm_edit: web::Json<AlarmMsg>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let token = match get_token_from_header(&req) {
        Some(token) => token,
        None => {
            response.message = String::from("Invalid token");
            return HttpResponse::BadRequest().json(response);
        }
    };

    let user  = match get_user_from_header(&req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    };
    let mut alarm = alarm_msg_to_alarm(alarm_edit.into_inner(), user._id);
    alarm.weekdays = utils::check_weekdays(&alarm.weekdays);
    alarm.devices = alarm.devices.into_iter().unique().collect();
    

    if !edit_alarm_from_id(&alarm, &client).await {
        response.message = String::from("Alarm not found");
        return HttpResponse::BadRequest().json(response);
    }

    response.message = String::from("Alarm updated");
    ws_client.lock().unwrap().try_send("/api/alarm", &token).await;
    HttpResponse::Ok().json(response)
}

async fn delete_alarm_by_id_and_user(alarm_id: &ObjectId, user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    match collection.find_one_and_delete(doc! {"_id": alarm_id, "user": user_id}, None).await {
        Ok(_) =>  return true,
        Err(_) => return false,
    };
}

#[delete("/api/alarm/{id}")]
async fn delete_alarm(req: HttpRequest,id: web::Path<String>, client: web::Data<Client>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>> ) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = match get_user_from_header(&req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    };

    match delete_alarm_by_id_and_user(&ObjectId::parse_str(&*id).unwrap(), &user._id, &client).await {
        false => {
            response.message = String::from("Alarm not found");
            return HttpResponse::BadRequest().json(response);
        },
        true => (),
    };
    response.message = String::from("Alarm deleted");
    ws_client.lock().unwrap().try_send("/api/alarm", &get_token_from_header(&req).unwrap()).await;
    HttpResponse::Ok().json(response)
}


async fn add_device_to_user(device: &Device, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let result = collection.insert_one(device, None).await.unwrap();
    match result.inserted_id.as_object_id() {
        Some(id) => {
            println!("Inserted id {}", id.to_hex());
            return true;
        },
        None => {
            println!("Could not get id");
            return false;
        }
    }
}


fn device_type(device_type: &str)->String{
    match device_type {
        "Browser" => String::from("Browser"),
        "Phone" => String::from("Phone"),
        "Tablet" => String::from("Tablet"),
        "Desktop" => String::from("Desktop"),
        "IoT" => String::from("IoT"),
        "Other" => String::from("Other"),
        _ => String::from("Other")
    }
}


#[derive(Debug, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
struct Device{
    _id: ObjectId,
    //user_device: String,
    device_name: String,
    user: String,
    device_type  : String
}
#[derive(Debug, Serialize, Deserialize)]
struct DeviceMsg{
    #[serde(rename = "id")]
    _id: Option<String>,
    #[serde(rename = "deviceName")]
    device_name: String,
    #[serde(rename = "type")]
    device_type: String
}
//get devices from db
async fn get_devices_by_user(user_id: &ObjectId, client: &web::Data<Client>) -> Vec<Device> {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let mut cursor = collection.find(doc! {"user": user_id.to_hex()}, None).await.unwrap();
    let mut devices: Vec<Device> = Vec::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(document) => {
                devices.push(document);
            },
            Err(_) => {
                println!("Error getting devices");
            }
        }
    }
    devices
}


#[get("/api/devices")]
async fn get_devices(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = match get_user_from_header(&req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    };
    let devices = get_devices_by_user(&user._id, &client).await;
    //map devices to DeviceMsg
    let devices_out: Vec<DeviceMsg> = devices.into_iter().map(|device| DeviceMsg {
        _id: Some(device._id.to_hex()),
        device_name: device.device_name,
        device_type: device_type(&device.device_type)
    }).collect();
    HttpResponse::Ok().json(devices_out)
}


#[post("/api/device")]
async fn add_device(req: HttpRequest, client: web::Data<Client>, device_add: web::Json<DeviceMsg>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = match  get_user_from_header(&req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    }; 

    let device = Device {
        _id: ObjectId::new(),
        //user_device: device.user_device.as_str().to_string(),
        device_name: device_add.device_name.as_str().to_string(),
        user: user._id.to_hex(),
        device_type: device_type(&device_add.device_type),
    };
    println!("Device {:?}", device);

    if !add_device_to_user(&device, &client).await {
        response.message = String::from("Could not add device");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Device added");
    ws_client.lock().unwrap().try_send("/api/device", &get_token_from_header(&req).unwrap()).await;
    //map device to DeviceMsg
    let device_out = DeviceMsg {
        _id: Some(device._id.to_hex()),
        device_name: device.device_name,
        device_type: device_type(&device.device_type)
    };
    HttpResponse::Ok().json(device_out)
}

async fn edit_device_from_struct(device: &Device, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    // match collection.find_one(doc! {"_id": &device._id, "user": &device.user}, None).await {
    //     Ok(result) => {
    //         match result {
    //             Some(_device) => (),
    //             None => return false,
    //         }
    //     },
    //     Err(_) => return false,
    // };

    match collection.replace_one(doc! {"_id": device._id,  "user": &device.user}, device, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

//get alarm tunes listing from  filesystem
#[get("/audio-resources/resource_list.json")]
async fn get_audio_resources(req: HttpRequest, client :   web::Data<Client>  ) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let allowed = [".flac", ".mp3", ".opus"];

    //check user is logged in
    match get_user_from_header(&req, &client).await {
        Some(_) => (),
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        }
    };
    //list files in directory exclude json file
    let mut files: Vec<String> = Vec::new();
    for entry in fs::read_dir("audio-resources").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        //get basename of file
        match path.file_name(){
            Some(basename) => {
                //check if file extension is allowed by checking if path ends in  one of the allowed extensions
                if allowed.iter().any(|ext| path.ends_with(ext)) {
                    //convert basename to string and split  at last "." and get first part using rsplit
                    let base_string = basename.to_str().unwrap().rsplit(".").next().unwrap().to_string();
                    if !files.contains(&base_string) {
                        files.push(base_string);
                    }
                } else {
                    continue;
                }
            },
            None => continue,
        };
    }
    HttpResponse::Ok().json(files)
}

#[get("/audio-resources/{filename}")]
async fn audio_file(req: HttpRequest, client :   web::Data<Client>) -> Result<NamedFile, actix_web::Error>{
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    match get_user_from_header(&req, &client).await {
        Some(_) => (),
        None => {
            response.message = String::from("User not found");
            let err: InternalError<String> = actix_web::error::InternalError::new(format!("{:?}", HttpResponse::BadRequest().json(response)), StatusCode::BAD_REQUEST);
            return Err(err.into());
        }
    };
    response.message = String::from("File not found");

    let err = actix_web::error::InternalError::new(format!("{:?}", HttpResponse::BadRequest().json(response)), StatusCode::BAD_REQUEST);

    let path = Path::new("audio-resources").join(req.match_info().query("filename"));
    //check if file ends with [flac, mp3 or opus]
    let allowed = [".flac", ".mp3", ".opus"];
    if !path.is_file() && !allowed.iter().any(|extension| path.ends_with(extension)) {
        return Err(err.into());
    }
    NamedFile::open_async(path).await.map_err(|_| err.into())
}

#[put("/api/device/{id}")]
async fn edit_device(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, device_msg: web::Json<DeviceMsg>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = match get_user_from_header(& req, &client).await {
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        },
    };
    //check if id is some
    let device_id = match ObjectId::parse_str(&*id) {
        Ok(device_id) => device_id,
        Err(_) => {
            response.message = String::from("Device not found");
            return HttpResponse::BadRequest().json(response);
        },
    };
    let device  = Device{
        _id: device_id,
        device_name: device_msg.device_name.as_str().to_string(),
        user: user._id.to_hex(),
        device_type: device_type(&device_msg.device_type),
    };
    //get device from json

    match edit_device_from_struct(&device, &client).await {
        true => (),
        false => {
            response.message = String::from("Device not found");
            return HttpResponse::BadRequest().json(response);
        },
    };

    response.message = String::from("Device updated");
    ws_client.lock().unwrap().try_send("/api/device", &get_token_from_header(&req).unwrap()).await;
    HttpResponse::Ok().json(response)
}

async fn delete_device_by_id_and_user(device_id: &ObjectId, user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let device_to_delete = match collection.find_one(doc! {"_id": device_id}, None).await {
        Ok(result) => result.unwrap(),
        Err(_) => return false,
    };

    if device_to_delete.user != user_id.to_hex() {
        return false;
    }
    match collection.find_one_and_delete(doc! {"_id": device_id, "user": user_id.to_hex()}, None).await{
        Ok(_) => return true,
        Err(_) => return false,
    };
}

#[delete("/api/device/{id}")]
async fn delete_device(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = match get_user_from_header(&req, &client).await{
        Some(user) => user,
        None => {
            response.message = String::from("User not found");
            return HttpResponse::BadRequest().json(response);
        },
    };

    if !delete_device_by_id_and_user(&ObjectId::parse_str(&*id).unwrap(), &user._id, &client).await {
        response.message = String::from("Device not found");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Device deleted");
    ws_client.lock().unwrap().try_send("/api/device", &get_token_from_header(&req).unwrap()).await;
    HttpResponse::Ok().json(response)
}


#[derive(Debug, Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
struct Admin{
    _id: ObjectId,
    token: String,
    user_id: String,
    time: i64,
}

struct AdminCheck{
    admin: Admin,
    user: User,
}
async fn get_admin_from_headers(req: &HttpRequest, client: &web::Data<Client>) -> Option<AdminCheck> {
    //get admin token from header
    let session = match get_session_from_header(&req, &client).await{
        Some(session) => session,
        None => return None,
    };

    let user  = match get_user_from_session(&session, &client).await {
        Some(user) => user,
        None => return None,
    };

    if !user.admin {
        return None;
    }
   // let user: Option<User> = get_user_from_session(&session, &client).await;

    let admin_token_headers = match req.headers().get("adminToken"){
        Some(token) => token,
        None => return None,
    };
  
    let admin_token = admin_token_headers.to_str().unwrap();
    let collection: Collection<Admin> = client.database(DB_NAME).collection(ADMINCOLL);
    let admin = match collection.find_one(doc! {"token": admin_token}, None).await{
        Ok(admin) => admin.unwrap(),
        Err(_) => return None,
    };

    //check if user id is the same
    if admin.user_id != user._id.to_hex() {
        return None;
    }
    let time = admin.time;
    let now = utils::time_now();
    if now >= time {
        collection.delete_one(doc! {"token": admin_token}, None).await.unwrap();
        return None;
    }
    Some(AdminCheck { admin: admin, user: user })
}


//delete alarms by user id
async fn delete_alarms_from_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    match collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}
//delete devices by user id
async fn delete_devices_by_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    match collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

//delete sessions by user id
async fn delete_sessions_by_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    match collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

//fetch user by id
async fn get_user_by_id(user_id: &ObjectId, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let result = collection.find_one(doc! {"_id": user_id}, None).await.unwrap();
    result
}

//delete user by id
async fn delete_user_from_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    match collection.find_one_and_delete(doc! {"_id": user_id}, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

//remove user 
async fn remove_user_by_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    //check if user is owner
    let user = match get_user_by_id(&user_id, &client).await {
        Some(user) => user,
        None => return false,
    };

    //check if user is owner
    if user.owner {
        return false;
    }
    //delete alarms
    let _alarm_delete = delete_alarms_from_user_id(&user._id, &client).await;
    //delete devices
    let _device_delete = delete_devices_by_user_id(&user._id, &client).await;
    //delete sessions
    let _session_delete = delete_sessions_by_user_id(&user._id, &client).await;
    let user_delete = delete_user_from_id(&user._id, &client).await;
    user_delete
}

//get list of users
async fn get_users(client: &web::Data<Client>) -> Vec<User> {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let mut cursor = collection.find(None, None).await.unwrap();
    let mut users: Vec<User> = Vec::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(user) => {
                users.push(user);
            }
            Err(e) => {
                println!("Error getting users: {}", e);
            }
        }
    }
    users
}

//set admin session
async fn set_admin_session(admin: &Admin, client: &web::Data<Client>) -> bool {
    let collection: Collection<Admin> = client.database(DB_NAME).collection(ADMINCOLL);
    let result = collection.insert_one(admin, None).await.unwrap();
    match result.inserted_id.as_object_id() {
        Some(id) => {
            println!("Inserted id {}", id.to_hex());
            return true;
        },
        None => {
            println!("Could not get id");
            return false;
        }
    }
}


#[get("/admin/users")]
async fn get_users_route(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    if let None = get_session_from_header(&req, &client).await {
        let response = DefaultResponse { message: "Unauthorized".to_string() };
        return HttpResponse::BadRequest().json(response);
    }
    // do the same to get_admin_from_headers as above
    if let None = get_admin_from_headers(&req, &client).await {
        let response = DefaultResponse { message: "Unauthorized".to_string() };
        return HttpResponse::BadRequest().json(response);
    }
    
    let users = get_users(&client).await;
    HttpResponse::Ok().json(users)
}

#[delete("/admin/user/{user_id_str}")]
async fn delete_user(req: HttpRequest, user_id_str: web::Path<String>, client: web::Data<Client>) -> impl Responder {
    let user_id = match ObjectId::parse_str(&*user_id_str) {
        Ok(id) => id,
        Err(_) => {
            let response = DefaultResponse { message: "Invalid user ID".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };

    if let None = get_session_from_header(&req, &client).await {
        let response = DefaultResponse { message: "Unauthorized".to_string() };
        return HttpResponse::BadRequest().json(response);
    }

    if let None = get_admin_from_headers(&req, &client).await {
        let response = DefaultResponse { message: "Unauthorized".to_string() };
        return HttpResponse::BadRequest().json(response);
    }

    if !remove_user_by_id(&user_id, &client).await {
        let response = DefaultResponse { message: "Error deleting user".to_string() };
        return HttpResponse::BadRequest().json(response);
    }

    HttpResponse::Ok().json(DefaultResponse { message: "User deleted".to_string() })
}

async fn edit_user_from_id(user_id: &ObjectId, user: &User, client: &web::Data<Client>) -> bool {
    if user.owner {
        return false;
    }
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    match collection.find_one_and_replace(doc! {"_id": user_id}, user, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

#[put("/admin/user/{user_id_str}")]
async fn edit_user(req: HttpRequest, user_id_str: web::Path<String>, user: web::Json<User>, client: web::Data<Client>) -> impl Responder {
    let user_id = match ObjectId::parse_str(user_id_str.as_str()) {
        Ok(user_id) => user_id,
        Err(_) => {
            let response = DefaultResponse { message: "Invalid user ID".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    
    let _admin_check = match get_admin_from_headers(&req, &client).await {
        Some(admin) => admin,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    
    if !edit_user_from_id(&user_id, &user, &client).await {
        let response = DefaultResponse { message: "Error editing user".to_string() };
        return HttpResponse::BadRequest().json(response);
    }
    
    let response = DefaultResponse {  message: "User edited".to_string()};
    HttpResponse::Ok().json(response)
}

#[derive(Deserialize)]
struct AdminPassword {
    password: String,
}
#[post("/api/admin")]
async fn admin_login_route(req: HttpRequest, admin_password: web::Json<AdminPassword>,client: web::Data<Client>) -> impl Responder {
    let session = match get_session_from_header(&req, &client).await {
        Some(session) => session,
        None => {
            return HttpResponse::BadRequest()
                .json(DefaultResponse { message: "Unauthorized".to_string() });
        }
    };
    let user = match get_user_from_session(&session, &client).await {
        Some(user) => user,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    
    if !user.owner {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    match  password_hash::verify_password(&admin_password.password, &user.password){
        true => (),
        false => {
            let response = DefaultResponse {  message: "Unauthorized".to_string()};
            return HttpResponse::BadRequest().json(response);
        }
    };
 
    //add 10 minutes to time
    let expires = utils::time_now() + 600000;
    let admin = Admin { _id: ObjectId::new(), token: utils::new_token(96), user_id: user._id.to_hex(), time: expires };
    match set_admin_session(&admin, &client).await{
        true => (),
        false => {
            let response = DefaultResponse {  message: "Error setting admin session".to_string()};
            return HttpResponse::BadRequest().json(response);
        }
    };

    HttpResponse::Ok().json(admin)
}


//#[get("/api/is-session-valid")]
async fn is_session_valid(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    match get_session_from_header(&req, &client).await {
        Some(_) => {
            let response = DefaultResponse { message: "Session valid".to_string() };
            return HttpResponse::Ok().json(response);
        },
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct UserOut{
    email: String,
    first_name: String,
    last_name: String,
    screen_name: String,
    admin: bool,
    owner: bool,
}
//get user
#[get("/api/user")]
async fn get_user(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    let session = match get_session_from_header(&req, &client).await {
        Some(session) => session,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    let user = match get_user_from_session(&session, &client).await {
        Some(user_fetch) => user_fetch,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    let user_out = UserOut { email: user.email, first_name: user.first_name.unwrap_or("".to_string()), last_name: user.last_name.unwrap_or("".to_string()), screen_name: user.screen_name, admin: user.admin, owner: user.owner };
    HttpResponse::Ok().json(user_out)
}

//expand User struct
#[derive(Serialize, Deserialize, Debug, Clone)]
//camel case for json
#[serde(rename_all = "camelCase")]
pub struct UserEdit {
    //rename _id to id serde
    #[serde(rename(serialize = "id", deserialize = "_id"))]
    pub _id: Option<ObjectId>,
    pub email: String,
    pub change_password: Option<String>,
    pub confirm_password: String,
    pub first_name: String,
    pub last_name: String,
    pub screen_name: String,
}

//update user info db
async fn update_user_info(user: &User, client: &web::Data<Client>) -> bool {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    match collection.find_one_and_replace(doc! {"_id": user._id.clone()}, user, None).await {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

//edit user
#[put("/api/editUser/{email}")]
async fn edit_user_info(req: HttpRequest, email: web::Path<String>, user_edit: web::Json<UserEdit>, client: web::Data<Client>, ws_client: web::Data<Mutex<ws_client::WsClientConnect>>) -> impl Responder {
    let session = match get_session_from_header(&req, &client).await {
        Some(session) => session,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    let user = match get_user_from_session(&session, &client).await {
        Some(user_fetch) => user_fetch,
        None => {
            let response = DefaultResponse { message: "Unauthorized".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    };
    if user.email != email.to_string() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    if user.email != email.to_string()  && user_edit.email != email.to_string() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    //verify password

    if !password_hash::verify_password(&user_edit.confirm_password, &user.password) {
        let response = DefaultResponse { message: "Unauthorized".to_string() };
        return HttpResponse::BadRequest().json(response);
    }
    let mut password_hash = user.password;

    if let Some(new_password) = &user_edit.change_password {
        // Check if password is valid
        let estimate = zxcvbn(new_password, &[]).unwrap();
    
        if estimate.score() < 3 || new_password.len() < 6 {
            let response = DefaultResponse { message: "Password too weak".to_string() };
            return HttpResponse::BadRequest().json(response);
        }
    
        // Hash password
        match password_hash::hash_password(new_password) {
            Some(hashed_password) => password_hash = hashed_password,
            None => {
                let response = DefaultResponse { message: "Error hashing password".to_string() };
                return HttpResponse::BadRequest().json(response);
            }
        }
    }
    
    let new_user = User { _id: user._id, email: user_edit.clone().email, password: password_hash, first_name: Some(user_edit.clone().first_name), last_name: Some(user_edit.clone().last_name), screen_name: user_edit.clone().screen_name, owner: user.owner, active: user.active, admin: user.admin };
    match update_user_info(&new_user, &client).await{
        true => (),
        false => {
            let response = DefaultResponse {  message: "Error updating user".to_string()};
            return HttpResponse::BadRequest().json(response);
        }
    };

    let response = DefaultResponse {  message: "User edited".to_string()};
    ws_client.lock().unwrap().try_send("/api/editUser", &get_token_from_header(&req).unwrap()).await;
    HttpResponse::Ok().json(response)
}


struct WsMessageHandler {
    key_token : HashMap<String, String>,
    token_user: HashMap<String,  String>,
    key_session: HashMap<String, WsSession>,
}
impl WsMessageHandler {

    fn new() -> WsMessageHandler {
        WsMessageHandler {
            key_token: HashMap::new(),
            token_user: HashMap::new(),
            key_session: HashMap::new(),
        }
    }
    //remove stream
    fn remove_stream_by_key(&mut self, key: &String) {
        self.key_session.remove(key);
        //pop token
        
        let token = match self.key_token.remove(key){
            Some(token) => token,
            None => return,
        };
        let _user = match self.token_user.remove(&token) {
            Some(user) => user,
            None => return,
        };
    }
    fn add_session(&mut self, key: &String, session: &WsSession, user: &String, token: &String) {
        self.key_session.insert(key.clone(), session.clone());
        self.key_token.insert(key.clone(), token.clone());
        self.token_user.insert(token.clone(), user.clone());
    }
    fn get_user_keys_exclude_token(&self,  token: &str) -> Vec<String> {
        let mut keys = Vec::new();
        //get user's tokens
        let user_id = match self.token_user.get(token) {
            Some(user_id) => user_id,
            None => return keys,
        };
            
        //get all user tokens except current token by iterating through token_user

        let mut user_tokens = Vec::new();
        for (key, value) in &self.token_user {
            if value == user_id {
                user_tokens.push(key.clone());
            }
        }

        for (key, value) in &self.key_token {
            if value == token {
                continue;
            }
            //check if the value is in user_tokens
            if user_tokens.contains(value) {
                keys.push(key.clone());
            }
        }
        keys
    }

}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct WsMsg{
    mode: Option<String>,
    token: Option<String>,
    url: Option<String>,
}

//send message to all other sessions

async fn action_ws(req: HttpRequest, body: web::Payload, client: web::Data<Client>, ws_handler : web::Data<Mutex<WsMessageHandler>> ) -> Result<HttpResponse, actix_web::Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;
    println!("New websocket connection: {}", req.peer_addr().unwrap());
    println!("New websocket connection: {}", req.connection_info().host());
    let headers = req.headers();
    // //print headers
    // for (key, value) in headers.iter() {
    //     println!("{}: {:?}", key, value);
    // }
    let ws_key = headers.get("sec-websocket-key").unwrap().to_str().unwrap().to_string();
    //key_secret.insert(ws_key, "test");

    //print key secret pairs 
    //let mut token = String::new();
    //get token from key
    // let token = match ws_handler.lock().unwrap().key_token.get(&ws_key) {
    //     Some(token) => token.clone(),
    //     None => {
    //         println!("No token found for key: {}", ws_key)
    //         return Ok(response);
    //     }
    // };
    println!("ws key: {}", ws_key);
    actix_rt::spawn(async move {
        //deserialize message check errror
        fn deserialize_msg(msg: &str) -> Result<WsMsg, serde_json::Error> {
            let msg: WsMsg = serde_json::from_str(msg)?;
            Ok(msg)
        }

        async fn process_ws_action(msg_ws: &str) -> WsMsg{
            let msg = match deserialize_msg(&msg_ws) {
                Ok(msg) => msg,
                Err(e) => {
                    println!("Error deserializing message: {}", e);
                    return WsMsg{mode: None, token: None, url: None};
                }
                
            };
            println!("Message: {:?}", msg);
            msg
        }

        println!("Starting to listen for messages {}", ws_key);
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                Message::Ping(bytes) => {
                    if session.pong(&bytes).await.is_err() {
                        return;
                    }
                }
                Message::Text(s) => {
                    let m = process_ws_action(s.to_string().as_str()).await;
                    if let Some(mode) = &m.mode {
                        match mode.as_str() {
                            "client" => {
                                // let token = match ws_handler.lock().unwrap().key_token.get(&ws_key) {
                                //     Some(token) => token.clone(),
                                //     None => {
                                //         println!("No token found for key: {}", ws_key)
                                //         return Ok(response);
                                //     }
                                // };
                                if let Some(token) = &m.token {
                                    if token.len() > 3 {
                                        let user = match token_to_user(&token, &client).await{
                                            Some(user) => user,
                                            None => {
                                                println!("No user found");
                                                return;
                                            }
                                        };
 
                                        ws_handler.lock().unwrap().add_session(&ws_key, &session, &user.email, &token);
                                        session.text("connection").await.unwrap();
                                    }
                                }
                            },
                            "api" => {
                                if let Some(_url) = &m.url {
                                    let token = m.token.unwrap();
                                    let ws_handler = ws_handler.lock().unwrap();
                                    let key_session = &ws_handler.key_session;
                                    //let key_session = ws_handler.lock().unwrap().key_session.clone();
                                    for key in ws_handler.get_user_keys_exclude_token(&token) {
                                        if let Some(session) = key_session.get(&key) {
                                            let mut session_send = session.clone();
                                            session_send.text("connection").await.unwrap();
                                        }
                                    }
                                }
                            },
                            _ => (),
                        }
                    } else {
                        println!("No mode");
                    }
                    
                },
                _ => break,
            }
        }
        let closing = session.close(None).await;
        match closing {
            Ok(_) => { 
                        println!("Closed websocket connection: {}", ws_key);
                        ws_handler.lock().unwrap().remove_stream_by_key(&ws_key);
                    },
            Err(e) => println!("Error closing websocket connection: {}", e),
        }
    });

    Ok(response)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct CheckReport{
    r#type: Option<String>,
    content: Option<String>,
    original: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FormMsg{
    query: Option<String>,
    first_name: Option<String>,
    last_name: Option<String>,
    email: Option<String>,
    password: Option<String>,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
struct ZxcvbnMsg{
    query: Option<String>,
    password: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
enum WsRegisterMsgIn{
    FormMsg(FormMsg),
    ZxcvbnMsg(ZxcvbnMsg),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct RegisterCheckPass{
    guesses: f64,
    score: u8,
    server_minimum: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct FormMsgOut{
    query: String,
    content: bool,
    messages: Option<Vec<String>>,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct ZxcvbnMsgOut{
    query: String,
    content: RegisterCheckPass
}
async fn register_ws(req: HttpRequest, body: web::Payload ) -> Result<HttpResponse, actix_web::Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;
   
    actix_rt::spawn(async move {
        //deserialize message check error

        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                Message::Ping(bytes) => {
                    if session.pong(&bytes).await.is_err() {
                        return;
                    }
                }
                Message::Text(s) => {
                    let msg = match serde_json::from_str::<FormMsg>(&s){
                        Ok(msg) => msg,
                        Err(e) => {
                            println!("Error deserializing message: {}", e);
                            return;
                        }
                    };
                    
                    //check msg_de enum
                    //match msg enum from WsRegisterMsg
                    match msg.query.as_ref().unwrap().as_str(){
                        "form" => {
                            let mut form_check_hash = HashMap::new();
                            form_check_hash.insert(String::from("first_name"), &msg.first_name);
                            form_check_hash.insert(String::from("last_name"), &msg.last_name);
                            form_check_hash.insert(String::from("email"), &msg.email);
                            form_check_hash.insert(String::from("password"), &msg.password);
                            let form_check_result: form_check::Message = form_check::form_check(&form_check_hash);
                            let msg_out = FormMsgOut{
                                query: "form".to_string(),
                                content: form_check_result.pass,
                                messages: Some(form_check_result.messages),
                            };
                            session.text(serde_json::to_string(&msg_out).unwrap()).await.unwrap();
                        },
                        "zxcvbn" => {
                            let stopper = if msg.password.as_ref().unwrap().len() > 35 { 35 } else { msg.password.as_ref().unwrap().len() };
                            let password_slice = &msg.password.as_ref().unwrap()[..stopper];
                            let entropy: zxcvbn::Entropy = zxcvbn::zxcvbn(&password_slice, &[]).unwrap();
                            let guesses = entropy.guesses_log10();
                            let score = entropy.score();
                            let msg_out = ZxcvbnMsgOut{
                                query: msg.query.unwrap(),
                                content: RegisterCheckPass{
                                    guesses: guesses,
                                    score: score,
                                    server_minimum: 0.0,
                                }
                            };
                            session.text(serde_json::to_string(&msg_out).unwrap()).await.unwrap();
                        },
                        _ => (),
                    }; 
                },
                _ => break,
            }
        }
        let closing = session.close(None).await;
        match closing {
            Ok(_) => { 
                        println!("Closed websocket connection");
                    },
            Err(e) => println!("Error closing websocket connection: {}", e),
        }
    });

    Ok(response)
}


//remove item if not in the  Weekdays



/// Creates an index on the "username" field to force the values to be unique.
async fn create_username_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model = IndexModel::builder()
        .keys(doc! { "email": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<User>(USERCOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}

///creates an index on the "token" field to force the values to be unique.
async fn create_session_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model = IndexModel::builder()
        .keys(doc! { "token": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<Session>(SESSIONCOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}
async fn create_qr_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model = IndexModel::builder()
        .keys(doc! { "qr_token": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<Qr>(QRCOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}

async fn create_alarm_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model = IndexModel::builder()
        .keys(doc! { "user_id": 1, "_id": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<Alarm>(ALARMCOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}

async fn create_device_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model = IndexModel::builder()
        .keys(doc! { "user": 1, "_id": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<Device>(DEVICECOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}

async fn create_admin_index(client: &Client) {
    let options = IndexOptions::builder().unique(true).build();
    let model: IndexModel = IndexModel::builder()
        .keys(doc! { "token": 1 })
        .options(options)
        .build();
    client
        .database(DB_NAME)
        .collection::<Admin>(ADMINCOLL)
        .create_index(model, None)
        .await
        .expect("creating an index should succeed");
}



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let client = Client::with_uri_str(MONGODB_URI).await.expect("failed to connect");
    //create hash map key as string and value as string
    //let mut message_handler =WsMessageHandler::new();
    //let message_handler_mutex = Mutex::new(message_handler);
    create_username_index(&client).await;
    create_session_index(&client).await;
    create_qr_index(&client).await;
    create_alarm_index(&client).await;
    create_device_index(&client).await;
    create_admin_index(&client).await;
    let ws_action_uri = format!("ws://localhost:{}/action", PORT);
    //let cors_uri = format!("http://localhost:{}", PORT);
  
    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .service(login)
            .service(register)
            .service(get_user)
            .service(get_alarms)
            .service(edit_alarm)
            .service(edit_device)
            .service(edit_user)
            .service(edit_user_info)
            .service(qr_login)
            .service(logout)
            .service(admin_login_route)
            .service(add_device)
            .service(add_alarm)
            .service(delete_alarm)
            .service(delete_device)
            .service(delete_user)
            .service(get_devices)
            .service(get_audio_resources)
            .service(audio_file)
            .app_data(web::Data::new(client.clone()))
            .app_data(web::Data::new(Mutex::new(WsMessageHandler::new())))
            .app_data(web::Data::new( Mutex::new(ws_client::WsClientConnect::new(&ws_action_uri))))
            .route("/action", web::get().to(action_ws))
            .route("/register-check", web::get().to(register_ws))
            .route("/api/is-session-valid", web::get().to(is_session_valid))
            //.route("/{filename:.*}", web::get().to(audio_file))
            //.route("/logout", web::post().to(logout))
    })
    .workers(4)
    .bind(("127.0.0.1", PORT))?
    .run()
    .await
}
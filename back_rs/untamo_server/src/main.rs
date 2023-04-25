use actix_web::dev::ServiceRequest;
use actix_web::http::Error;
use actix_web::http::header::Header;
use actix_web::web::Payload;
use actix_web::{get, post, put, delete, web, App, HttpResponse, HttpServer, Responder, HttpMessage, HttpRequest, FromRequest};
use futures::{StreamExt, TryStreamExt};
use mongodb::bson::oid::ObjectId;
use radix_fmt::{radix_36, radix};
use regex::Regex;
use serde::{Deserialize, Serialize};
use mongodb::{bson::doc, options::IndexOptions, Client, Collection, IndexModel};
// import models/user.rs
//mod models;

//use models::user::{User};
//use models::random_string;
use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;
use rand::rngs::OsRng;
use std::borrow::BorrowMut;
use std::collections::HashMap;
use std::option::{Option};
use std::time::{SystemTime, UNIX_EPOCH};
use argon2::{PasswordVerifier,Argon2, password_hash::SaltString, PasswordHasher, PasswordHash};
use itertools::Itertools;
use std::sync::Mutex;
use actix_web_actors::ws;
use actix::{Actor, StreamHandler};
use actix_ws::{self, Message, MessageStream, Session as WsSession};


extern crate zxcvbn;

use zxcvbn::zxcvbn;

const MONGODB_URI: &str = "mongodb://root:example@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.5.4";
const DB_NAME: &str = "Untamo";
const USERCOLL: &str = "users";
const SESSIONCOLL: &str = "sessions";
const QRCOLL : &str = "qr";
const ALARMCOLL : &str = "alarms";
const DEVICECOLL : &str = "devices";
const ADMINCOLL : &str = "admins";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SessionNotValid {
    message: String,
}

pub fn random_string(n: usize ) -> String {
    let mut rng = thread_rng();
    let chars: String = (0..n).map(|_| rng.sample(Alphanumeric) as char).collect();
    chars
}

//randomly capitalize each letter in the string
fn random_capital(s: &str) -> String {
    let mut rng = thread_rng();
    let mut chars: Vec<char> = s.chars().collect();
    for i in 0..chars.len() {
        if rng.gen_bool(0.5) {
            chars[i] = chars[i].to_ascii_uppercase();
        }
    }
    chars.into_iter().collect()
}


pub fn new_token(n:usize) -> String {
    let stamp = random_capital(format!("{}", radix(time_now(), 36)).as_str());
    random_string(n)+ stamp.as_str()
}

fn verify_password(password: &str, hash: &str)-> bool{
    let argon2 = Argon2::default();
    let password_hash = PasswordHash::new(&hash).unwrap();
    argon2.verify_password(password.as_bytes(), &password_hash).is_ok()
}
fn hash_password(password: &str)-> String{
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt);
    match password_hash {
        Ok(hash) => {
            //hash to string
            hash.to_string()
        },
        Err(e) => {
            println!("Error: {}", e);
            String::from("")
        }
    }
}

fn time_now() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
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


pub fn email_is_valid(email: String) -> bool {
    let re = Regex::new(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$").unwrap();
    re.is_match(&email)
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
        let time =time_now();
        let token = new_token(64);
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
//#[serde(rename_all = "camelCase")]
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
    let user = collection.find_one(doc! {"email": email.clone()}, None).await.unwrap();
    if user.is_none() {
        return None;
    }
    //verify password
    let user = user.unwrap();
    Some(user)
}

async fn set_new_session(session: Session, client: web::Data<Client>)-> bool {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let result = collection.insert_one(session.clone(), None).await.unwrap();
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

#[post("/login")]
async fn login(login: web::Json<LogIn>,client: web::Data<Client>) -> impl Responder {
    //number of items in collection
    let user_fetch = get_user_from_email(&login.email, &client).await;

    if user_fetch.is_none() {
        return HttpResponse::BadRequest().json("User not found");
    }
    //verify password
    let user = user_fetch.unwrap();
    
    if !verify_password(&login.password, &user.password) {
        return HttpResponse::BadRequest().json("Invalid password");
    }
    println!("User: {:?}", user);
    //let session = Session::new(user.id.clone());
  
    let response = LogInResponse {
        token: new_token(64),
        email: user.email.clone(),
        screen_name: Some(user.screen_name.clone()),
        first_name: user.first_name.clone(),
        last_name: user.last_name.clone(),
        admin: user.admin,
        owner: user.owner,
        //add 5 years to time
        time: time_now() + 157680000000,
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

async fn add_user_to_db(user: &User, client: &web::Data<Client>) -> bool {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
  
    let result = collection.insert_one(user, None).await.unwrap();
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

    if !email_is_valid(register.email.clone()) {
        response.message = String::from("Email is not valid");
        return HttpResponse::BadRequest().json(response);
    }
    let mut screen_name = String::from("");
    if register.first_name.is_none() && register.last_name.is_none() {
        screen_name = register.email.split("@").next().unwrap().to_string();
    } else {
        screen_name = format!("{} {}", register.first_name.clone().unwrap(), register.last_name.clone().unwrap());
    }

    let user = User {
        _id: ObjectId::new(),
        email: register.email.clone(),
        password: hash_password(&register.password),
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
    let result = add_user_to_db(&user, &client).await;
    if !result {
        response.message = String::from("Could not register user");
        return HttpResponse::BadRequest().json(response);
    }
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
    let session = collection.find_one(doc! {"token": token}, None).await.unwrap();
    if session.is_none() {
        return None;
    }
    let session = session.unwrap();
    //check if session is expired
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
    //timeout after 15 years
    if now - session.time > 473040000000 {
        return None;
    }
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let user = collection.find_one(doc! {"_id": ObjectId::parse_str(session.user_id).unwrap()}, None).await.unwrap();
    if user.is_none() {
        return None;
    }
    let user = user.unwrap();
    Some(user)
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
    snooze: Vec<String>,
    tone: String,
    active: bool,
    user: String,
    modified: i64,
    fingerprint: String,
    close_task: bool,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AlarmResponse {
    alarms: Vec<Alarm>,
}

//get alarms by header
async fn get_alarms_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Vec<Alarm> {
    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        return vec![];
    }
    let user_id = session.unwrap().user_id;
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
    let token = get_token_from_header(&req);
    if token.is_none() {
        return None;
    }
    let token = token.unwrap();
    let user = token_to_user(&token, &client).await;
    if user.is_none() {
        return None;
    }
    let user = user.unwrap();
    //check if session is timed out
    Some(user)
}
//get user from session
async fn get_user_from_session(session: &Session, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    println!("{}", ObjectId::parse_str(&session.user_id).unwrap());

    let user_fetch = collection.find_one(doc! {"id": ObjectId::parse_str(&session.user_id).unwrap()}, None).await.unwrap();
    if user_fetch.is_none() {
        return None;
    }
    let user = user_fetch.unwrap();
    Some(user)
}

//get session by header

async fn get_session_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Option<Session> {
    let token = get_token_from_header(&req); 
    if token.is_none() {
        return None;
    }
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session = collection.find_one(doc! {"token": token.clone().unwrap()}, None).await.unwrap();
    if session.is_none() {
        return None;
    }
    //current time
    
    //check if session is expired
    if time_now() > session.clone().unwrap().time {
        //delete session
        collection.find_one_and_delete(doc! {"token": &token.unwrap()}, None).await.unwrap();
        return None;
    }
    session
}

async fn remove_session_from_header(req: &HttpRequest, client: &web::Data<Client>)-> bool {
    let token = get_token_from_header(&req);
    if token.is_none() {
        return false;
    }
    let token = token.unwrap();
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let result = collection.find_one_and_delete(doc! {"token": token}, None).await.unwrap();
    return result.is_some();
}
//find qr by qr_token
async fn find_qr_from_token(qr_token: &str, client: &web::Data<Client>) -> Option<Qr> {
    let collection: Collection<Qr> = client.database(DB_NAME).collection(QRCOLL);
    let qr = collection.find_one(doc! {"qr_token": qr_token}, None).await.unwrap();
    if qr.is_none() {
        return None;
    }
    let qr = qr.unwrap();
    Some(qr)
}


#[post("/qr-login")]
async fn qr_login(qr: web::Json<Qr>,client: web::Data<Client>) -> impl Responder {
    let mut error_response = DefaultResponse {
        message: String::from(""),
    };
    //number of items in collection
    let qr = find_qr_from_token(&qr.qr_token, &client).await;
    if qr.is_none() {
        error_response.message = String::from("QR not found");
        return HttpResponse::BadRequest().json(error_response);
    }
    //verify password
    let qr = qr.unwrap();
    if qr.user != qr.user {
        error_response.message = String::from("Invalid QR");
        return HttpResponse::BadRequest().json(error_response);
    }
    //add 5 years to current time
    let timeout =  (SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64) + 157680000000;
    let response = LogInResponse {
        token: new_token(64),
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

    let result = remove_session_from_header(&req, &client).await;
    if !result {
        response.message = String::from("Session not found");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Logged out");
    HttpResponse::Ok().json(response)
}

#[get("/api/alarms")]
async fn get_alarms(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    //get user from header
    println!("get alarms");
    let alarms =  get_alarms_from_header(&req, &client).await;
    HttpResponse::Ok().json(alarms)
}

async fn add_alarm_to_db(alarm: &Alarm, client: &web::Data<Client>) ->bool{
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let result = collection.insert_one(alarm.clone(), None).await.unwrap();
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

#[post("/api/alarm")]
async fn add_alarm(req: HttpRequest, client: web::Data<Client>, alarm_in: web::Json<Alarm>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user_fetch = get_user_from_header(&req, &client).await;
    if user_fetch.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_fetch.unwrap();
    let mut alarm = alarm_in.into_inner();
    alarm._id = ObjectId::new();
    alarm.user = user._id.to_hex().clone();
    alarm.devices = alarm.devices.into_iter().unique().collect();
    //get unique items from weekdays
    alarm.weekdays = alarm.weekdays.into_iter().unique().collect();
    let result = add_alarm_to_db(&alarm, &client).await;
    if !result {
        response.message = String::from("Failed to add alarm");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Alarm added");
    HttpResponse::Ok().json(alarm)
}


//edit alarm by id
async fn edit_alarm_from_id(alarm: &Alarm, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let alarm_id = alarm._id;
    let alarm_fetch = collection.find_one(doc! {"_id": alarm_id}, None).await.unwrap();
    //check if users are the same
    if alarm_fetch.is_none() {
        return false;
    }
    if alarm_fetch.unwrap().user != alarm.user {
        return false;
    }
    let result = collection.find_one_and_replace(doc! {"_id": alarm_id}, alarm, None).await.unwrap();
    result.is_some()
}


#[put("/api/alarm/{id}")]
async fn edit_alarm(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, alarm_edit: web::Json<Alarm>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user_fetch = get_user_from_header(&req, &client).await;
    if user_fetch.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_fetch.unwrap();
    let alarm = Alarm {
        _id: ObjectId::parse_str(id.clone()).unwrap(),
        occurrence: alarm_edit.occurrence.clone(),
        time: alarm_edit.time.clone(),
        weekdays: alarm_edit.weekdays.clone().into_iter().unique().collect(),
        date: alarm_edit.date.clone(),
        label: alarm_edit.label.clone(),
        devices: alarm_edit.devices.clone().into_iter().unique().collect(),
        snooze: alarm_edit.snooze.clone(),
        tone: alarm_edit.tone.clone(),
        active: alarm_edit.active.clone(),
        user: user.clone()._id.to_hex(),
        modified: time_now(),
        fingerprint: alarm_edit.fingerprint.clone(),
        close_task: alarm_edit.close_task.clone(),
    };
    let result = edit_alarm_from_id(&alarm, &client).await;

    if !result {
        response.message = String::from("Alarm not found");
        return HttpResponse::BadRequest().json(response);
    }

    response.message = String::from("Alarm updated");
    HttpResponse::Ok().json(response)
}

async fn delete_alarm_by_id_and_user(alarm_id: &ObjectId, user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let result = collection.find_one_and_delete(doc! {"_id": alarm_id, "user_id": user_id}, None).await.unwrap();
    result.is_some()
}

#[delete("/api/alarm/{id}")]
async fn delete_alarm(req: HttpRequest,id: web::Path<String>, client: web::Data<Client> ) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user_resp = get_user_from_header(&req, &client).await;
    if user_resp.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_resp.unwrap();
    delete_alarm_by_id_and_user(&ObjectId::parse_str(id.clone()).unwrap(), &user._id, &client).await;
    response.message = String::from("Alarm deleted");
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


fn device_type(device_type: String)->String{
    match device_type.as_str() {
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
#[serde(rename(serialize = "type", deserialize = "device_type"))]
struct Device{
    _id: ObjectId,
    user_device: String,
    device_name: String,
    user: String,
    device_type  : String
}
#[post("/api/device")]
async fn add_device(req: HttpRequest, client: web::Data<Client>, device: web::Json<Device>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = get_user_from_header(&req, &client).await;
    if user.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user.unwrap();
    let device = Device {
        _id: ObjectId::new(),
        user_device: device.user_device.clone(),
        device_name: device.device_name.clone(),
        user: user._id.to_hex(),
        device_type: device_type(device.device_type.clone()),
    };
    let result = add_device_to_user(&device, &client).await;
    if !result {
        response.message = String::from("Could not add device");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Device added");
    HttpResponse::Ok().json(device)
}

async fn edit_device_from_id(device_id: &ObjectId, device: &Device, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let device_in_db = collection.find_one(doc! {"_id": device_id}, None).await.unwrap();
    if device_in_db.is_none() {
        return false;
    }
    if device_in_db.unwrap().user != device.user {
        return false;
    }
    collection.replace_one(doc! {"_id": device_id}, device, None).await.unwrap();
    true
}


#[put("/api/device/{id}")]
async fn edit_device(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, device: web::Json<Device>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user_fetch = get_user_from_header(&req, &client).await;
    if user_fetch.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_fetch.unwrap();
    if device.user != user._id.to_hex() {
        response.message = String::from("Device was not owned by user");
        return HttpResponse::BadRequest().json(response);
    }
    //get device from json
    let device = Device {
        _id: ObjectId::parse_str(id.clone()).unwrap(),
        user_device: device.user_device.clone(),
        device_name: device.device_name.clone(),
        user: user._id.to_hex(),
        device_type: device_type(device.device_type.clone()),
    };
    let resp = edit_device_from_id(&ObjectId::parse_str(id.clone()).unwrap(), &device, &client).await;
    if !resp {
        response.message = String::from("Device not found");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Device updated");
    HttpResponse::Ok().json(response)
}

async fn delete_device_by_id_and_user(device_id: &ObjectId, user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let device_to_delete = collection.find_one(doc! {"_id": device_id}, None).await.unwrap();
    if device_to_delete.is_none() {
        return false;
    }
    if device_to_delete.unwrap().user != user_id.to_hex() {
        return false;
    }
    let result = collection.find_one_and_delete(doc! {"_id": device_id, "user_id": user_id.to_hex()}, None).await.unwrap();
    result.is_some()
}

#[delete("/api/device/{id}")]
async fn delete_device(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user_fetch = get_user_from_header(&req, &client).await;
    if user_fetch.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_fetch.unwrap();
    let resp = delete_device_by_id_and_user(&ObjectId::parse_str(id.clone()).unwrap(), &user._id, &client).await;
    if !resp {
        response.message = String::from("Device not found");
        return HttpResponse::BadRequest().json(response);
    }
    response.message = String::from("Device deleted");
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
    let session_fetch = get_session_from_header(&req, &client).await;
    if session_fetch.is_none() {
        return None;
    }
    let session = session_fetch.unwrap();
    let user_fetch  = get_user_from_session(&session, &client).await;
    if user_fetch.is_none() {
        return None;
    }
    let user = user_fetch.unwrap();
    if !user.admin {
        return None;
    }
    
    let admin_token_headers = req.headers().get("adminToken");
    if admin_token_headers.is_none() {
        return None;
    }
    let admin_token = admin_token_headers.unwrap().to_str().unwrap();
    let collection: Collection<Admin> = client.database(DB_NAME).collection(ADMINCOLL);
    let admin_fetch = collection.find_one(doc! {"token": admin_token}, None).await.unwrap();
    if admin_fetch.is_none() {
        return None;
    }
    let admin = admin_fetch.unwrap();
    //check if user id is the same
    if admin.user_id != user._id.to_hex() {
        return None;
    }
    let time = admin.time;
    let now = time_now();
    if now >= time {
        collection.delete_one(doc! {"token": admin_token}, None).await.unwrap();
        return None;
    }
    Some(AdminCheck { admin: admin, user: user })
}




//delete alarms by user id
async fn delete_alarms_from_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let result = collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await.unwrap();
    result.deleted_count > 0
}
//delete devices by user id
async fn delete_devices_by_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let result = collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await.unwrap();
    result.deleted_count > 0
}

//delete sessions by user id
async fn delete_sessions_by_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let result = collection.delete_many(doc! {"user_id": user_id.to_hex()}, None).await.unwrap();
    result.deleted_count > 0
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
    let result = collection.find_one_and_delete(doc! {"_id": user_id}, None).await.unwrap();
    result.is_some()
}

//remove user 
async fn remove_user_by_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
    //check if user is owner
    let user_fetch = get_user_by_id(&user_id, &client).await;
    if user_fetch.is_none() {
        return false;
    }
    let user = user_fetch.unwrap();
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
    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    let admin_check = get_admin_from_headers(&req, &client).await;
    if admin_check.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let users = get_users(&client).await;
    HttpResponse::Ok().json(users)
}

#[delete("/admin/user/{user_id_str}")]
async fn delete_user(req: HttpRequest, user_id_str: web::Path<String>, client: web::Data<Client>) -> impl Responder {
    let user_id = ObjectId::parse_str(user_id_str.as_str()).unwrap();

    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    let admin_check = get_admin_from_headers(&req, &client).await;
    if admin_check.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user_delete = remove_user_by_id(&user_id, &client).await;
    if !user_delete {
        let response = DefaultResponse {  message: "Error deleting user".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let response = DefaultResponse {  message: "User deleted".to_string()};
    HttpResponse::Ok().json(response)
}

async fn edit_user_from_id(user_id: &ObjectId, user: &User, client: &web::Data<Client>) -> bool {
    if user.owner {
        return false;
    }
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let result = collection.find_one_and_replace(doc! {"_id": user_id}, user, None).await.unwrap();
    result.is_some()
}

#[put("/admin/user/{user_id_str}")]
async fn edit_user(req: HttpRequest, user_id_str: web::Path<String>, user: web::Json<User>, client: web::Data<Client>) -> impl Responder {
    let user_id = ObjectId::parse_str(user_id_str.as_str()).unwrap();

    let admin_check = get_admin_from_headers(&req, &client).await;
    if admin_check.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user_edit = edit_user_from_id(&user_id, &user, &client).await;
    if !user_edit {
        let response = DefaultResponse {  message: "Error editing user".to_string()};
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
    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user_fetch = get_user_from_session(&session.unwrap(), &client).await;
    if user_fetch.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user = user_fetch.unwrap();
    if !user.owner {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let check_password = verify_password(&admin_password.password, &user.password);
    if !check_password {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    //add 10 minutes to time
    let expires = time_now() + 600000;
    let admin = Admin { _id: ObjectId::new(), token: new_token(96), user_id: user._id.to_hex(), time: expires };
    let result = set_admin_session(&admin, &client).await;
    if !result {
        let response = DefaultResponse {  message: "Error setting admin session".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    HttpResponse::Ok().json(admin)
}


//get user
#[get("/api/user")]
async fn get_user(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user_fetch = get_user_from_session(&session.unwrap(), &client).await;
    if user_fetch.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    HttpResponse::Ok().json(user_fetch.unwrap())
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
    let result = collection.find_one_and_replace(doc! {"_id": user._id.clone()}, user, None).await.unwrap();
    result.is_some()
}

//edit user
#[put("/api/editUser/{email}")]
async fn edit_user_info(req: HttpRequest, email: web::Path<String>, user_edit: web::Json<UserEdit>, client: web::Data<Client>) -> impl Responder {
    let session = get_session_from_header(&req, &client).await;
    if session.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let user_fetch = get_user_from_session(&session.unwrap(), &client).await;
    if user_fetch.is_none() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    if user_fetch.clone().unwrap().email != email.to_string() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    if user_fetch.clone().unwrap().email != email.to_string()  && user_edit.email != email.to_string() {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    //verify password
    let check_password = verify_password(&user_edit.confirm_password, &user_fetch.clone().unwrap().password);
    if !check_password {
        let response = DefaultResponse {  message: "Unauthorized".to_string()};
        return HttpResponse::BadRequest().json(response);
    }

    let mut password_hash = user_fetch.clone().unwrap().password;
    if user_edit.change_password.is_some(){
        //check if password is valid
        let estimate = zxcvbn(&user_edit.clone().change_password.unwrap(), &[]).unwrap();

        if estimate.score() < 3 || user_edit.clone().change_password.unwrap().len() < 6 {
            let response = DefaultResponse {  message: "Password too weak".to_string()};
            return HttpResponse::BadRequest().json(response);
        }
        //hash password
        let hashed_password = hash_password(&user_edit.clone().change_password.unwrap());
        password_hash = hashed_password;
    }
    let new_user = User { _id: user_fetch.clone().unwrap()._id, email: user_edit.clone().email, password: password_hash, first_name: Some(user_edit.clone().first_name), last_name: Some(user_edit.clone().last_name), screen_name: user_edit.clone().screen_name, owner: user_fetch.clone().unwrap().owner, active: user_fetch.clone().unwrap().active, admin: user_fetch.clone().unwrap().admin };
    let update = update_user_info(&new_user, &client).await;
    if update == false {
        let response = DefaultResponse {  message: "Error updating user".to_string()};
        return HttpResponse::BadRequest().json(response);
    }
    let response = DefaultResponse {  message: "User edited".to_string()};
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
        let token = self.key_token.remove(key);
        if token.is_none() {
            return;
        }
        let user = self.token_user.remove(&token.unwrap());
        if user.is_none() {
            return;
        }
    }
    fn add_session(&mut self, key: &String, session: WsSession, user: &String, token: &String) {
        self.key_session.insert(key.clone(), session);
        self.key_token.insert(key.clone(), token.clone());
        self.token_user.insert(token.clone(), user.clone());
    }
    fn get_user_keys_exclude_token(&self,  token: &str) -> Vec<String> {
        let mut keys = Vec::new();
        //get user's tokens
        let user_id = self.token_user.get(token);
        if user_id.is_none() {
            return keys;
        }
        //get all user tokens except current token by iterating through token_user

        let mut user_tokens = Vec::new();
        for (key, value) in &self.token_user {
            if value == user_id.unwrap() {
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
    let mut token = String::new();
    println!("ws key: {}", ws_key);
    actix_rt::spawn(async move {
        //deserialize message check errror
        fn deserialize_msg(msg: &str) -> Result<WsMsg, serde_json::Error> {
            let msg: WsMsg = serde_json::from_str(msg)?;
            Ok(msg)
        }

        async fn process_ws_action(msg: &str) -> WsMsg{
            let msg_de = deserialize_msg(&msg);
            if msg_de.is_err() {
                println!("Error deserializing message");
                return WsMsg{mode: None, token: None, url: None};
            }
            let msg = msg_de.unwrap();
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
                    if m.mode.is_none() || m.token.is_none()  {
                        println!("No mode or token");
                        return;
                    }
                    if m.clone().mode.unwrap() == "client" && m.clone().token.unwrap().len() > 3{
                        token = m.token.unwrap();
                        let user_fetch = token_to_user(&token, &client).await;
                        if user_fetch.is_none() {
                            println!("No user found");
                            return;
                        }
                        ws_handler.lock().unwrap().add_session(&ws_key, session.clone(), &user_fetch.unwrap().email, &token);

                    }else if m.mode.unwrap() == "api" && m.url.is_some() {
                        let keys = ws_handler.lock().unwrap().get_user_keys_exclude_token(&token);
                        let key_session = ws_handler.lock().unwrap().key_session.clone();
                        for key in keys {
                            let mut session_map = key_session.get(&key);
                            if session_map.is_none() {
                                continue;
                            }
                            let mut session_send = session_map.unwrap().clone();
                            session_send.text("connection").await.unwrap() ;
                        }
                    }
                    session.text("connection").await.unwrap();
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

    HttpServer::new(move || {
        App::new()
            .service(login)
            .service(register)
            .service(get_alarms)
            .app_data(web::Data::new(client.clone()))
            .app_data(web::Data::new(Mutex::new(WsMessageHandler::new())))
            .route("/action", web::get().to(action_ws))
            //.route("/logout", web::post().to(logout))
    })
    .workers(4)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
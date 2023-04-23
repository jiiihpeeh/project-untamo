use actix_web::dev::ServiceRequest;
use actix_web::http::Error;
use actix_web::http::header::Header;
use actix_web::web::Payload;
use actix_web::{get, post, put, delete, web, App, HttpResponse, HttpServer, Responder, HttpMessage, HttpRequest, FromRequest};
use futures::{StreamExt, TryStreamExt};
use mongodb::bson::oid::ObjectId;
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
use std::option::{Option};
use std::time::{SystemTime, UNIX_EPOCH};
use argon2::{PasswordVerifier,Argon2, password_hash::SaltString, PasswordHasher, PasswordHash};

use std::sync::Mutex;


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
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
pub struct Session {
    _id: ObjectId,
    user_id: String,
    token: String,
    time: i64,
}

impl Session {
    pub fn new (user_id: String ) -> Session {
        let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        let token = random_string(64);
        Session { _id: ObjectId::new(), user_id, token, time }
    }
}
 
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LogIn {
    email: String,
    password: String,
}


#[post("/")]
async fn hello(msg : web::Json<LogIn>) -> impl Responder {
    let rand = random_string(64);
    println!("{}, {}, {}", msg.email, msg.password,rand);
    HttpResponse::Ok().body(rand)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LogInResponse {
    token: String,
    email: String,
    screen_name: String,
    first_name: Option<String>,
    last_name: Option<String>,
    admin: bool,
    owner: bool,
    time: i64,
}

async fn get_user_from_email(email: String, client: web::Data<Client>) -> Option<User> {
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

async fn set_new_session(session: Session, client: web::Data<Client>) {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    collection.insert_one(session.clone(), None).await.unwrap();
}   

#[post("/login")]
async fn login(login: web::Json<LogIn>,client: web::Data<Client>) -> impl Responder {
    //number of items in collection
    let user = get_user_from_email(login.email.clone(), client.clone()).await;

    if user.is_none() {
        return HttpResponse::BadRequest().json("User not found");
    }
    //verify password
    let user = user.unwrap();
    
    if !verify_password(&login.password, &user.password) {
        return HttpResponse::BadRequest().json("Invalid password");
    }
    println!("User: {:?}", user);
    //let session = Session::new(user.id.clone());
  
    let response = LogInResponse {
        token: random_string(64),
        email: user.email.clone(),
        screen_name: user.screen_name.clone(),
        first_name: user.first_name.clone(),
        last_name: user.last_name.clone(),
        admin: user.admin,
        owner: user.owner,
        time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64,
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
    collection.insert_one(user.clone(), None).await.unwrap();
    response.message = String::from("User registered");
    HttpResponse::Ok().json(response)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Qr{
    qr_token: String,
    qr_originator: String,
    user_id: String,
    time: i64,
    created_at: i64,
}




//get user from token
async fn token_to_user(token: &str, client: &web::Data<Client>) -> Option<User> {
    let collection: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session = collection.find_one(doc! {"token": token.clone()}, None).await.unwrap();
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
#[serde(rename_all = "camelCase")]
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
async fn get_alarms_by_header(req: &HttpRequest, client: &web::Data<Client>) -> Vec<Alarm> {
    let session = get_session_by_header(&req, &client).await;
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
    let user_fetch = collection.find_one(doc! {"_id": ObjectId::parse_str(&session.user_id).unwrap()}, None).await.unwrap();
    if user_fetch.is_none() {
        return None;
    }
    let user = user_fetch.unwrap();
    Some(user)
}

//get session by header

async fn get_session_by_header(req: &HttpRequest, client: &web::Data<Client>) -> Option<Session> {
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
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
    //check if session is expired
    if now > session.clone().unwrap().time {
        //delete session
        collection.find_one_and_delete(doc! {"token": &token.unwrap()}, None).await.unwrap();
        return None;
    }
    session
}

async fn remove_session_by_header(req: &HttpRequest, client: &web::Data<Client>)-> bool {
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
async fn find_qr_by_token(qr_token: &str, client: &web::Data<Client>) -> Option<Qr> {
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
    let qr = find_qr_by_token(&qr.qr_token, &client).await;
    if qr.is_none() {
        error_response.message = String::from("QR not found");
        return HttpResponse::BadRequest().json(error_response);
    }
    //verify password
    let qr = qr.unwrap();
    if qr.user_id != qr.user_id {
        error_response.message = String::from("Invalid QR");
        return HttpResponse::BadRequest().json(error_response);
    }
    //add 5 years to current time
    let timeout =  (SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64) + 157680000000;
    let response = LogInResponse {
        token: random_string(64),
        email: qr.qr_originator.clone(),
        screen_name: qr.qr_originator.clone(),
        first_name: None,
        last_name: None,
        admin: false,
        owner: false,
        time: timeout,
    };
    let session = Session{ _id: ObjectId::new(), user_id: qr.user_id.clone(), token: response.token.clone(), time: response.time };
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

    let result = remove_session_by_header(&req, &client).await;
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
    let alarms =  get_alarms_by_header(&req, &client).await;
    HttpResponse::Ok().json(alarms)
}

async fn edit_alarm_from_id(alarm: Alarm, client: web::Data<Client>) -> bool {
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let alarm_id = alarm._id;
    let result = collection.find_one_and_replace(doc! {"_id": alarm_id}, alarm, None).await.unwrap();
    result.is_some()
}


#[put("/api/alarm/{id}")]
async fn edit_alarm(req: HttpRequest, client: web::Data<Client>, id: web::Path<String>, alarm: web::Json<Alarm>) -> impl Responder {
    let mut response = DefaultResponse {
        message: String::from(""),
    };
    let user = get_user_from_header(&req, &client).await;
    if user.is_none() {
        response.message = String::from("User not found");
        return HttpResponse::BadRequest().json(response);
    }
    let user = user.unwrap();
    let collection: Collection<Alarm> = client.database(DB_NAME).collection(ALARMCOLL);
    let alarm_id = ObjectId::parse_str(id.clone()).unwrap();
    let alarm = collection.find_one(doc! {"_id": alarm_id, "user_id": user._id.clone()}, None).await.unwrap();
    if alarm.is_none() {
        response.message = String::from("Alarm not found");
        return HttpResponse::BadRequest().json(response);
    }
    let alarm = alarm.unwrap();
    let result = collection.find_one_and_replace(doc! {"_id": alarm_id, "user_id": user._id.clone()}, alarm, None).await.unwrap();
    if result.is_none() {
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


async fn add_device_to_user(device: Device, client: web::Data<Client>) {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    collection.insert_one(device, None).await.unwrap();
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
#[serde(rename_all = "camelCase")]
#[serde(rename(serialize = "type", deserialize = "device_type"))]
struct Device{
    _id: ObjectId,
    user_device: String,
    device_name: String,
    user_id: String,
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
        user_id: user._id.to_hex(),
        device_type: device_type(device.device_type.clone()),
    };
    add_device_to_user(device, client).await;
    response.message = String::from("Device added");
    HttpResponse::Ok().json(response)
}

async fn edit_device_by_id(device_id: &ObjectId, device: &Device, client: &web::Data<Client>) -> bool {
    let collection: Collection<Device> = client.database(DB_NAME).collection(DEVICECOLL);
    let device_in_db = collection.find_one(doc! {"_id": device_id}, None).await.unwrap();
    if device_in_db.is_none() {
        return false;
    }
    if device_in_db.unwrap().user_id != device.user_id {
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
    if device.user_id != user._id.to_hex() {
        response.message = String::from("Device was not owned by user");
        return HttpResponse::BadRequest().json(response);
    }
    //get device from json
    let device = Device {
        _id: ObjectId::parse_str(id.clone()).unwrap(),
        user_device: device.user_device.clone(),
        device_name: device.device_name.clone(),
        user_id: user._id.to_hex(),
        device_type: device_type(device.device_type.clone()),
    };
    let resp = edit_device_by_id(&ObjectId::parse_str(id.clone()).unwrap(), &device, &client).await;
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
    if device_to_delete.unwrap().user_id != user_id.to_hex() {
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
#[serde(rename_all = "camelCase")]
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
    let session_fetch = get_session_by_header(&req, &client).await;
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
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
    if now >= time {
        collection.delete_one(doc! {"token": admin_token}, None).await.unwrap();
        return None;
    }
    Some(AdminCheck { admin: admin, user: user })
}



//set user admin status
async fn set_user_admin_by_id(user_id: ObjectId, admin: bool, client: web::Data<Client>) -> bool {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let result = collection.find_one_and_update(doc! {"_id": user_id}, doc! {"$set": {"admin": admin}}, None).await.unwrap();
    result.is_some()
}
//set user active status
async fn set_user_active_by_id(user_id: &ObjectId, active: &bool, client: &web::Data<Client>) -> bool {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let result = collection.find_one_and_update(doc! {"_id": user_id}, doc! {"$set": {"active": active}}, None).await.unwrap();
    result.is_some()
}

//delete alarms by user id
async fn delete_alarms_by_user_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
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
async fn delete_user_by_id(user_id: &ObjectId, client: &web::Data<Client>) -> bool {
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
    let alarm_delete = delete_alarms_by_user_id(&user._id, &client).await;
    //delete devices
    let device_delete = delete_devices_by_user_id(&user._id, &client).await;
    //delete sessions
    let session_delete = delete_sessions_by_user_id(&user._id, &client).await;
    let user_delete = delete_user_by_id(&user._id, &client).await;
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
async fn set_admin_session(admin: &Admin, client: &web::Data<Client>)  {
    let collection: Collection<Admin> = client.database(DB_NAME).collection(ADMINCOLL);
    collection.insert_one(admin, None).await.unwrap();
}


#[get("/admin/users")]
async fn get_users_route(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    let session = get_session_by_header(&req, &client).await;
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

    let session = get_session_by_header(&req, &client).await;
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

async fn edit_user_by_id(user_id: &ObjectId, user: &User, client: &web::Data<Client>) -> bool {
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
    let user_edit = edit_user_by_id(&user_id, &user, &client).await;
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
    let session = get_session_by_header(&req, &client).await;
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
    let expires = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64 + 600000;
    let admin = Admin { _id: ObjectId::new(), token: random_string(96), user_id: user._id.to_hex(), time: expires };
    set_admin_session(&admin, &client).await;

    HttpResponse::Ok().json(admin)
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
    create_username_index(&client).await;
    create_session_index(&client).await;
    create_qr_index(&client).await;
    create_alarm_index(&client).await;
    create_device_index(&client).await;
    create_admin_index(&client).await;

    HttpServer::new(move || {
        App::new()
            .service(hello)
            .service(login)
            .service(register)
            .service(get_alarms)
            .app_data(web::Data::new(client.clone()))
            //.route("/logout", web::post().to(logout))
    })
    .workers(4)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
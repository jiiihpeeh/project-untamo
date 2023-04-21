use actix_web::dev::ServiceRequest;
use actix_web::http::Error;
use actix_web::web::Payload;
use actix_web::{get, post, put, delete, web, App, HttpResponse, HttpServer, Responder, HttpMessage};
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


#[derive(Debug, Clone, Serialize, Deserialize)]
struct SessionNotValid {
    message: String,
}

pub fn random_string(n: usize ) -> String {
    let mut rng = thread_rng();
    let chars: String = (0..n).map(|_| rng.sample(Alphanumeric) as char).collect();
    chars
}


fn verify_password(password: String, hash: String)-> bool{
    let argon2 = Argon2::default();
    let password_hash = PasswordHash::new(&hash).unwrap();
    argon2.verify_password(password.as_bytes(), &password_hash).is_ok()
}
fn hash_password(password: String)-> String{
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

impl User {
    pub fn set_first_name(&mut self, first_name: String) {
        self.first_name = Some(first_name);
    }
    pub fn set_last_name(&mut self, last_name: String) {
        self.last_name = Some(last_name);
    }
    pub fn set_active(&mut self, active: bool) {
        self.active = active;
    }
    pub fn set_admin(&mut self, admin: bool) {
        self.admin = admin;
    }
    pub fn set_owner(&mut self, owner: bool) {
        self.owner = owner;
    }

    
    pub fn change_password(&mut self, new_password: String, old_password: String) -> bool{
        // verify old password   
        let is_valid = verify_password(old_password, self.password.clone());
        if !is_valid {
            return false;
        }
        // hash new password
        let pw_hash = hash_password(new_password);
        if pw_hash.is_empty() {
            return false;
        }
        self.password = pw_hash;
        true
    }
    

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

#[post("/login")]
async fn login(login: web::Json<LogIn>,client: web::Data<Client>) -> impl Responder {
    let collection: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    //number of items in collection
    let user = collection.find_one(doc! {"email": login.email.clone()}, None).await.unwrap();
    if user.is_none() {
        return HttpResponse::BadRequest().json("User not found");
    }
    //verify password
    let user = user.unwrap();
    
    if !verify_password(login.password.clone(), user.password.clone()) {
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
    println!("session: {:?}", session);
    let collection_session: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    collection_session.insert_one(session, None).await.unwrap();
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
struct RegisterResponse {
    message: String
}
#[post("/register")]
async fn register(register: web::Json<Register>,client: web::Data<Client>,) -> impl Responder {
    let mut response = RegisterResponse {
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
        password: hash_password(register.password.clone()),
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

#[post("/qr-login")]
async fn qr_login(qr: web::Json<Qr>,client: web::Data<Client>) -> impl Responder {
    let mut error_response = SessionNotValid {
        message: String::from(""),
    };
    let collection: Collection<Qr> = client.database(DB_NAME).collection(QRCOLL);
    //number of items in collection
    let qr = collection.find_one(doc! {"qr_token": qr.qr_token.clone()}, None).await.unwrap();
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
    let response = LogInResponse {
        token: random_string(64),
        email: qr.qr_originator.clone(),
        screen_name: qr.qr_originator.clone(),
        first_name: None,
        last_name: None,
        admin: false,
        owner: false,
        time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64,
    };
    let session = Session{ _id: ObjectId::new(), user_id: qr.user_id.clone(), token: response.token.clone(), time: response.time };
    println!("session: {:?}", session);
    let collection_session: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    collection_session.insert_one(session, None).await.unwrap();
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

struct Empty {

}


//guard it with is_logged_in
#[post("/logout", wrap = "is_logged_in")]
async fn logout(client: web::Data<Client>) -> impl Responder {
    let mut error_response = SessionNotValid {
        message: String::from(""),
    };
    let token = req.headers().get("token");
    if token.is_none() {
        error_response.message = String::from("Token not found");
        return HttpResponse::BadRequest().json(error_response);
    }
    let token = token.unwrap().to_str().unwrap();
    let collection_session: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session_fetch = collection_session.find_one(doc! {"token": token}, None).await.unwrap();
    if session_fetch.is_none() {
        error_response.message = String::from("Session not found");
        return HttpResponse::BadRequest().json(error_response);
    }
    let session_fetch = session_fetch.unwrap();
    collection_session.delete_one(doc! {"_id": session_fetch._id}, None).await.unwrap();
    HttpResponse::Ok().json("Logged out")
}

//check if user is logged using middleware
async fn is_logged_in (req: ServiceRequest, payload: Payload) -> Result<ServiceRequest, HttpResponse> {
    let mut error_response = SessionNotValid {
        message: String::from(""),
    };
    let token = req.headers().get("token");
    if token.is_none() {
        error_response.message = String::from("Token not found");
        return Err(HttpResponse::BadRequest().json(error_response));
    }
    let token = token.unwrap().to_str().unwrap();
    let client = req.app_data::<web::Data<Client>>().unwrap();
    let collection_session: Collection<Session> = client.database(DB_NAME).collection(SESSIONCOLL);
    let session_fetch = collection_session.find_one(doc! {"token": token}, None).await.unwrap();
    if session_fetch.is_none() {
        error_response.message = String::from("Session not found");
        return Err(HttpResponse::BadRequest().json(error_response));
    }
    let session = session_fetch.unwrap();
    let collection_user: Collection<User> = client.database(DB_NAME).collection(USERCOLL);
    let user = collection_user.find_one(doc! {"_id": session.user_id}, None).await.unwrap();
    if user.is_none() {
        error_response.message = String::from("User not found");
        return Err(HttpResponse::BadRequest().json(error_response));
    }
    let user = user.unwrap();
    if !user.active {
        error_response.message = String::from("User is not active");
        return Err(HttpResponse::BadRequest().json(error_response));
    }
    //check time of session
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
    let _50_years_as_millis = 50 * 365 * 24 * 60 * 60 * 1000;
    if time - session.time > _50_years_as_millis {
        error_response.message = String::from("Session expired");
        return Err(HttpResponse::BadRequest().json(error_response));
    }
    req.extensions_mut().insert(user);
    Ok(req)
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let client = Client::with_uri_str(MONGODB_URI).await.expect("failed to connect");
    create_username_index(&client).await;
    create_session_index(&client).await;
    create_qr_index(&client).await;

    HttpServer::new(move || {
        App::new()
            .service(hello)
            .service(login)
            .service(register)
            .app_data(web::Data::new(client.clone()))
            //.route("/login")
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
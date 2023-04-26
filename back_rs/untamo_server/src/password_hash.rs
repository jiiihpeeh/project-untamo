use argon2::{PasswordVerifier,Argon2, password_hash::SaltString, PasswordHasher, PasswordHash};
use rand::rngs::OsRng;

pub fn verify_password(password: &str, hash: &str)-> bool{
    let argon2 = Argon2::default();
    let password_hash = PasswordHash::new(&hash).unwrap();
    argon2.verify_password(password.as_bytes(), &password_hash).is_ok()
}
pub fn hash_password(password: &str)-> String{
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

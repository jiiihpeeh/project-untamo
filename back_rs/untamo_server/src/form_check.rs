use std::collections::HashMap;

use similar_string::*;
use crate::utils::email_is_valid;
use serde::{Deserialize, Serialize};


//leetspeak replacer function for a String
fn from_leet(s: &str) -> String {
    s.replace("1", "i")
        .replace("!", "i")
        .replace("3", "e")
        .replace("4", "a")
        .replace("5", "s")
        .replace("7", "t")
        .replace("0", "o")
}


#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Form{
    first_name: Option<String>,
    last_name: Option<String>,
    email: Option<String>,
    password: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Message{
    pub messages: Vec<String>,
    pub pass: bool,
}
pub fn form_check(form_map: &HashMap<String,&Option<String>>)-> Message{
    let mut pass = true;
    let mut messages : Vec<String> = Vec::new();
   
    //generate a vector of filled fields from form
    let mut filled_fields : Vec<String> = Vec::new();
    //iterate all fields in form struct using serde

    //convert Form struct to hashmap using serde iterate over hashmap
  

    //check if email is valid from form_map
    match form_map.get("email") {
        Some(email) => {
            match email {
                Some(email) => {
                    if !email_is_valid(email) {
                            messages.push(String::from("Email is not valid"));
                            pass = false;
                    }
                },
                None => {
                    messages.push(String::from("Email is not valid"));
                    pass = false;
                }
            }
        },
        None => {
            messages.push(String::from("Email is not valid"));
            pass = false;
        }
    }

    for (key, value) in  form_map.iter(){
        //if field is filled
        //exclude password from filled_fields
        if key == "password" {
            continue;
        }
        match value {
            Some(value) => {
                //add field value as lowercase to filled_fields 
                filled_fields.push(value.to_lowercase());
            },
            None => {}
        }
    }
    //combine first_name and last_name to full_name from form_map

    match (form_map.get("first_name"), form_map.get("last_name")) {
        (Some(first_name), Some(last_name)) => {
            match (first_name, last_name) {
                (Some(first_name), Some(last_name)) => {
                    filled_fields.push(format!("{} {}", first_name.to_lowercase(), last_name.to_lowercase()));
                },
                _ => ()
            }
        },
        _ => ()
    }
    //split email to parts and push them to filled_fields from form_map
    match form_map.get("email") {
        Some(email) => {
            match email {
                Some(email) => {
                    let parts = email.split("@");
                    for part in parts {
                        filled_fields.push(part.to_lowercase());
                    }
                },
                None => ()
            }
        },
        None => ()
    }
    
    let mut scores : Vec<f64> = Vec::new();
    // find best similarity for password convert password to lowercase
    let lowercase_password = form_map.get("password").unwrap().as_ref().unwrap().to_lowercase();
    match find_best_similarity(&lowercase_password , &filled_fields){
        Some(result) => {
            //extract f64 from (String, f64)
            let (_, score) = result;
            scores.push(score);
        },
        None => {
            println!("None");
        }
    }

    //lowercase password and replace leetspeak
    let leet_password = from_leet(&lowercase_password.to_lowercase());
    match find_best_similarity(&leet_password, &filled_fields){
        Some(result) => {
            let (_, score) = result;
            scores.push(score);
        },
        None => {
            println!("None");
        }
    }
    //check if password is valid from form_map
    match form_map.get("password") {
        Some(password) => {
            match password {
                Some(password) => {
                    if password.len() < 6 {
                        messages.push(String::from("Password is too short"));
                        pass = false;
                    }
                },
                None => {
                    messages.push(String::from("Password is too short"));
                    pass = false;
                }
            }
        },
        None => {
            messages.push(String::from("Password is too short"));
            pass = false;
        }
    }
    //check if scores are too high from scores
    for score in scores {
        if score > 0.8 {
            messages.push(String::from("Password is too similar to other fields"));
            pass = false;
        }
    }

    Message { 
        messages: messages, 
        pass: pass 
    }
   
}
    
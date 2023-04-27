use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;

use crate::utils::email_is_valid;


pub fn fuzzy(s1: &str, s2: &str) -> i64 {
    let matcher = SkimMatcherV2::default();
    let score = matcher.fuzzy_match(s1, s2);
    score.unwrap_or(0)
}

pub struct Form{
    first_name: Option<String>,
    last_name: Option<String>,
    email: Option<String>,
    password: Option<String>,
}

pub struct Message{
    messages: Vec<String>,
    pass: bool,
}
pub fn form_check(form: Form)-> Message{
    //check if email is valid
    let mut pass = true;
    let mut messages : Vec<String> = Vec::new();
    match form.email {
        Some(ref email) => {
            if !email_is_valid(&email) {
                pass = false;
                messages.push(String::from("Email is not valid"));
            }
        },
        None => {
            pass = false;
            messages.push(String::from("Email is not valid"));
        }
    };
    //check if password is valid
    match form.password {
        Some(password) => {
            if password.len() < 6 {
                pass = false;
                messages.push(String::from("Password is too short"));
            }
        },
        None => {
            pass = false;
            messages.push(String::from("Password is too short"));
        }
    };
    //check if password and email are not similar
    match form.email {
        Some(email) => {
            match form.password {
                Some(password) => {
                    if fuzzy(&email, &password) > 0 {
                        pass = false;
                        messages.push(String::from("Password and email are too similar"));
                    }
                },
                None => {
                    pass = false;
                    messages.push(String::from("Password and email are too similar"));
                }
            };
        },
        None => {
            pass = false;
            messages.push(String::from("Password and email are too similar"));
        }
    };

    Message { 
        messages: messages, 
        pass: pass 
    }
   
}
    
use std::time::{SystemTime, UNIX_EPOCH};

use radix_fmt::radix;
use rand::{thread_rng, distributions::Alphanumeric, Rng};



pub fn random_string(n: usize ) -> String {
    let mut rng = thread_rng();
    let chars: String = (0..n).map(|_| rng.sample(Alphanumeric) as char).collect();
    chars
}

//randomly capitalize each letter in the string
pub fn random_capital(s: &str) -> String {
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


pub fn time_now() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
}
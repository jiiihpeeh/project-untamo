#![allow(unused)]
use std::fs::File;
use std::io::BufReader;
use std::time::Duration;
use rodio::{Decoder, OutputStream, Sink};
use rodio::source::{SineWave, Source};
use clap::Parser;
/// Search for a pattern in a file and display the lines that contain it.

#[derive(Parser)]
struct Cli {
    #[clap( default_value = "false")]
    file: std::path::PathBuf,
    #[clap( default_value = "false")]
    repeat: String,
    #[clap( default_value = "0.90")]
    volume: f32,
}

fn play_file(file_path : std::path::PathBuf, repeat: bool, volume: f32) {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();
    let file = BufReader::new(File::open(file_path).unwrap());
    let source = Decoder::new(file).unwrap();
    
    if repeat {
        sink.append(source.repeat_infinite());
    } else {
        sink.append(source);
    }
    sink.set_volume(0.0);
    sink.play();
    if(repeat){
        let finish_volume = (volume * 100.0 ) as u32  ;
        for i in 0..finish_volume {
            std::thread::sleep(Duration::from_millis(100 as u64));
            sink.set_volume(i as f32 / 100.0);
        }
    }
    sink.set_volume(volume);
    sink.sleep_until_end();
}

fn main() {
    let args = Cli::parse();
    //check if given file exists
    if !args.file.exists() {
        println!("File does not exist");
        return;
    }
    play_file(args.file, args.repeat == "true", args.volume);
}

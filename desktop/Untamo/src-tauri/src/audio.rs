enum Audio {
  PLAY = 0,
  STOP,
}

enum Track {
  REPEAT = 0,
  ONCE
}
let mut play_state = Audio::STOP;
let mut track_state = Track::ONCE;
//Play a sound using rodio and show play state using enums
async fn play_sound(sound : String ) -> bool{
  let device = rodio::default_output_device().unwrap();
  let sink = rodio::Sink::new(&device);
  let file = File::open(sound).unwrap();
  let source = rodio::Decoder::new(BufReader::new(file)).unwrap();
  sink.append(source);
  sink.play();
  return true;
}
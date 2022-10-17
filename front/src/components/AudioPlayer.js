import { getAudio, hasOrFetchAudio } from '../audiostorage/audioDatabase';
import { notification } from './notification';


class AudioPlayer {
    constructor(track,token){
        this.track = track;
        this.audioelem = document.createElement('audio');
        this.audioelem.setAttribute("id","audioplayer");
        this.token = token;
        this.instances = 0;
        this.fetched = false;
        this.setTrack();
    };
    async setTrack (){
        let tracked = await hasOrFetchAudio(this.track, this.token);
        if(tracked){
            let data =  await getAudio(this.track);
            this.audioelem.src = URL.createObjectURL(data);
            this.audioelem.type = 'audio/ogg';
            this.fetched = true;
        }else{
            notification("Audio", "Can not play track", "error");
        };
    };
    playOnce (){
        //this.audioelem.setAttribute('loop', false);
        this.audioelem.play();
    };
    playLoop (){
        this.audioelem.setAttribute('loop', true);
        if(this.fetched){
            if(this.instances === 0){
                this.audioelem.play();
                this.instances++;
            }else{
                this.stopLoop();
            };
        };
    };
    stopLoop(){
        if(this.fetched){
            console.log("audio stopped")
            this.audioelem.pause();
            this.instances = 0;
        };
    };
};

export default AudioPlayer;
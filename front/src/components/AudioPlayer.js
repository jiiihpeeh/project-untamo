import { getAudio, hasOrFetchAudio } from '../audiostorage/audioDatabase';
import { notification } from './notification';


class AudioPlayer {
    constructor(track,token){
        this.track = track;
        this.audioelem = document.createElement('audio');
        this.audioelem.setAttribute("id","audioplayer");
        this.token = token;
        this.instances = 0;
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
    async playOnce (){
        //this.audioelem.setAttribute('loop', false);
        await this.setTrack();
        this.audioelem.play();
        //URL.revokeObjectURL(this.audioelem.src);
    };
    async playLoop (){
        await this.setTrack();
        this.audioelem.setAttribute('loop', true);
        if(this.fetched){
            if(this.instances === 0){
                this.audioelem.play();
                this.instances++;
            }else{
                this.stop();
            };
        };
    };
    stop(){
        if(this.fetched){
            console.log("audio stopped")
            this.audioelem.pause();
            this.instances = 0;
            URL.revokeObjectURL(this.audioelem.src);
        };
    };
};

export default AudioPlayer;
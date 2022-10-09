import { getAudio, hasOrFetchAudio } from '../audiostorage/audioDatabase'
import { notification } from './notification';

const playAudio = async (audio, token) => {
    let res = await hasOrFetchAudio(audio,token)
    if(res){
        let data =  await getAudio(audio);
        let audioelem = document.createElement('audio');
        audioelem.src = URL.createObjectURL(data);
        audioelem.type = 'audio/ogg';

        audioelem.play();
    } else {
        notification("Audio", "Can not play audio", "error")
    }

}

export default playAudio;
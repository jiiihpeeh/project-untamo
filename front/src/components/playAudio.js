import { getAudio, storeAudio, hasAudio } from '../audiostorage/audioDatabase'
import axios from 'axios'

const playAudio = async (audio) => {
    if (! await hasAudio(audio)){
        let res = await axios.get(`/resources/${audio}.opus`,{
            responseType: 'blob'
        })
        await storeAudio(audio, res.data);
    }
    let data =  await getAudio(audio);
    let audioelem = document.createElement('audio');
    audioelem.src = URL.createObjectURL(data);
    audioelem.type = 'audio/ogg';

    audioelem.play();
}

export default playAudio;
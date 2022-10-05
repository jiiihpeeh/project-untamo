import { getAudio, fetchAudio, hasAudio } from '../audiostorage/audioDatabase'

const playAudio = async (audio) => {
    if (! await hasAudio(audio)){
        await fetchAudio(audio);
    }
    let data =  await getAudio(audio);
    let audioelem = document.createElement('audio');
    audioelem.src = URL.createObjectURL(data);
    audioelem.type = 'audio/ogg';

    audioelem.play();
}

export default playAudio;
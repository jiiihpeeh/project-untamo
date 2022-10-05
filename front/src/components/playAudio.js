import { getAudio, hasOrFetchAudio } from '../audiostorage/audioDatabase'

const playAudio = async (audio) => {
    await hasOrFetchAudio(audio)
    let data =  await getAudio(audio);
    let audioelem = document.createElement('audio');
    audioelem.src = URL.createObjectURL(data);
    audioelem.type = 'audio/ogg';

    audioelem.play();
}

export default playAudio;
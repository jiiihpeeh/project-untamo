import playAudio from "./playAudio";
import { fetchAudioFiles } from "../audiostorage/audioDatabase";
export const alarmResources = async (token) => {
    await fetchAudioFiles(token);
    playAudio('rooster', token);
}

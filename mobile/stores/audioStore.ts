import { create } from 'zustand'
//import { getAudio, hasOrFetchAudio, keysAudio } from '../audiostorage/audioDatabase' 
import sleep from '../components/sleep'
import axios from 'axios'
import useMessage, { Status} from './messageStore'
import useServer from './serverStore'
import useLogin from './loginStore'

const notification  = useMessage.getState().notification



const getCommunicationInfo = () => {
  const server = useServer.getState().address
  const token = useLogin.getState().token
  return { 
              server: server,
              token: token
         }
}
// export const fetchAudio = async (audio: string) => {
//     const { token: token, server: server }  = getCommunicationInfo()
    

//     if(token.length > 0 && audio.length > 0){
//         try {
//             let res = await axios.get(`${server}/audio-resources/${audio}.opus`,{
//                 responseType: 'blob', 
//                 headers: {token: token}
//             });
//             await storeAudio(audio, res.data);
//             //console.log(`Dowloaded audio: ${audio}`);
//         } catch(err){
//             //console.log(`Couldn't fetch audio ${audio}`);
//             notification(`Couldn't download a file ${audio}`, 3000,Status.Error);
//         }
//     }
// }



export const fetchAudioFiles = async () => {
    const { token, server }  = getCommunicationInfo()

    if(token){
        try {
            let res = await axios.get(`${server}/audio-resources/resource_list.json`,{
                headers: {'token': token}
            });
            let audioTracks: Array<string> = []
            if(res.data.length > 0){
                for (const audio of res.data){
                    //await hasOrFetchAudio(audio);
                    audioTracks.push(audio)
                }
            }
            //useAlarm.setState({tones: audioTracks})
            useAudio.getState().setTracks(audioTracks)

        } catch(err){
            //console.log(`Couldn't fetch resources listing`);
            notification("Failed to get an audio listing", 3000, Status.Error)
        }
    }   
};


// const audioELement = document.createElement('audio')
// audioELement.setAttribute("id","audioPlayer")

// audioELement.addEventListener("playing", (event) => {
//     useAudio.setState({ plays: true })
// })

// audioELement.addEventListener("pause", (event) => {
//     useAudio.setState({ plays: false })
// })

// audioELement.addEventListener("ended", (event) => {
//     useAudio.setState({ plays: false })
// })

// audioELement.addEventListener("emptied", (event) => {
//     useAudio.setState({ plays: false })
// })


type UseAudio = {
    track: string,
    tracks: Array<string>,

    getTracks: () => void,
    setTracks: (tracks: Array<string>) => void,
    // setTrack: (track: string)=>void,
    // play: ()=> void,
    // plays:  boolean,
    // stop: ()=> void,
    // loop: boolean,
    // setLoop: (to:boolean)=>void,
    //audioElement: HTMLAudioElement
}

// const play = async (track: string, loop: boolean) => {
//     console.log(track, loop)
//     let audioData =  await getAudio(track)
//     audioELement.src = URL.createObjectURL(audioData)
//     if(!loop){
//         audioELement.removeAttribute("loop")
//     }else{
//        audioELement.setAttribute("loop", `${loop}`) 
//     }
//     //audioELement.load()
//     await sleep(3)
//     audioELement.play()
// }

// const stop = () => {
//     if(useAudio.getState().plays){
//         audioELement.load()
//         URL.revokeObjectURL(audioELement.src) 
//         audioELement.src=""
//     }
// }

// const reloadTracks = async(track: string) => {
//     let tracks = await keysAudio()
//     let newTrack = (tracks).includes(track)?track:"rooster"
//     useAudio.setState({tracks: tracks, track: newTrack})
// }

const useAudio = create<UseAudio>((set, get) => (
    {
        track: "rooster",
        tracks: [],
        getTracks: () => {
            fetchAudioFiles()
        },
        setTracks: (tracks:Array<string>) => {
            set(
                    {
                        tracks : [...new Set(tracks)]
                    }
                )
            
        },
        // setTrack: (track)=> {
        //     let newTrack = (get().tracks).includes(track)?track:"rooster"
        //     set(
        //         { 
        //             track: newTrack 
        //         }
        //     )
        //     if(track !== newTrack || get().tracks.length === 0){
        //         reloadTracks(track)
        //     }
        // },
        // plays: false,
        // play: async() =>{
        //     await play(get().track, get().loop)
        // },
        // stop: () => {
        //     stop()
        // },
        // loop: false,
        // setLoop: (to)=> {
        //     set(
        //         { 
        //             loop: to 
        //         }
        //     )
        // },
    }
))

export default useAudio 
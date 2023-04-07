import { create } from 'zustand'
import { getAudio, hasOrFetchAudio, keysAudio } from '../audiostorage/audioDatabase' 
import { sleep } from '../utils'
const audioELement = document.createElement('audio')
audioELement.setAttribute("id","audioPlayer")
audioELement.setAttribute("autoplay","true")
audioELement.setAttribute("playsinline","true")


audioELement.addEventListener("playing", (event) => {
    useAudio.setState({ plays: true })
})

audioELement.addEventListener("pause", (event) => {
    useAudio.setState({ plays: false })
})

audioELement.addEventListener("ended", (event) => {
    useAudio.setState({ plays: false })
})

audioELement.addEventListener("emptied", (event) => {
    useAudio.setState({ plays: false })
})


type UseAudio = {
    track: string,
    tracks: Array<string>,
    setTrack: (track: string)=>void,
    play: ()=> void,
    plays:  boolean,
    stop: ()=> void,
    loop: boolean,
    setLoop: (to:boolean)=>void,
    loopPlayBegins: number| null,
    setLoopPlayBegins: (playTime: number| null)=>void,
    audioElement: HTMLAudioElement
}

const play = async (track: string, loop: boolean) => {
    console.log(track, loop)
    let audioData =  await getAudio(track)
    audioELement.src = URL.createObjectURL(audioData)
    if(!loop){
        audioELement.removeAttribute("loop")
    }else{
       audioELement.setAttribute("loop", `${loop}`) 
       useAudio.getState().setLoopPlayBegins(Date.now())
    }
    //audioELement.load()
    await sleep(3)
    try{
        await audioELement.play()
    }catch(err:any){
        console.log(err)
    }
    
}

const stop = () => {
    if(useAudio.getState().plays){
        audioELement.load()
        URL.revokeObjectURL(audioELement.src) 
        audioELement.src=""
        if(useAudio.getState().loop){
            useAudio.getState().setLoopPlayBegins(null)
        }
    }
}

const reloadTracks = async(track: string) => {
    let tracks = await keysAudio()
    let newTrack = (tracks).includes(track)?track:"rooster"
    useAudio.setState({tracks: tracks, track: newTrack})
}

const useAudio = create<UseAudio>((set, get) => (
    {
        track: "rooster",
        tracks: [],
        setTrack: (track)=> {
            let newTrack = (get().tracks).includes(track)?track:"rooster"
            set(
                { 
                    track: newTrack 
                }
            )
            if(track !== newTrack || get().tracks.length === 0){
                reloadTracks(track)
            }
        },
        plays: false,
        play: async() =>{
            play(get().track, get().loop)
        },
        stop: () => {
            stop()
        },
        loop: false,
        setLoop: (to)=> {
            set(
                { 
                    loop: to 
                }
            )
        },
        audioElement: audioELement,
        loopPlayBegins: null,
        setLoopPlayBegins: (playTime)=> {
            set(
                {
                    loopPlayBegins: playTime
                }
            )
        }
    }
))
// const requestAudioPermission = async () => {
//     try{
//         let perm = navigator.permissions.query({name:'notifications'})
//         console.log(perm)
//     }catch(err:any){
//         console.log(err)
//     }
// }
// requestAudioPermission()
export default useAudio
import { create } from 'zustand'
import { getAudio, hasOrFetchAudio } from '../audiostorage/audioDatabase' 

const audioELement = document.createElement('audio')
audioELement.setAttribute("id","audioPlayer")

audioELement.addEventListener("playing", (event) => {
    useAudio.setState({ plays: true })
})

audioELement.addEventListener("pause", (event) => {
    useAudio.setState({ plays: false })
})

audioELement.addEventListener("ended", (event) => {
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
    audioElement: HTMLAudioElement
}

const play = async () => {
    const track = useAudio.getState().track
    const loop = useAudio.getState().loop
    let audioData =  await getAudio(track)
    audioELement.src = URL.createObjectURL(audioData)
    if(!loop){
        audioELement.removeAttribute("loop")
    }else{
       audioELement.setAttribute("loop", `${loop}`) 
    }
    audioELement.play()
}

const stop = () => {
    if(useAudio.getState().plays){
        audioELement.pause()
        URL.revokeObjectURL(audioELement.src) 
    }
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
        },
        plays: false,
        play: async() =>{
            await play()
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
    }
))

export default useAudio
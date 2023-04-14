import { create } from 'zustand'
import { keysAudio, getAudioPath } from './audioDatabase' 
import { Child, Command } from '@tauri-apps/api/shell'
import  useSettings  from './settingsStore'


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
    audioProcess: Array<Child> | null
}

const play = async (track: string, loop: boolean) => {
    let track_path = await (getAudioPath(track) as Promise<string>)

    const command = Command.sidecar('bins/untamo_audio_play', 
                [
                    track_path, 
                    `${loop}`,
                    `${useSettings.getState().volume}`
                ]
    )
    command.on('close', data => {
                                    console.log(`command finished with code ${data.code} and signal ${data.signal}`)
                                    useAudio.setState({plays: false })
                                    stop()
                                }
            )
    command.on('error', error => {
                                    console.error(`command error: "${error}"`)
                                    useAudio.setState({plays: false })
                                    stop()
                                }
            )
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
    //useAudio.setState({plays: true})
    let out = await command.spawn()
    //useAudio.setState({audioProcess: out})
    return out
}

const stop = () => {
    let children : Array<Child>= []
    if(useAudio.getState().plays){
        useAudio.getState().audioProcess?.map(c => {c.kill(); children.push(c) })
    }
    return children
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
            let plays = get().plays
            let audioProcess = get().audioProcess
            let killed : Array<Child> = []
            if(plays || audioProcess !== null){
                get().audioProcess?.map(c => {c.kill(); killed.push(c)})
            }
            let process = await play(get().track, get().loop)
            let remaining = audioProcess?.filter(c => !killed.includes(c))
            set(
                {
                    audioProcess: [...(remaining)?remaining:[],process],
                    plays: true
                }
            )
        },
        stop: () => {
            let children = stop()
            let audioProcess = get().audioProcess
            let avail = audioProcess?.filter(c => !children.includes(c))
            set(
                {
                    audioProcess: avail?avail:null,
                    plays: false
                }
            )
        },
        loop: false,
        setLoop: (to)=> {
            set(
                { 
                    loop: to 
                }
            )
        },
        loopPlayBegins: null,
        setLoopPlayBegins: (playTime)=> {
            set(
                {
                    loopPlayBegins: playTime
                }
            )
        },
        audioProcess: null,
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
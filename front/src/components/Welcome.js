import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import axios from 'axios'
import playAudio from './playAudio'

import { fetchAudioFiles } from '../audiostorage/audioDatabase' 


const Welcome = () => {
    const [user, setUser] = useState ({
        user:(localStorage['user']) ? localStorage['user'] :'',
        firstname:(localStorage['firstname']) ? localStorage['firstname'] :'',
        lastname:(localStorage['lastname']) ? localStorage['lastname'] :'',
        screenname:(localStorage['screenname']) ? localStorage['screenname'] :'',
    })
    const  navigate = useNavigate()



    useEffect(() => {
        fetchAudioFiles()
        playAudio('rooster')
        if(!localStorage['user']){
            navigate('/login')
        }
        
    },[user])

    return(
        <>
            <div>
                <h2>Tere tere, {user.screenname}!</h2>
            </div>
        </>
    )
}

export default Welcome;
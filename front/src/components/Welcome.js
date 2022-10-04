import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { getAudio, storeAudio, hasAudio } from '../audiostorage/audioDatabase'




const Welcome = () => {
    const [user, setUser] = useState ({
        user:(localStorage['user']) ? localStorage['user'] :'',
        firstname:(localStorage['firstname']) ? localStorage['firstname'] :'',
        lastname:(localStorage['lastname']) ? localStorage['lastname'] :'',
        screenname:(localStorage['screenname']) ? localStorage['screenname'] :'',
    })
    const  navigate = useNavigate()



    useEffect(() => {
        const playAudio = async () => {
            if (! await hasAudio('rooster')){
                let res = await axios.get("/resources/Rooster.opus",{
                    responseType: 'blob'
                })
                await storeAudio('rooster', res.data)
            }
            let data =  await getAudio('rooster')
            let audioelem = document.createElement('audio');
            audioelem.src = URL.createObjectURL(data)
            audioelem.type = 'audio/ogg'

            audioelem.play()            
        }
        if(!localStorage['user']){
            navigate('/login')
        }
        playAudio()
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
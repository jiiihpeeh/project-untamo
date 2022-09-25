import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
            var audio = new Audio('http://localhost:3001/resources/Rooster.opus');  
            audio.type = 'audio/opus';
          
            try {
              await audio.play();
              console.log('Playing...');
            } catch (err) {
              console.log('Failed to play...' + err);
            }
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
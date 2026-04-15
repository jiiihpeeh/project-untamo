import React, { useState} from 'preact/compat'
import useAlarm  from "./alarmStates"
import Picker from '@emoji-mart/react'
import { useSettings, useEmojiStore } from "../../../stores"
import { Skin } from "../../../stores/emojiStore"

const Message = () => {
    const label= useAlarm((state)=> state.label)
    const setLabel = useAlarm((state)=> state.setLabel)
    const [ showEmoji, setShowEmoji ]  = useState(false)
    const isLight = useSettings((state)=>state.isLight)
    const data = useEmojiStore((state)=>state.getEmojiData)()

    function onEmojiSelect(emoji: Skin) {
        setLabel(label+emoji.native)
    }

    return(
        <div className="center">
            <div className="flex" style={{ margin: "1%" }}>
                <label className="form-label" onMouseDown={e=>e.preventDefault()}>
                    Message
                </label>
                <div className="vstack">
                    <div className="hstack">
                        <input 
                            className="input"
                            value={label} 
                            onChange={(e) => setLabel((e.target as HTMLInputElement).value)}
                        />
                        <button
                            className="btn"
                            onClick={()=>setShowEmoji(!showEmoji)}
                        >
                            ⏰
                        </button>
                    </div>
                    {  showEmoji ?
                    <Picker 
                        data={data} 
                        onEmojiSelect={onEmojiSelect}
                        theme={isLight ? 'light' : 'dark'}
                        width={300}
                    />
                    :
                    <></>
                    }
                </div>
            </div>
        </div>          
    )
}
export default Message
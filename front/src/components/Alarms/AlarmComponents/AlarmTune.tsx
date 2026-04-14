import React, { useState, useRef, useEffect } from "react"
import { createPortal } from 'react'
import { ChevronDown as Down, RefreshCw as RepeatIcon, Play as PlayIcon, Square as StopIcon } from '../../../ui/icons'
import useAlarm from './alarmStates'
import { fetchAudioFiles } from '../../../stores/audioDatabase'
import { useAudio } from "../../../stores"

function AlarmTune() {
    const alarmTune = useAlarm((state) => state.tune)
    const tunes = useAudio((state) => state.tracks)
    const track = useAudio((state) => state.track)
    const plays = useAudio((state) => state.plays)
    const playAudio = useAudio((state) => state.play)
    const setTrack = useAudio((state) => state.setTrack)
    const stopAudio = useAudio((state) => state.stop)
    const setLoop = useAudio((state) => state.setLoop)
    const [isOpen, setIsOpen] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    async function play(tune: string) {
        if (plays) stopAudio()
        else { setLoop(false); setTrack(tune); playAudio() }
    }

    const modTunes = (() => {
        if (tunes.length === 0) fetchAudioFiles()
        const mt = [...tunes]
        if (!mt.includes(alarmTune)) mt.push(alarmTune)
        return mt
    })()

    function handleOpen() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            if (spaceBelow < 200) {
                setMenuStyle({ position: 'fixed', bottom: window.innerHeight - rect.top, left: rect.left, width: rect.width, zIndex: 9999 })
            } else {
                setMenuStyle({ position: 'fixed', top: rect.bottom, left: rect.left, width: rect.width, zIndex: 9999 })
            }
        }
        setIsOpen(prev => !prev)
    }
    useEffect(() => {
        if (!isOpen) return
        function handleClick(e: MouseEvent) {
            if (btnRef.current && btnRef.current.contains(e.target as Node)) return
            setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="w-full">
                <button ref={btnRef} type="button"
                    className="btn w-full flex justify-between items-center truncate"
                    onClick={handleOpen}>
                    <span className="truncate">Choose the alarm tune: {alarmTune}</span>
                    <Down size={14} className="flex-shrink-0 ml-1" />
                </button>
                {isOpen && createPortal(
                    <ul className="menu p-1 shadow bg-base-100 rounded-box max-h-60 overflow-y-auto flex-nowrap" style={menuStyle}>
                        {modTunes.map(tune => (
                            <li key={`audio-${tune}`}>
                                <div className="flex items-center justify-between gap-2 px-2 py-1">
                                    <span className="flex-1 truncate cursor-pointer"
                                        onMouseDown={() => { useAlarm.setState({ tune }); setIsOpen(false) }}>
                                        {tune}
                                    </span>
                                    <div className="tooltip" data-tip={(plays && tune === track) ? "Stop" : "Play"}>
                                        <button
                                            className="btn btn-xs btn-info"
                                            disabled={!tunes.includes(tune) || (plays && tune !== track)}
                                            onMouseDown={(e) => { e.stopPropagation(); play(tune) }}
                                        >
                                            {(plays && tune === track) ? <StopIcon size={12} /> : <PlayIcon size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}
            </div>
            <button className="btn btn-xs btn-primary flex-shrink-0" onClick={() => fetchAudioFiles()}>
                <RepeatIcon size={12} />
            </button>
        </div>
    )
}

export default AlarmTune

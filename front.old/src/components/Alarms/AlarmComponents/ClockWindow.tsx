import CircularSlider from "react-circular-slider-svg";
import { timePadding } from '../../../utils'
import useAlarm from './alarmStates'
import React, { useEffect, useState } from 'react'
import { usePopups, useSettings } from '../../../stores'
import { h24ToH12 } from '../../../utils'

function UpIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    )
}

function DownIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    )
}

function ClockWindow() {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const showTimepicker = usePopups((state)=> state.showTimepicker)
    const setShowTimepicker = usePopups((state)=> state.setShowTimepicker)
    const clock24 = useSettings((state)=> state.clock24)
    const [ parsedTime, setParsedTime ] = useState({hours: 0, minutes: 0})

    function acceptTime() {
        setTime([Math.floor(parsedTime.hours), Math.floor(parsedTime.minutes)])
    }    
    useEffect(()=>{
        async function setParsed() {
            setParsedTime(parsedTime => {
                return {
                    hours: Math.round(time[0]),
                    minutes: Math.round(time[1])
                };
            }
            );
        }
        if(showTimepicker){
            setParsed()
        }
    }, [time, showTimepicker])

    if (!showTimepicker) return null

    return (
        <div className="modal-overlay" onClick={()=>setShowTimepicker(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
                Set Time
                <button className="modal-close" onClick={()=>setShowTimepicker(false)}>×</button>
            </div>
            <div
                className="modal-body"
                onMouseDown={e=>e.preventDefault()}
            >
                <table className="ui-table" style={{ width: 'auto' }}>
                    <tbody>
                       <tr>
                            <td>
                                <div className="center">
                                    <CircularSlider
                                        handle1={{
                                            value: parsedTime.hours*25/6,
                                            onChange: v => setParsedTime({...parsedTime, hours: 5.999*v/25})
                                        }}
                                        arcColor="#690"
                                        coerceToInt={false}
                                        size={125}
                                    />
                                </div>
                            </td>
                            <td></td>
                            <td>
                                <div className="center">
                                    <CircularSlider
                                        handle1={{
                                            value: parsedTime.minutes*5/3,
                                            onChange: v => setParsedTime({...parsedTime, minutes: 2.99*v/5})
                                        }}
                                        coerceToInt={false}
                                        arcBackgroundColor="gray"
                                        arcColor="blue"
                                        size={125}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="center">
                                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
                                        {clock24?timePadding(Math.floor(parsedTime.hours)):timePadding(h24ToH12(Math.floor(parsedTime.hours)))}
                                    </span>
                                    <div style={{ marginLeft: "2%", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <button 
                                            className="btn btn-sm"
                                            onClick={()=>setParsedTime({...parsedTime, hours: (parsedTime.hours + 1 ) % 24 })}
                                        >
                                            <UpIcon />
                                        </button>
                                        <button 
                                            className="btn btn-sm"
                                            onClick={()=>setParsedTime({...parsedTime, hours: (parsedTime.hours === 0 )?23:Math.abs((parsedTime.hours - 1 ) % 24)  })}
                                        >
                                            <DownIcon />
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="center">
                                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
                                    :
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div className="center">
                                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>   
                                        {timePadding(Math.floor(parsedTime.minutes))}
                                    </span>
                                    <div style={{ marginLeft: "2%", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <button 
                                            className="btn btn-sm"
                                            onClick={()=>setParsedTime({...parsedTime, minutes: (parsedTime.minutes + 1) % 60})}
                                        >
                                            <UpIcon />
                                        </button>
                                        <button 
                                            className="btn btn-sm"
                                            onClick={()=>setParsedTime({...parsedTime, minutes: (parsedTime.minutes === 0)?59:Math.max(0,parsedTime.minutes - 1)})}
                                        >
                                            <DownIcon />
                                        </button>
                                    </div>
                                    {!clock24 && <span style={{ fontWeight: "bold" }}>
                                        {(Math.floor(parsedTime.hours) >= 12)?"  PM":"  AM"}
                                    </span>}
                                </div>  
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="modal-footer">
                <button 
                    className="btn btn-primary" 
                    style={{ marginRight: "12px" }}
                    onClick={()=>{acceptTime(); setShowTimepicker(false)}}
                >
                    OK
                </button>
                <button 
                    className="btn btn-ghost"
                    onClick={()=>setShowTimepicker(false)}
                >
                    Cancel
                </button>
            </div>
          </div>
        </div>
    )
}

export default ClockWindow
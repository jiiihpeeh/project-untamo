import React, { useRef, useState, useEffect } from "react"
import { createPortal } from 'react'
import { ChevronDown as Down } from '../../../ui/icons'
import useAlarm from './alarmStates'
import { AlarmCases }  from "../../../type"
import { capitalize, enumValues } from "../../../utils"

function AlarmCase() {
  const alarmCase = useAlarm((state) => state.occurrence)
  const setAlarmCase = useAlarm((state) => state.setOccurrence)
  const cases = enumValues(AlarmCases)
  const inputTime = useRef<number>(Date.now())
  const [isOpen, setIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

  function mouseSelect(e: number) {
    const now = Date.now()
    if (now - inputTime.current < 200) return
    inputTime.current = now
    let index = cases.indexOf(alarmCase)
    if (e < 0 && index + 1 < cases.length) setAlarmCase(cases[index + 1])
    if (e > 0 && index > 0) setAlarmCase(cases[index - 1])
  }
  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 150) {
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
    <div className="flex flex-col justify-center">
      <div className="w-full" onWheel={e => mouseSelect(e.deltaY)}>
        <button ref={btnRef} type="button"
          className="btn w-full flex justify-between items-center"
          onClick={handleOpen}>
          Choose the alarm type: {alarmCase} <Down size={14} />
        </button>
        {isOpen && createPortal(
          <ul className="menu p-1 shadow bg-base-100 rounded-box" style={menuStyle}>
            {cases.map(item => (
              <li key={item}>
                <a onMouseDown={() => { setAlarmCase(item); setIsOpen(false) }}>{capitalize(item)}</a>
              </li>
            ))}
          </ul>,
          document.body
        )}
      </div>
    </div>
  )
}

export default AlarmCase

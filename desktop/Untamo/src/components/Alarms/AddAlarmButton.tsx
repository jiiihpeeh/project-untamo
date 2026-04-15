import React, { useEffect, useState } from 'preact/compat'
import { useAlarms, usePopups, useSettings } from '../../stores'

interface Props {
    mounting: React.RefObject<HTMLDivElement>
}

function AddAlarmButton(props: Props) {
    const mounting = props.mounting
    const alarms = useAlarms((state) => state.alarms)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
    const windowSize = usePopups((state) => state.windowSize)
    const [buttonPosition, setButtonPosition] = useState<React.CSSProperties>({})
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const isLight = useSettings((state) => state.isLight)

    async function updatePosition() {
        if (mounting.current) {
            const rect = mounting.current.getBoundingClientRect()
            const add = (windowSize.width - rect.right < 65) ? -21 : 0
            setButtonPosition({
                bottom: (navBarTop) ? windowSize.height * 0.05 : windowSize.height * 0.05 + navHeight,
                left: rect.right + add,
                position: "fixed"
            })
        }
    }

    useEffect(() => { updatePosition() }, [alarms, windowSize, mounting, navBarTop, navHeight])

    return (
        <button
            className={`btn btn-circle btn-lg shadow-lg ${isLight ? 'btn-success' : 'btn-primary'}`}
            style={{ ...buttonPosition, width: 50, height: 50, minHeight: 50, borderRadius: '50%' }}
            onClick={() => setShowAddAlarm(true)}
        >
            <span className="text-white text-2xl font-bold leading-none">+</span>
        </button>
    )
}

export default AddAlarmButton

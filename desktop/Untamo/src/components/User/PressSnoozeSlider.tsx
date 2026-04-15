import React, { useState } from 'preact/compat'
import { useSettings } from '../../stores'

function PressSnoozeSlider() {
    const [showTooltip, setShowTooltip] = useState(false)
    const snoozePress = useSettings((state) => state.snoozePress)
    const setSnoozePress = useSettings((state) => state.setSnoozePress)
    return (
        <div className="relative w-full pt-6">
            {/* tick marks */}
            <div className="flex justify-between text-xs px-1 mb-1 pointer-events-none select-none">
                <span>3</span>
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    className="range range-primary w-full"
                    min={3}
                    max={800}
                    value={snoozePress}
                    onChange={(e) => setSnoozePress(parseInt((e.target as HTMLInputElement).value))}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                    <div
                        className="absolute -top-7 bg-teal-500 text-white text-xs rounded px-2 py-0.5 pointer-events-none"
                        style={{ left: `${((snoozePress - 3) / (800 - 3)) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        {snoozePress} ms
                    </div>
                )}
            </div>
        </div>
    )
}

export default PressSnoozeSlider

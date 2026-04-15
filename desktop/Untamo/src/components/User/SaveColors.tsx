import React, { useState, useEffect } from 'preact/compat'
import { usePopups, useSettings } from "../../stores"

function SaveColorScheme() {
    const showSaveColorScheme = usePopups((state) => state.showSaveColorScheme)
    const setShowSaveColorScheme = usePopups((state) => state.setShowSaveColorScheme)
    const webColors = useSettings((state) => state.webColors)
    const setWebColors = useSettings((state) => state.setWebColors)
    const cardColors = useSettings((state) => state.cardColors)
    const [colorSchemeName, setColorSchemeName] = useState("")
    const [addEnabled, setAddEnabled] = useState(false)
    const [buttonName, setButtonName] = useState("Save Color Scheme")
    const [buttonColor, setButtonColor] = useState("btn-success")
    const [info, setInfo] = useState("")

    function onModalClose() {
        setShowSaveColorScheme(false)
    }

    function addColors() {
        setWebColors({ ...webColors, [colorSchemeName]: cardColors })
        setColorSchemeName("")
        setShowSaveColorScheme(false)
    }

    useEffect(() => {
        if (colorSchemeName.length > 0 && !["Light", "Dark"].includes(colorSchemeName) && colorSchemeName.length < 20) {
            setAddEnabled(true)
        } else {
            setAddEnabled(false)
        }
        if (Object.keys(webColors).includes(colorSchemeName)) {
            setButtonName("Overwrite")
            setButtonColor("btn-error")
            setInfo("This will overwrite the existing color scheme")
        } else {
            setButtonName("Save")
            setButtonColor("btn-success")
            setInfo("")
        }
        if (colorSchemeName.length >= 20) {
            setInfo("Name must be less than 20 characters")
        }
    }, [colorSchemeName])

    if (!showSaveColorScheme) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1020 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onModalClose}>✕</button>
                <h3 className="font-bold text-lg mb-4">Save Color Scheme</h3>
                <div className="form-control">
                    <input
                        className="input input-bordered w-full"
                        placeholder="Scheme name"
                        value={colorSchemeName}
                        onChange={(e) => setColorSchemeName((e.target as HTMLInputElement).value)}
                    />
                </div>
                {info && <p className="text-error text-sm mt-1">{info}</p>}
                <div className="modal-action">
                    <button className="btn btn-outline" onClick={onModalClose}>Cancel</button>
                    <button className={`btn ${buttonColor}`} disabled={!addEnabled} onClick={addColors}>
                        {buttonName}
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onModalClose} />
        </div>
    )
}

export default SaveColorScheme

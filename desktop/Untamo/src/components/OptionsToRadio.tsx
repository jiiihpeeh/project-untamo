import React from 'preact/compat'
import { capitalize, getKeyByValue } from "../utils"

interface Option<T> {
    [key: string]: T
}
interface OptionsRadioProps<T> {
    options:  Option<T>
    selectedOption: T
    setOption: (option: T) => void
    capitalizeOption: boolean
    sizeKey: string
}

function OptionsToRadio<T>({
    options,
    selectedOption,
    setOption,
    capitalizeOption = true,
    sizeKey = "md",
}: OptionsRadioProps<T>) {
    const selectedKey = getKeyByValue(options, selectedOption)
    const radioSizeClass = sizeKey === "sm" ? "radio-sm" : sizeKey === "lg" ? "radio-lg" : sizeKey === "xs" ? "radio-xs" : ""
    return (
        <div className="flex flex-row gap-3 flex-wrap">
            {Object.keys(options).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        className={`radio ${radioSizeClass}`}
                        checked={key === selectedKey}
                        onChange={() => setOption(options[key])}
                    />
                    <span>{capitalizeOption ? capitalize(key) : key}</span>
                </label>
            ))}
        </div>
    )
}

export default OptionsToRadio

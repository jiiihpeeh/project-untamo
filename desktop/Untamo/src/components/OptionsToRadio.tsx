import { Radio, RadioGroup, Stack } from "@chakra-ui/react"
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
    return (
      <RadioGroup value={getKeyByValue(options, selectedOption)} onChange={(value) => setOption(options[value])}>
      <Stack direction="row">
        {Object.keys(options).map((key) => (
          <Radio 
            key={key} 
            value={key}
            size={sizeKey} 
          >
            {capitalizeOption ? capitalize(key) : key}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  )
}
  
  export default OptionsToRadio
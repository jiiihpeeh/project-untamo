
import { HStack, RadioGroup, Radio } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'

const TimeFormat = () =>{
    const clock24 = useSettings((state) => state.clock24)
    const setTime24Format = useSettings((state) => state.setTime24Format)

    return (
            <RadioGroup>
                <HStack>
                    <Radio 
                        isChecked={clock24} 
                        onChange={()=>setTime24Format(!clock24)}
                    >
                        24 h
                    </Radio>
                    <Radio 
                        isChecked={!clock24} 
                        onChange={()=>setTime24Format(!clock24)}
                    >
                        12 h
                    </Radio>
                </HStack>
            </RadioGroup>
    )
}

export default TimeFormat
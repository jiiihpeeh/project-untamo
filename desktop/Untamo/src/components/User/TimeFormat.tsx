
import { HStack, RadioGroup, Radio } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'

const TimeFormat = () =>{
    const clock24 = useSettings((state) => state.clock24)
    const setClock24 = useSettings((state) => state.setClock24)

    return (
            <RadioGroup>
                <HStack>
                    <Radio 
                        isChecked={clock24} 
                        onChange={()=>setClock24(!clock24)}
                    >
                        24 h
                    </Radio>
                    <Radio 
                        isChecked={!clock24} 
                        onChange={()=>setClock24(!clock24)}
                    >
                        12 h
                    </Radio>
                </HStack>
            </RadioGroup>
    )
}

export default TimeFormat
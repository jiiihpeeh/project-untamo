
import { HStack, RadioGroup, Radio, Center, Spacer } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'
import { dialogSizes as sizes } from '../../stores/settingsStore'

function TimeFormat() {
    const clock24 = useSettings((state) => state.clock24)
    const setClock24 = useSettings((state) => state.setClock24)
    const size = useSettings((state) => state.dialogSize)

    return (
        <Center>
            <RadioGroup
                size={sizes.get(size)}
            >
                <HStack>
                    <Radio
                        isChecked={clock24}
                        onChange={() => setClock24(!clock24)}
                    >
                        24 h
                    </Radio>
                    <Spacer />
                    <Radio
                        isChecked={!clock24}
                        onChange={() => setClock24(!clock24)}
                    >
                        12 h
                    </Radio>
                </HStack>
            </RadioGroup>
        </Center>
    )
}

export default TimeFormat
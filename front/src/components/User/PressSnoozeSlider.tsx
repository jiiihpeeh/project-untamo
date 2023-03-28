import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark, Tooltip
  } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'
//https://chakra-ui.com/docs/components/slider/usage

function PressSnoozeSlider() {
    const [showTooltip, setShowTooltip] = React.useState(false)
    const snoozePress = useSettings((state) => state.snoozePress)
    const setSnoozePress = useSettings((state) => state.setSnoozePress)
    return (
      <Slider
        id='slider'
        defaultValue={snoozePress}
        min={10}
        max={600}
        colorScheme='teal'
        onChange={(v) => setSnoozePress(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={150} mt='1' ml='-2.5' fontSize='sm'>
          150 
        </SliderMark>
        <SliderMark value={300} mt='1' ml='-2.5' fontSize='sm'>
          300
        </SliderMark>
        <SliderMark value={450} mt='1' ml='-2.5' fontSize='sm'>
          450 
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg='teal.500'
          color='white'
          placement='top'
          isOpen={showTooltip}
          label={`${snoozePress} ms`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    )
}
export default PressSnoozeSlider
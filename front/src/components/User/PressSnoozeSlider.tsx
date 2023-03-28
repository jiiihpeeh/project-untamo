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
        min={3}
        max={800}
        colorScheme='teal'
        onChange={(v) => setSnoozePress(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={200} mt='1' ml='-2.5' fontSize='sm'>
          200 
        </SliderMark>
        <SliderMark value={400} mt='1' ml='-2.5' fontSize='sm'>
          400
        </SliderMark>
        <SliderMark value={600} mt='1' ml='-2.5' fontSize='sm'>
          600 
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
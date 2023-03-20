import { Button, Text, Tooltip, Link } from '@chakra-ui/react'
import React, { useEffect,  useState } from 'react'
import { useAlarms, usePopups } from '../../stores'


function AddAlarmButton() {

	const alarms = useAlarms((state)=>state.alarms)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
	const windowSize = usePopups((state)=>state.windowSize)

	const [ buttonPosition, setButtonPosition ] = useState<React.CSSProperties>({})

	const updatePosition = () =>{
		const element = document.getElementById("Alarm-Container")
		if(element){
			const rect = element.getBoundingClientRect()
			setButtonPosition(
								{
									top: rect.bottom  + window.scrollY,
									left: rect.right  + window.scrollX,
									position: "absolute"
								}
							)			
		}
	}

	useEffect(() => {
		updatePosition()
	},[alarms, windowSize])


	return (
		<Link 
            onClick={()=>setShowAddAlarm(true)}
        >
			<Tooltip 
				label='Add an alarm' 
				fontSize='md'
			>
            	<Button 
					size='xl' 
					ml="5.5%" 
					borderRadius={"50%"} 
                    colorScheme="green"
					width={"50px"} 
					height={"50px"}
					style={buttonPosition}
				>
					<Text
						color="white"
					>
						+ 
					</Text>
				</Button>
			</Tooltip>
		</Link>
	)
}

export default AddAlarmButton
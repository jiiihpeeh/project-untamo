import { Button, Text, Tooltip, Link, Box } from '@chakra-ui/react'
import React, { useEffect,  useState } from 'react'
import { useAlarms, usePopups, useSettings } from '../../stores'

interface Props{
	mounting: React.RefObject<HTMLDivElement>
}
function AddAlarmButton(props: Props) {
	const mounting = props.mounting
	const alarms = useAlarms((state)=>state.alarms)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
	const windowSize = usePopups((state)=>state.windowSize)
	const [ buttonPosition, setButtonPosition ] = useState<React.CSSProperties>({})
	const navBarTop = useSettings((state)=> state.navBarTop)

	const updatePosition = async() =>{
		if(mounting.current){
			const rect = mounting.current.getBoundingClientRect()
			let add = (windowSize.width-rect.right < 65)?-21:0
			setButtonPosition(
								{
									bottom: (navBarTop)?windowSize.height *0.05:windowSize.height *0.90 ,
									left: rect.right + add,								
									position: "fixed"
								}
							)			
		}
	}

	useEffect(() => {
		updatePosition()
	},[alarms, windowSize, mounting, navBarTop ])


	return (
			<Button 
				style={buttonPosition}
				size='xl' 
				//ml="5.5%" 
				borderRadius={"50%"} 
				colorScheme="green"
				width={"50px"} 
				height={"50px"}
				onClick={()=>setShowAddAlarm(true)}
				shadow={"dark-lg"}
			>
				<Text
					color="white"
				>
					+ 
				</Text>
			</Button>
	)
}

export default AddAlarmButton
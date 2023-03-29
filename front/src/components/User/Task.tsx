import {  Button,  ModalContent, ModalOverlay,  Text,VStack, Box, Modal, 
          ModalBody, ModalFooter, ModalHeader, NumberInput, NumberInputField } from '@chakra-ui/react'
import { usePopups, useTask } from '../../stores'
import React, { useState, useEffect } from 'react'
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { LaunchMode } from '../../stores/taskStore'
import { useSettings } from '../../stores'

enum Operator {
    Multiply="*",
    Sum ="+",
    Subtract='-'
}
interface Calculation{
    task: string
    result: number
}
function getInt(){
    return Math.floor(Math.random() * 20)
}
function getOperator(){
    let ops = Object.values(Operator).filter((i)=>i)
    return ops[Math.floor(Math.random() * ops.length)]
}

function generateCalculation(){
    let op = getOperator()
    let num1 = getInt()
    let num2 = getInt()
    let operation : Calculation = { task: "", result: 0 }
    switch(op){
        case Operator.Multiply:
            operation.result = num1 * num2
            operation.task = `${num1} \\cdot ${num2}`
            return operation
        case Operator.Sum:
            operation.result = num1 + num2
            operation.task = `${num1} + ${num2}`
            return operation
        case Operator.Subtract:
            operation.result = num1 - num2
            operation.task = `${num1} - ${num2}`
            return operation
    }
}
function Task() {
    const showTask = usePopups((state)=>state.showTask)
    const setShowTask = usePopups((state)=>state.setShowTask)
    const setSolved = useTask((state)=>state.setSolved)
    const setLaunchMode = useTask((state)=>state.setLaunchMode)
    const launchMode = useTask((state)=>state.launchMode)
    const solved = useTask((state)=>state.solved)
    const [ pressTime, setPressTime ] = useState(0)
    const snoozePressTime = useSettings((state)=>state.snoozePress)
    const [ calculationTask, setCalculationTask ] = useState<Calculation| null>(null)
    const [ isOK, setIsOK]  = useState<boolean>(false)

    function checkInput(e: number){
        if(!isNaN(e) && calculationTask && e ===calculationTask.result){
            setSolved(true)
            setTimeout(()=>setShowTask(false),400)
            setIsOK(true)
        }else{
            setIsOK(false)
        }
    }
    useEffect(() => {
        if(showTask){
            setCalculationTask(generateCalculation())
        }else{
            setCalculationTask(null)
        }
    },[showTask])
    useEffect(() => {
        if( launchMode === LaunchMode.None && calculationTask){
            if(solved && !showTask){
                setLaunchMode(LaunchMode.TurnOff)
            }else if(!solved && !showTask){
                setLaunchMode(LaunchMode.Snooze)
            }else{
                setLaunchMode(LaunchMode.None)
            }
        }

    },[solved, showTask])
    const snoozePressFunction = (time: number) =>{
        if((pressTime > 0) && (time - pressTime > snoozePressTime)){
            setLaunchMode(LaunchMode.Snooze)
            setShowTask(false)
            setPressTime(0)
        }
    }
    const userPressStart = (e:any)=>{
        e.preventDefault()
        setPressTime(Date.now())
    }
    const userPressStop = (e:any)=>{
        e.preventDefault()
        snoozePressFunction(Date.now())
    }
    return (
            <Modal
                isOpen={showTask}
                onClose={() => setShowTask(false)}
                closeOnEsc={false}
                closeOnOverlayClick={false}
                isCentered={true}
            >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Solve this
                </ModalHeader>
                <ModalBody>
                    <VStack 
                        spacing={2}
                    >
                    <Box>
                        <BlockMath>
                            {(calculationTask)?calculationTask.task:""}
                        </BlockMath>
                    </Box>
                    <Box>
                        <VStack>
                        <NumberInput>
                            <NumberInputField 
                                onChange={e=>checkInput( parseInt(e.target.value))}
                            />
                        </NumberInput>
                        <Text>
                            {isOK?"Correct":"Wrong"}
                        </Text>
                        </VStack>
                    </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button 
                        onMouseDown={userPressStart}
                        onMouseUp={userPressStop}
                        onTouchStart={userPressStart}
                        onTouchEnd={userPressStop}
                        background={"blue.300"}
                    >
                        Brain Freeze - Snooze
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default Task
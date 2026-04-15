import React, { useState, useEffect } from 'preact/compat'
import { usePopups, useTask, useSettings } from '../../stores'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import { LaunchMode } from '../../stores/taskStore'
import { sleep } from '../../utils'

enum Operator {
    Multiply = "*",
    Sum = "+",
    Subtract = '-'
}
interface Calculation {
    task: string
    result: number
}
function getInt() { return Math.floor(Math.random() * 20) }
function getOperator() {
    const ops = Object.values(Operator).filter(i => i)
    return ops[Math.floor(Math.random() * ops.length)]
}
function generateCalculation() {
    const op = getOperator()
    const num1 = getInt()
    const num2 = getInt()
    const operation: Calculation = { task: "", result: 0 }
    switch (op) {
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
    const showTask = usePopups((state) => state.showTask)
    const setShowTask = usePopups((state) => state.setShowTask)
    const setSolved = useTask((state) => state.setSolved)
    const setLaunchMode = useTask((state) => state.setLaunchMode)
    const launchMode = useTask((state) => state.launchMode)
    const solved = useTask((state) => state.solved)
    const [pressTime, setPressTime] = useState(0)
    const snoozePressTime = useSettings((state) => state.snoozePress)
    const [calculationTask, setCalculationTask] = useState<Calculation | null>(null)
    const [isOK, setIsOK] = useState<boolean>(false)

    async function closeSequence(ms: number) {
        await sleep(ms)
        setShowTask(false)
    }
    function checkInput(e: number) {
        if (!isNaN(e) && calculationTask && e === calculationTask.result) {
            setSolved(true)
            closeSequence(400)
            setIsOK(true)
        } else {
            setIsOK(false)
        }
    }
    useEffect(() => {
        if (showTask) setCalculationTask(generateCalculation())
        else setCalculationTask(null)
    }, [showTask])
    useEffect(() => {
        if (launchMode === LaunchMode.None && calculationTask) {
            if (solved && !showTask) setLaunchMode(LaunchMode.TurnOff)
            else if (!solved && !showTask) setLaunchMode(LaunchMode.Snooze)
            else setLaunchMode(LaunchMode.None)
        }
    }, [solved, showTask])
    const snoozePressFunction = (time: number) => {
        if (pressTime > 0 && time - pressTime > snoozePressTime) {
            setLaunchMode(LaunchMode.Snooze)
            setShowTask(false)
            setPressTime(0)
        }
    }
    const userPressStart = (e: any) => { e.preventDefault(); setPressTime(Date.now()) }
    const userPressStop = (e: any) => { e.preventDefault(); snoozePressFunction(Date.now()) }

    if (!showTask) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">Solve this</h3>
                <div className="flex flex-col items-center gap-4 py-2">
                    <div>
                        <BlockMath>{calculationTask ? calculationTask.task : ""}</BlockMath>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <input
                            className="input input-bordered w-32 text-center"
                            type="number"
                            onChange={(e) => checkInput(parseInt((e.target as HTMLInputElement).value))}
                        />
                        <span className={isOK ? "text-success font-bold" : "text-error"}>
                            {isOK ? "Correct" : "Wrong"}
                        </span>
                    </div>
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-primary"
                        onMouseDown={userPressStart}
                        onMouseUp={userPressStop}
                        onTouchStart={userPressStart}
                        onTouchEnd={userPressStop}
                    >
                        Brain Freeze - Snooze
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Task

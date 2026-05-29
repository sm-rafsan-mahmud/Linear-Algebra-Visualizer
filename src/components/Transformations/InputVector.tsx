import { useState } from "react"
import ApplyOrCancel from "./ConfirmOrCancel"

interface InputVectorProps {
    onNewVector: (x: number, y: number, z: number) => void
}

export default function InputVector({ onNewVector }: InputVectorProps) {
    const [xInput, setXInput] = useState('0')
    const [yInput, setYInput] = useState('0')
    const [zInput, setZInput] = useState('0')

    const newVector = () => {
        const x = parseFloat(xInput)
        const y = parseFloat(yInput)
        const z = parseFloat(zInput)
        if (isNaN(x) || isNaN(y) || isNaN(z)) return
        onNewVector(x, y, z)
        setXInput('0')
        setYInput('0')
        setZInput('0')
    }

    const cancelVector = () => {
        setXInput('0')
        setYInput('0')
        setZInput('0')
    }

    return (
        <div>
            <label>x:</label>
            <input
            value={xInput}
            onChange={e => setXInput(e.target.value)}
            />
            <label>y:</label>
            <input
            value={yInput}
            onChange={e => setYInput(e.target.value)}
            />
            <label>z:</label>
            <input
            value={zInput}
            onChange={e => setZInput(e.target.value)}
            />
            <ApplyOrCancel
            onClickConfirm={newVector}
            onClickCancel={cancelVector}
            />
        </div>
    )
}
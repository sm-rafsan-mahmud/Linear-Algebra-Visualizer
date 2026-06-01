import { useState } from "react"

interface TempTransformControlsProps {
    onScalarApply: (s: number) => void,
    onAddApply: () => void
}

export default function TempTransformControls({ onScalarApply, onAddApply }: TempTransformControlsProps) {
    const [sInput, setSInput] = useState('0')

    const scalarApply = () => {
        const s = parseFloat(sInput)
        if (isNaN(s)) return
        onScalarApply(s)
        setSInput('0')
    }

    return (
        <div>
            <label>Scalar Multiplication: s = </label>
            <input
              value={sInput}
              onChange={e => setSInput(e.target.value)}
            />
            <button onClick={scalarApply}>Apply</button>

            <label>Vector Addition</label>
            <button onClick={onAddApply}>Apply</button>
        </div>
    )
}
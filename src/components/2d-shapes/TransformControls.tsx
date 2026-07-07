import { useState } from 'react'
import ApplyOrCancel from './ApplyOrCancel'
import type { TransformationData, TransformationType } from '../../lib/types'

interface TransformControlsProps {
    onTransform: (type: TransformationType, data: TransformationData) => void,
    onReset: () => void,
    onNewShape: () => void
}

export default function TransformControls({ onTransform, onReset, onNewShape }: TransformControlsProps) {
    const [activeTransform, setActiveTransform] = useState<string | null>(null)
    const [txInput, setTxInput] = useState('0')
    const [tyInput, setTyInput] = useState('0')
    const [kInput, setKInput] = useState('0')
    const [tInput, setTInput] = useState('0')
    const [rfX, setRfX] = useState(false)
    const [rfY, setRfY] = useState(false)

    const handleTranslate = () => {
        const tx = parseFloat(txInput)
        const ty = parseFloat(tyInput)
        if (isNaN(tx) || isNaN(ty)) return
        onTransform('translation', { tx, ty })
        setActiveTransform(null)
        setTxInput('0')
        setTyInput('0')
    }

    const handleDilate = () => {
        const k = parseFloat(kInput)
        if (isNaN(k)) return
        onTransform('dilation', { k })
        setActiveTransform(null)
        setKInput('0')
    }

    const handleRotate = () => {
        const t = parseFloat(tInput)
        if (isNaN(t)) return
        onTransform('rotation', { t })
        setActiveTransform(null)
        setTInput('0')
    }

    const handleReflect = () => {
        onTransform('reflection', { rfX, rfY })
        setActiveTransform(null)
        setRfX(false)
        setRfY(false)
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTransform('translate')}>
                Translate
            </button>
            <button onClick={() => setActiveTransform('dilate')}>
                Dilate
            </button>
            <button onClick={() => setActiveTransform('rotate')}>
                Rotate
            </button>
            <button onClick={() => setActiveTransform('reflect')}>
                Reflect
            </button>
            <button onClick={onReset}>
                Reset
            </button>
            <button onClick={onNewShape}>
                New Shape
            </button>
            {activeTransform === 'translate' && (
                <div>
                    <label>x:</label>
                    <input
                        value={txInput}
                        onChange={e => setTxInput(e.target.value)}
                    />
                    <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>y:</label>
                    <input
                        value={tyInput}
                        onChange={e => setTyInput(e.target.value)}
                    />
                    <ApplyOrCancel onClickApply={handleTranslate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'dilate' && (
                <div>
                    <label>Factor:</label>
                    <input
                        value={kInput}
                        onChange={e => setKInput(e.target.value)}
                    />
                    <ApplyOrCancel onClickApply={handleDilate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'rotate' && (
                <div>
                    <label>Angle(rad):</label>
                    <input
                        value={tInput}
                        onChange={e => setTInput(e.target.value)}
                    />
                    <ApplyOrCancel onClickApply={handleRotate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'reflect' && (
                <div>
                    <label>x:</label>
                    <input
                        type="checkbox"
                        checked={rfX}
                        onChange={e => setRfX(e.target.checked)}
                    />
                    <label>y:</label>
                    <input
                        type="checkbox"
                        checked={rfY}
                        onChange={e => setRfY(e.target.checked)}
                    />
                    <ApplyOrCancel onClickApply={handleReflect} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
        </div>
    )
}
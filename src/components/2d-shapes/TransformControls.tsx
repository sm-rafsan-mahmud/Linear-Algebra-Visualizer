'use client'
import { useState } from 'react'
import ApplyOrCancel from './ApplyOrCancel'

interface TransformControlsProps {
    onTranslate: (tx: number, ty: number) => void,
    onDilate: (k: number) => void,
    onRotate: (t: number) => void,
    onReflect: (rfX: boolean, rfY: boolean) => void,
    onReset: () => void,
    onNewShape: () => void
}

export default function TransformControls({ onTranslate, onDilate, onRotate, onReflect, onReset, onNewShape }: TransformControlsProps) {
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
        onTranslate(tx, ty)
        setActiveTransform(null)
        setTxInput('0')
        setTyInput('0')
    }

    const handleDilate = () => {
        const k = parseFloat(kInput)
        if (isNaN(k)) return
        onDilate(k)
        setActiveTransform(null)
        setKInput('0')
    }

    const handleRotate = () => {
        const t = parseFloat(tInput)
        if (isNaN(t)) return
        onRotate(t)
        setActiveTransform(null)
        setTInput('0')
    }

    const handleReflect = () => {
        onReflect(rfX, rfY)
        setActiveTransform(null)
        setRfX(false)
        setRfY(false)
    }

    return (
        <div className="space-x-2">
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setActiveTransform('translate')}>
                Translate
            </button>
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setActiveTransform('dilate')}>
                Dilate
            </button>
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setActiveTransform('rotate')}>
                Rotate
            </button>
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setActiveTransform('reflect')}>
                Reflect
            </button>
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onReset}>
                Reset
            </button>
            <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onNewShape}>
                New Shape
            </button>
            {activeTransform === 'translate' && (
                <div className="mt-2 p-2 flex w-max items-center space-x-2 bg-blue-600 rounded">
                    <label className="text-sm font-bold text-white">x:</label>
                    <input
                        value={txInput}
                        onChange={e => setTxInput(e.target.value)}
                        className="w-16 border rounded px-1 py-0.5 text-sm text-white"
                    />
                    <label className="text-sm font-bold text-white">y:</label>
                    <input
                        value={tyInput}
                        onChange={e => setTyInput(e.target.value)}
                        className="w-16 border rounded px-1 py-0.5 text-sm text-white"
                    />
                    <ApplyOrCancel onClickApply={handleTranslate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'dilate' && (
                <div className="mt-2 p-2 flex w-max items-center space-x-2 bg-blue-600 rounded">
                    <label className="text-sm font-bold text-white">Factor:</label>
                    <input
                        value={kInput}
                        onChange={e => setKInput(e.target.value)}
                        className="w-16 border rounded px-1 py-0.5 text-sm text-white"
                    />
                    <ApplyOrCancel onClickApply={handleDilate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'rotate' && (
                <div className="mt-2 p-2 flex w-max items-center space-x-2 bg-blue-600 rounded">
                    <label className="text-sm font-bold text-white">Angle(rad):</label>
                    <input
                        value={tInput}
                        onChange={e => setTInput(e.target.value)}
                        className="w-16 border rounded px-1 py-0.5 text-sm text-white"
                    />
                    <ApplyOrCancel onClickApply={handleRotate} onClickCancel={() => setActiveTransform(null)} />
                </div>
            )}
            {activeTransform === 'reflect' && (
                <div className="mt-2 p-2 flex w-max items-center space-x-2 bg-blue-600 rounded">
                    <label className="text-sm font-bold text-white">x:</label>
                    <input
                        type="checkbox"
                        checked={rfX}
                        onChange={e => setRfX(e.target.checked)}
                    />
                    <label className="text-sm font-bold text-white">y:</label>
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
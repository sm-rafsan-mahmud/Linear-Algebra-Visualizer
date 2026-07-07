import { useState } from "react"
import type { TransformationType } from "../../lib/types"

interface AddTransformProps {
    onSelect: (type: TransformationType) => void
}

export default function AddTransform({ onSelect }: AddTransformProps) {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {/* Main button — triggers dropdown on click. */}
            <button onClick={() => setOpen(prev => !prev)}>
                Add New Transformation
            </button>

            {/* Dropdown — renders when open */}
            {open && (
                <div style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: 0,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "4px",
                    zIndex: 50,
                    display: "grid",
                    gridTemplateColumns: "1fr"
                }}>
                    <button onClick={() => { onSelect('identity'); setOpen(false); }} style={{ width: "100%" }}>Default</button>
                    <button onClick={() => { onSelect('translation'); setOpen(false); }} style={{ width: "100%" }}>Translate</button>
                    <button onClick={() => { onSelect('dilation'); setOpen(false); }} style={{ width: "100%" }}>Dilate</button>
                    <button onClick={() => { onSelect('rotation'); setOpen(false); }} style={{ width: "100%" }}>Rotate</button>
                    <button onClick={() => { onSelect('shear'); setOpen(false); }} style={{ width: "100%" }}>Shear</button>
                    <button onClick={() => { onSelect('squeeze'); setOpen(false); }} style={{ width: "100%" }}>Squeeze</button>
                    <button onClick={() => { onSelect('reflection'); setOpen(false); }} style={{ width: "100%" }}>Reflect</button>
                </div>
            )}
        </div>
    )
}
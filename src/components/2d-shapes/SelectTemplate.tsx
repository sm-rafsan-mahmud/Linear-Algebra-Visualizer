import { useState } from "react"
import type { TransformationType } from "../../lib/types"

interface SelectTemplateProps {
    onSelect: (type: TransformationType) => void
}

export default function SelectTemplate({ onSelect }: SelectTemplateProps) {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <div style={{ position: "relative", display: "inline-block", width: 150, marginLeft: 12, marginRight: "auto" }}>
            {/* Main button — triggers dropdown on click. */}
            <button style={{ width: "100%" }} onClick={() => setOpen(prev => !prev)}>
                Choose a Template
            </button>

            {/* Dropdown — renders when open */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)",
                    left: "50%", transform: "translateX(-50%)", 
                    width: 110, background: "#1e293b",
                    border: "1px solid #334155", borderRadius: 8,
                    padding: "4px", zIndex: 50,
                    display: "grid", gridTemplateColumns: "1fr"
                }}>
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
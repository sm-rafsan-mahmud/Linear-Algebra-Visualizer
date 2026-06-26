import { useEffect, useRef, useState } from 'react'

const DEFAULT_COLORS = [
    "#E74C3C", "#3498DB", "#2ECC71",
    "#F1C40F", "#9B59B6", "#E67E22"
]

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
    const dropDownRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropDownRef.current && !dropDownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, []) // <-- add this

    return (
        <div ref={dropDownRef} style={{ position: "relative", display: "inline-block" }}>

            {/* Trigger button — shows current color */}
            <button
                onClick={() => setOpen(prev => !prev)}
                style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: value,
                    border: "2px solid #555",
                    cursor: "pointer",
                }}
            />

            {/* Dropdown — only renders when open */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: 8,
                    zIndex: 50,
                }}>
                    {/* Default color swatches */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "6px",
                    }}>
                        {DEFAULT_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => { onChange(color); setOpen(false); }}
                                style={{
                                    width: 28, height: 28,
                                    borderRadius: "50%",
                                    background: color,
                                    border: value === color ? "2px solid white" : "2px solid transparent",
                                    outline: value === color ? "2px solid #555" : "none",
                                    cursor: "pointer",
                                }}
                            />
                        ))}
                    </div>

                    {/* Custom color input */}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            style={{ width: "80%", cursor: "pointer", height: 28 }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
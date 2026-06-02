import React, { useState } from 'react';


type cellProps = {
    row: number;
    value: string;
    cellHeight: string | number;
    cellWidth: string | number;
    onCellChange: (row: number, newValue: string) => void;
    onFocus?: (row: number) => void;
    onBlur?: (row: number) => void;
}

export const Cell=({ row, value, cellHeight, cellWidth, onCellChange, onFocus, onBlur }: cellProps) => {
    const [rawValue, setRawValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setRawValue(newValue);
        onCellChange(row, newValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
        setDisplayValue(rawValue);
        onFocus?.(row);
    }; 

    const handleBlur = () => {
       setIsFocused(false);
       try {
            // Evaluates mathematical expressions like "2 + 2" or "10 * 5"
            const result = rawValue || "0";
            setDisplayValue(String(result));
            setHasError(false);
       } catch(e) {
            // Safe fallback logic if user enters unparsable text
            setHasError(true);
            setDisplayValue(rawValue);
       }
       onBlur?.(row);
    };

    return (
        <div style={{
            width: cellWidth,
            height: cellHeight,
            display: "flex",
            alignItems: "left",
            justifyContent: "center",
            border: hasError ? "2px solid #c14444" : "1px solid #444",
            backgroundColor: "#d7d7d7",
            color: "#03b8ff",
            boxSizing: "border-box"
        }}>
            <input 
                type="text" 
                value={isFocused ? rawValue : displayValue} 
                onChange={handleChange} 
                onFocus={handleFocus} 
                onBlur={handleBlur}  
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    fontSize: "1rem",
                    outline: "none",
                    color: "#000"
                }}
            />

        </div>
    );
}
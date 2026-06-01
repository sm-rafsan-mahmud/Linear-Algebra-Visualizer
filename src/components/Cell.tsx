import React, { useState } from 'react';
import { evaluate } from 'mathjs';

//layout constants 
const CELL_HEIGHT = "60px";
const CELL_WIDTH = "350px" 

type cellProps = {
    row: number;
    col: number;
    value: string;
    onCellChange: (row: number, col: number, newValue: string) => void;
    onFocus?: (row: number, col: number) => void;
    onBlur?: (row: number, col: number) => void;
}

export const Cell=({ row, col, value, onCellChange, onFocus, onBlur }: cellProps) => {
    const [rawValue, setRawValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setRawValue(newValue);
        onCellChange(row, col, newValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
        setDisplayValue(rawValue);
        onFocus?.(row, col);
    }; 

    const handleBlur = () => {
       setIsFocused(false);
       try {
            // Evaluates mathematical expressions like "2 + 2" or "10 * 5"
            const result = evaluate(rawValue || "0");
            setDisplayValue(String(result));
            setHasError(false);
       } catch(e) {
            // Safe fallback logic if user enters unparsable text
            setHasError(true);
            setDisplayValue(rawValue);
       }
       onBlur?.(row, col);
    };

    return (
        <div style={{
            width: CELL_WIDTH,
            height: CELL_HEIGHT,
            display: "flex",
            alignItems: "left",
            justifyContent: "center",
            border: hasError ? "2px solid #f5f0f0" : "1px solid #444",
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
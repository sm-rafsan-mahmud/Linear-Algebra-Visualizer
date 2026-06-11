import React from "react";
import { useState } from "react";

type MatrixEntryProps = {
  row: number;
  col: number;
  value: string;
  entryBoxSize: string | number;
  onEntryChange: (row: number, col: number, newValue: string) => void;
  onFocus?: (row: number, col: number) => void;
  onBlur?: (row: number, col: number) => void;
};

export const MatrixEntry = ({
  row,
  col,
  value,
  entryBoxSize,
  onEntryChange,
  onFocus,
  onBlur
}: MatrixEntryProps) => {

    const [rawValue, setRawValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    //const [hasError, setHasError] = useState(false);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
           const newValue = e.target.value;
           setRawValue(newValue);
           onEntryChange(row, col, newValue);
        }; 
    const handleFocus = () => {
        setIsFocused(true);
        setDisplayValue(rawValue);
        onFocus?.(row,col);
    }; 

    const handleBlur = () => {
       setIsFocused(false);
       try {
            // Evaluates mathematical expressions like "2 + 2" or "10 * 5"
            const result = rawValue || "0";
            setDisplayValue(String(result));
            //setHasError(false);
       } catch(e) {
            // Safe fallback logic if user enters unparsable text
            //setHasError(true);
            setDisplayValue(rawValue);
       }
       onBlur?.(row, col);
    };

  return (
    <div
      style={{
        width: entryBoxSize,
        height: entryBoxSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #444",
        backgroundColor: "#7d6767",
        boxSizing: "border-box",
      }}
    >
      <input
        value= {isFocused ? rawValue : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
          textAlign: "center",
          fontSize: "1rem",
          outline: "none",
          color: "#000",
        }}
      />
    </div>
  );
};
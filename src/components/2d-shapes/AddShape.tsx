'use client'
interface AddShapeProps {
    onClick: () => void;
    label: string;
}

export default function AddShape({ onClick, label }: AddShapeProps) {
    return (
        <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClick}
        >
            {label}
        </button>
    )
}
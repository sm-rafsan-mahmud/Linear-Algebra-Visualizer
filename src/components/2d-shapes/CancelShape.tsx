'use client'
interface CancelShapeProps {
    onClick: () => void;
}

export default function CancelShape({ onClick }: CancelShapeProps) {
    return (
        <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClick}
        >
            Cancel
        </button>
    )
}
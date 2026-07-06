interface CancelShapeProps {
    onClick: () => void;
}

export default function CancelShape({ onClick }: CancelShapeProps) {

    return (
        <button onClick={onClick}>
            Cancel
        </button>
    )
}
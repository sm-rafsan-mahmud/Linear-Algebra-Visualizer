interface AddShapeProps {
    onClick: () => void;
    label: string;
}

export default function AddShape({ onClick, label }: AddShapeProps) {
    return (
        <button onClick={onClick}>
            {label}
        </button>
    )
}
interface ApplyOrCancelProps {
    onClickApply: () => void,
    onClickCancel: () => void
}

export default function ApplyOrCancel({ onClickApply, onClickCancel }: ApplyOrCancelProps) {

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClickApply}>
                Apply
            </button>
            <button onClick={onClickCancel}>
                Cancel
            </button>
        </div>
    )
}
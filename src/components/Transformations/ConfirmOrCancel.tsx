interface ConfirmOrCancelProps {
    onClickConfirm: () => void,
    onClickCancel: () => void
}

export default function ConfirmOrCancel({ onClickConfirm, onClickCancel }: ConfirmOrCancelProps) {
    return (
        <div>
            <button
                onClick={onClickConfirm}>
                Confirm
            </button>
            <button
                onClick={onClickCancel}>
                Cancel
            </button>
        </div>
    )
}
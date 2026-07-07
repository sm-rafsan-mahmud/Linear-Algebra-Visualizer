export function identity(size: number): number [][] {
    const matrix: number[][] = []

    for (let i = 0; i < size; i++) {
        const row: number[] = []
        for (let j = 0; j < size; j++) {
            if (j === i) row.push(1)
            else row.push(0)
        }
        matrix.push(row)
    }

    return matrix
}

export function translation(tx: number, ty: number): number[][] {
    return [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1]
    ]
}

export function dilation(k: number): number[][] {
    return [
        [k, 0],
        [0, k]
    ]
}

export function rotation(t: number): number[][] {
    return [
        [Math.cos(t), -Math.sin(t)],
        [Math.sin(t), Math.cos(t)]
    ]
}

export function shear(mx: number, my: number): number[][] {
    return [
        [1, mx],
        [my, 1]
    ]
}

export function squeeze(kx: number, ky: number): number[][] {
    return [
        [kx, 0],
        [0, ky]
    ]
}

export function reflection(rfX: boolean, rfY: boolean): number[][] {
    let x, y

    if (rfX) {
        x = -1
    } else x = 1

    if (rfY) {
        y = -1
    } else y = 1

    // x and y seem backwards here because taking -1 * x is really
    // a reflection over the y axis: y values stay constant and
    // x values switch parity.
    return [
        [y, 0],
        [0, x]
    ]
}
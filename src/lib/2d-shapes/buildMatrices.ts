function fmt(n: number, decimals = 4): string {
  const fixed = n.toFixed(decimals)
  return fixed.replace(/\.?0+$/, '') || '0'
}

export function identity(size: number): string[][] {
    const matrix: string[][] = []

    for (let i = 0; i < size; i++) {
        const row: string[] = []
        for (let j = 0; j < size; j++) {
            if (j === i) row.push('1')
            else row.push('0')
        }
        matrix.push(row)
    }

    return matrix
}

export function translation(tx: number, ty: number): string[][] {
    return [
        ['1', '0', fmt(tx)],
        ['0', '1', fmt(ty)],
        ['0', '0', '1']
    ]
}

export function dilation(k: number): string[][] {
    return [
        [fmt(k), '0'],
        ['0', fmt(k)]
    ]
}

export function rotation(angleDeg: number): string[][] {
  return [
    [`cos(${angleDeg} deg)`, `-sin(${angleDeg} deg)`],
    [`sin(${angleDeg} deg)`,  `cos(${angleDeg} deg)`]
  ]
}

export function shear(mx: number, my: number): string[][] {
    return [
        ['1', fmt(mx)],
        [fmt(my), '1']
    ]
}

export function squeeze(kx: number, ky: number): string[][] {
    return [
        [fmt(kx), '0'],
        ['0', fmt(ky)]
    ]
}

export function reflection(rfX: boolean, rfY: boolean): string[][] {
    let x, y

    if (rfX) {
        x = '-1'
    } else x = '1'

    if (rfY) {
        y = '-1'
    } else y = '1'

    // x and y seem backwards here because taking -1 * x is really
    // a reflection over the y axis: y values stay constant and
    // x values switch parity.
    return [
        [y, '0'],
        ['0', x]
    ]
}
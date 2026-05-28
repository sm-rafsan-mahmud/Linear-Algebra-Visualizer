'use client'
import type { Page } from '../lib/types'
import { useTransformations } from '../hooks/useTransformations'

type Props = {
  onNavigate: (page: Page) => void
}

export default function Transformations({ onNavigate }: Props) {
    const {
        mountRef
    } = useTransformations();
    

    return (
        <div>
            <div ref={mountRef} className="w-full h-full"/>
            
            <button onClick={() => onNavigate('home')}> Back</button>
        </div>
    )
}
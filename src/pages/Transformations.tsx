import './Transformations.css'
import type { Page } from '../lib/types'
import { useTransformations } from '../hooks/useTransformations'
import InputVector from '../components/Transformations/InputVector'

type Props = {
  onNavigate: (page: Page) => void
}

export default function Transformations({ onNavigate }: Props) {
    const {
        mountRef,
        newVector
    } = useTransformations();
    

    return (
        <div id="container">
            <div id="scene" ref={mountRef} className="w-full h-full"/>

            <div id="controls">
                <button onClick={() => onNavigate('home')}> Back</button>
                <InputVector onNewVector={newVector}/>
            </div>
        </div>
    )
}
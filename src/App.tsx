import { useState } from 'react';
import TransformationPage from './pages/TransformationPage';
import ShapesPage from './pages/ShapesPage';
import type { Page } from './lib/types';
import './App.css'

export default function App() {
  const [page, setPage] = useState<Page>('transformations')

  const changePage = (nextPage: Page) => {
    setPage(nextPage)
  }
  
    return (
        <div>
            {page === 'transformations'
                ? <TransformationPage swapPage={(nextPage) => changePage(nextPage)} />
                : <ShapesPage swapPage={(nextPage) => changePage(nextPage)}/>}
        </div>
    );
}
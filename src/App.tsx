import { useEffect, useState } from 'react'
import HomePage from "./pages/HomePage"
import Transformations from "./pages/Transformations"
import './App.css'
import type { Page } from './lib/types'

export default function App() {
  // setting it up with session storage allows the page to remain on refresh
  // however, closing and reopening the site will return to the home page.
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = sessionStorage.getItem('currentPage');
    return (saved as Page) ?? 'home';
  });

  useEffect(() => {
        sessionStorage.setItem('currentPage', currentPage)
    }, [currentPage])

  if (currentPage === 'transformations') {
    return <Transformations onNavigate={setCurrentPage} />;
  }
  return <HomePage onNavigate={setCurrentPage} />;
}
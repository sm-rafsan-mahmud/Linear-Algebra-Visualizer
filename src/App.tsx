import { useState } from 'react'
import HomePage from "./pages/HomePage"
import Transformations from "./pages/Transformations"
import './App.css'
import type { Page } from './lib/types'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (currentPage === 'transformations') {
    return <Transformations onNavigate={setCurrentPage} />;
  }
  return <HomePage onNavigate={setCurrentPage} />;
}
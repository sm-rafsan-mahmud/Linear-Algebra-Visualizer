import { useState } from "react";
import type { Page } from "./lib/types";
import Transformations from "./pages/TransformationPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('transformations');

  return (
    <div>
      <Transformations onNavigate={setCurrentPage} />
    </div>
  )
}
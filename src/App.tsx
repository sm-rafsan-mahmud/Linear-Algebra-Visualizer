import type { Page } from "./lib/types";
import Transformations from "./pages/Transformations";

export default function App() {

  return (
    <div>
      <Transformations onNavigate={function (page: Page): void {
        throw new Error("Function not implemented.");
      } } />
    </div>
  )
}
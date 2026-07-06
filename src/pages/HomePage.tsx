import { useState } from "react";
import type { Page } from "../lib/types";
import TransformationPage from "./TransformationPage";
import ShapesPage from "./ShapesPage";

export default function HomePage() {
    const [page, setPage] = useState<Page>("transformations")

    return (
        <>
            {page === "transformations"
                ? <TransformationPage swapPage={(nextPage) => {
                    console.log("setting page: " + nextPage)
                    setPage(nextPage)
                }} />
                : <ShapesPage swapPage={(page) => setPage(page)}/>}
        </>
    );
}

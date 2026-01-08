"use client";

import { LayoutGrid, Loader, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashBoardButton() {
    const [clicked, setClicked] = useState(false);
    return (
        <>
            <Link
                href="/dashboard"
                onClick={() => setClicked(true)}
            >
                <button
                    className={`px-6 py-2 ${clicked?  "bg-yellow-350 cursor-wait": "bg-yellow-500 hover:bg-yellow-400"} text-black rounded-small font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30 w-full flex items-center justify-center gap-2 cursor-pointer`}
                    disabled={clicked}
                >
                    <LayoutGrid />Dashboard
                </button>
            </Link>
        </>
    )
}
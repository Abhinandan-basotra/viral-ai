import { useState } from "react"

export default function GetStartedButton() {
    const [clicked, setClicked] = useState(false);
    return (
        <button 
        className={`${clicked ? "cursor-wait": "cursor-pointer"}px-10 py-5 bg-yellow-500 text-black rounded-full text-xl font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-500/30`}
        disabled={clicked}
        >
            Get Started Free
        </button>
    )
}
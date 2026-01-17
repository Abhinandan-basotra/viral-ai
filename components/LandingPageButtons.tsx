"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LandingPageButtons({name}: {name: string}) {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        if(name == "Logout"){
            signOut({redirect: true, callbackUrl: '/'});
        }
    }
    return (
        <button
            className={`${clicked ? "cursor-wait" : "cursor-pointer"} px-5 py-2 transition-colors duration-300 font-medium ${name === "Get Started" ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-transparent text-white hover:text-yellow-400"} border border-yellow-600 rounded-full`}
            onClick={handleClick}
            disabled={clicked}
        >
            {name}
        </button>
    )
}
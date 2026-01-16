'use client';
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogOut() {
    const [clicked, setClicked] = useState(false);
    return (
        <div>
            <button
                className={`${clicked ? "cursor-wait" : "cursor-pointer"} px-5 py-2 text-white hover:text-yellow-400 transition-colors duration-300 font-medium bg-transparent border border-yellow-600 rounded-ful`}
                onClick={() => {signOut({redirect: true, callbackUrl: '/'}); setClicked(true)}}
                disabled={clicked}
            >
                Logout
            </button>
        </div>
    )
}
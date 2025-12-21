import { getServerSession } from "next-auth"
import React from "react";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChildComponent from "./ChildComponent";

export default async function DashboardPage(){
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.name || !session.user.email){
        redirect('/login')
    }
    
    return(
        <>
            <ChildComponent name={session.user.name} email={session.user.email}/>
        </>
    )
}
import { getServerSession } from "next-auth"
import React from "react";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChildComponent from "./ChildComponent";
import { getProjects } from "@/app/actions/getProjects";
import { toast } from "react-toastify";

export default async function DashboardPage(){
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.name || !session.user.email){
        redirect('/login')
    }

    const data = await getProjects();
    if(!data.success) toast.error(data.message);
    
    const projects = data.projects?.map(project => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
    })) || [];
    
    return(
        <>
            <ChildComponent name={session.user.name} email={session.user.email} projects={projects}/>
        </>
    )
}
import { getServerSession } from "next-auth"
import React from "react";
import { redirect } from "next/navigation";
import ChildComponent from "./ChildComponent";
import { getProjects } from "@/app/actions/getProjects";
import { getVoices } from "@/app/actions/getVoices";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Project } from "./DashboardSidebarContent";

export default async function DashboardPage(){
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.name || !session.user.email){
        redirect('/login')
    }

    const data = await getProjects();
    
    const projects = data.projects?.map((project: Project )=> ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
    })) || [];

    const voices = await getVoices();
    
    return(
        <>
            <ChildComponent name={session.user.name} email={session.user.email} projects={projects} voices={voices || null}/>
        </>
    )
}
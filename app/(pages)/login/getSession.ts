'use server';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function getUser(){
    const user = await getServerSession(authOptions);
    return user;
}

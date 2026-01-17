'use server';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";

export async function getUser(){
    const user = await getServerSession(authOptions);
    return user;
}

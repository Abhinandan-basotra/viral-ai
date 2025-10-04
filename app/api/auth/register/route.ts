import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function POST(req: NextRequest){
    try {
        const data = await req.json();
        const username = data.username;
        const email = data.email;
        const password = data.password;

        const existing = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(existing) return NextResponse.json({message: "User exists already", success: false}, {status: 404})
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: password
            }
        })

        return NextResponse.json({message: "User Registered", success: true, user}, {status: 200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false})
    }
}
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { toast } from "react-toastify";

export default function SignUp() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/register", {
        method: 'POST',
        body: JSON.stringify({
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password")
        }),
      });
    const data = await res.json();
    if(!data.success) toast.error(data.message);
    else toast.success(data.message);
    
    } catch (error) {
      console.error("❌ Registration failed:", error);
    }finally{
        redirect("/login");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-1/4 h-[65%] flex flex-col border border-gray-500 rounded-2xl"
      >
        <span className="ml-[32%] mt-10 text-2xl font-bold">Sign Up Form</span>
        <div className="p-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter Username"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="cursor-pointer bg-gray-500 w-1/2 ml-[25%] mt-4"
        >
          Sign up
        </Button>
      </form>
    </div>
  );
}

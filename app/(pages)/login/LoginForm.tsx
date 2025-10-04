"use client";
import { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Login successful");
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-1/4 h-1/2 flex flex-col border border-gray-500 rounded-2xl"
      >
        <span className="ml-[32%] mt-10 text-2xl font-bold">Login Form</span>
        <div className="p-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </div>
        <Button type="submit" className="cursor-pointer bg-gray-500 w-1/2 ml-[25%] mt-4">
          Login
        </Button>
      </form>
    </div>
  );
}

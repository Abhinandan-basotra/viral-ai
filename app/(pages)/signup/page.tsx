"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { redirect } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "react-toastify";
import { Video, Mail, Lock, User, Sparkles } from "lucide-react";

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
    } finally {
      redirect("/login");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Video className="w-7 h-7 text-black" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              ViralAI
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-yellow-600/20 rounded-2xl shadow-2xl shadow-yellow-500/10 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 border border-yellow-600/50 rounded-full bg-yellow-600/10 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-yellow-500 text-sm font-medium">Start Creating Today</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join thousands of creators making viral content</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-yellow-600/20 rounded-lg text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-yellow-600/20 rounded-lg text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-yellow-600/20 rounded-lg text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
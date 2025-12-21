"use client";
import CreateVideo from "@/components/CreateVideo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Calendar, ChevronUp, Home, Inbox, Search, Settings, User2, Video } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ChildComponent({email, name}:{
  email: string,
  name: string 
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const words = [
    {
      text: "Welcome",
      className: 'text-white'
    },
    {
      text: "to",
      className: 'text-white'
    },
    {
      text: "the",
      className: 'text-white'
    },
    {
      text: "Dashboard.",
      className: "text-yellow-500 font-bold",
    },
  ];

  return (
    <>
      {show ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <TypewriterEffect words={words} />
        </div>
      ) : (
        <>
          <SidebarProvider>
            <SidebarComponent name={name} email={email}/>
            <main className="flex-1">
              <div className="p-4">
                <SidebarTrigger />
                <CreateVideo />
              </div>
            </main>
          </SidebarProvider>
        </>
      )}
    </>
  );
}

function SidebarComponent({name, email} : {name: string, email: string}) {
  const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];
  return (
    <>
      <Sidebar>
        <SidebarHeader
          className="mt-4 ml-2"
        >
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Video className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              ViralAI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg">My Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(items.length > 0) ? items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )) : <>
                  <div className="mt-5 ml-2 text-sm text-gray-200">
                    <p>No projects found.</p>
                  </div>
                </>}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mb-4 px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-12 hover:bg-yellow-500/10 transition-colors bg-yellow-900/20 ">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                        <User2 className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex flex-col items-start overflow-hidden flex-1">
                        <span className="text-sm font-semibold text-white truncate">{name}</span>
                        <span className="text-xs text-gray-400 truncate">{email}</span>
                      </div>
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] mb-2"
                >
                  <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400" onClick={() => signOut()}>
                      <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
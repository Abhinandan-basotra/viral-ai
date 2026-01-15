"use client";
import CreateVideo from "@/components/CreateVideo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { BASE_URL } from "@/lib/constants";
import { ChevronUp, Loader, Trash, User2, Video } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteVideo } from "../../actions/DeleteVideoPermanently";

export default function ChildComponent({ email, name }: {
  email: string,
  name: string
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem("visited-dashboard-page");
    if (!visited) {
      setShow(true);
      sessionStorage.setItem('visited-dashboard-page', 'true');
    }
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
            <SidebarComponent name={name} email={email} />
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

interface Project {
  status: string;
  id: string;
  userId: number;
  title: string;
  description: string | null;
  script: string;
  progress: number;
  finalUrl: string | null;
  expectedLength: number | null;
  createdAt: string;
  updatedAt: string;
}

export function SidebarComponent({ name, email }: { name: string, email: string }) {
  const [projects, setProjects] = useState<Project[]>();
  const [loading, setLoading] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [isTrashClicked, setIsTrashClicked] = useState<boolean>(false)
  useEffect(() => {
    const getProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/v1/projects`, {
          method: "GET",
          headers: {
            "Accept-type": "application/json",
          },
        });
        const data = await res.json();
        const params = new URLSearchParams(window.location.search);
        const discardedId = params.get("discarded");
        const sortedProjects = [...data.projects].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        const filteredProjects = discardedId
          ? sortedProjects.filter(p => p.id !== discardedId)
          : sortedProjects;
        setProjects(filteredProjects)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getProjects();
  }, []);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }



  const handleDeleteVideo = async (projectId: string) => {
    try {
      await deleteVideo(projectId, '');
      setProjects(prev => prev?.filter(p => p.id != projectId));
    } catch (error) {
      console.log(error);
    } finally {
      setIsTrashClicked(false)
    }
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader
          className="mt-4 ml-2"
        >
          <Link href='/'>
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                ViralAI
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg">My Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-6">
                {loading ? (
                  <ProjectSkeleton />
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild>
                        <div
                          className="group flex items-center justify-between w-full px-2 py-2 rounded-md transition-colors hover:bg-zinc-800"
                          onMouseEnter={() => setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                        >
                          <div className="flex flex-col overflow-hidden flex-1 min-w-0 mr-2">
                            <a
                              href={`/finalVideo?projectId=${project.id}`}
                              className="truncate text-sm font-medium text-white hover:text-yellow-400 transition-colors"
                            >
                              {project.title}
                            </a>
                            <span
                              className={`text-xs text-zinc-400 transition-all duration-200 ease-out ${hoveredProjectId === project.id
                                ? 'opacity-100 max-h-4'
                                : 'opacity-0 max-h-0'
                                }`}
                            >
                              {formatDate(project.updatedAt)}
                            </span>
                          </div>
                          <div className="shrink-0">
                            {hoveredProjectId === project.id && (
                              isTrashClicked ? (
                                <Loader className="w-4 h-4 animate-spin text-red-400" />
                              ) : (
                                <Trash
                                  className="cursor-pointer w-4 h-4 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-sm p-0.5 transition-all"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsTrashClicked(true);
                                    handleDeleteVideo(project.id);
                                  }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                  ))
                ) : (
                  <div className="mt-4 px-3 text-sm text-gray-400">
                    No projects found.
                  </div>
                )}
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
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
                        <User2 className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex flex-col items-start overflow-hidden flex-1">
                        <span className="text-sm font-semibold text-white truncate">{name}</span>
                        <span className="text-xs text-gray-400 truncate">{email}</span>
                      </div>
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
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

function ProjectSkeleton() {
  return (
    <div className="space-y-2 px-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md px-3 py-2"
        >
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-full max-w-35" />
        </div>
      ))}
    </div>
  );
}

import { getProjects } from "@/app/actions/getProjects";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader, Trash } from "lucide-react";
import { toast } from "react-toastify";

export interface Project {
  progress: number;
  id: string;
  userId: string;
  title: string;
  description: string | null;
  script: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  expectedLength: number | null;
  finalUrl: string | null;
  tuneId: number | null;
  hasTune: boolean;
  hasCaption: boolean;
};

export default async function DashboardSidebarContent() {
  let loading = true;
  const data = await getProjects();
  loading = false;
  const projects = data.projects;
  if (!data.success) toast.error(data.message);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-lg">My Projects</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="mt-6">
            {loading ? (
              <ProjectSkeleton />
            ) : projects && projects.length > 0 ? (
              projects.map((project: Project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton>
                    <div
                      className="group flex items-center justify-between w-full px-2 py-2 rounded-md transition-colors hover:bg-zinc-800"

                    >
                      <div className="flex flex-col overflow-hidden flex-1 min-w-0 mr-2">
                        <a
                          href={`/finalVideo?projectId=${project.id}`}
                          className="truncate text-sm font-medium text-white hover:text-yellow-400 transition-colors"
                        >
                          {project.title}
                        </a>
                        <span
                          className={`text-xs text-zinc-400 transition-all duration-200 ease-out opacity-0 max-h-0`}
                        >
                          {formatDate(String(project.updatedAt))}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <Loader className="w-4 h-4 animate-spin text-red-400" />

                        <Trash
                          className="cursor-pointer w-4 h-4 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-sm p-0.5 transition-all"

                        />


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
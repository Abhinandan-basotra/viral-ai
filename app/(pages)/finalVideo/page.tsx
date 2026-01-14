"use client";
import Scene from "@/components/Scene";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ScrollAreaPro } from "@/components/ui/scroll-areapro";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Progress } from "@/components/ui/progress";
import ShinyText from "@/components/ui/ShinyText"
import GradientText from "@/components/ui/GradientText"
import { ArrowLeft, AudioLines, Captions, Download, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cancelProject } from "./DeleteVideoPermanently";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { addTune } from "./addTune";
import { toast } from "react-toastify";
import { addCaption } from "@/app/actions/addCaption";


export default function FinalVideo() {
    const lastIdRef = useRef<string | null>(null);
    const [scenes, setScenes] = useState<any[]>([]);
    const [projectUrl, setProjectUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const isPollingDone = useRef(false);
    const projectIdRef = useRef<string | null>(null);
    const [isBackClicked, setIsBackClicked] = useState(false);
    const [isAddingTune, setIsAddingTune] = useState(false);
    const [isAddingCaptions, setIsAddingCaptions] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            projectIdRef.current = params.get("projectId");
        }

        if (!projectIdRef.current) {
            isPollingDone.current = true;
            return;
        }

        const interval = setInterval(async () => {
            if (isPollingDone.current) return;

            const id = lastIdRef.current;
            const res = await fetch(
                `${BASE_URL}/api/v1/video/${projectIdRef.current}/${id || "none"}`
            );
            const data = await res.json();

            if (!data) return;

            setProgress(data.progress ?? 0);

            if (data.project) {
                setProjectUrl(data.project);
            }

            const incomingScenes =
                (data?.neededScenes ?? data?.allScenes ?? [])
                    .filter((scene: any) => scene.status === "Generated");


            if (incomingScenes.length > 0) {
                setScenes((prev) => {
                    const prevMap = new Map(prev.map(scene => [scene.id, scene]));

                    for (const scene of incomingScenes) {
                        prevMap.set(scene.id, scene); 
                    }
                    return Array.from(prevMap.values());
                });
                lastIdRef.current = incomingScenes[incomingScenes.length - 1]?.id;
            }

            if (
                data.projectStatus === "Generated" ||
                data.projectStatus === "Cancelled"
            ) {
                isPollingDone.current = true;
                clearInterval(interval);
            }
        }, 30000);


        return () => clearInterval(interval);
    }, []);

    const handleDownload = async () => {
        if (!projectUrl) return;

        try {
            const response = await fetch(projectUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `video-${projectIdRef.current || 'export'}.mp4`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleAddTune = async () => {
        setIsAddingTune(true);
        try {
            if (!projectIdRef.current) return;
            const res = await addTune(projectIdRef.current);
            const finalUrl = res?.finalUrl;
            const message = res?.message;
            if (res.success) {
                toast(message);
            } else {
                toast.info(message)
            }
            if (!finalUrl) return;
            setProjectUrl(finalUrl);
        } catch (error) {
            console.log(error);
        } finally {
            setIsAddingTune(false);
        }
    }

    const handleAddCaption = async () => {
        setIsAddingCaptions(true);
        try {
            if(!projectIdRef.current) return;
            const res = await addCaption(projectUrl, projectIdRef.current);
            const finalUrl = res.finalUrl;
            if(res.success){
                toast.success(res.message);
            }else{
                toast.info(res.message);
            }
            if(!finalUrl) return;
            setProjectUrl(finalUrl);
        } catch (error) {
            console.log(error);
        }finally{
            setIsAddingCaptions(false);
        }
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div
                className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
                {
                    (progress === 100) ?
                        <Link href='/dashboard'>
                            <Button className="cursor-pointer"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>
                        </Link>
                        :
                        (progress > 0) ?
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        disabled={isBackClicked}
                                        className={`flex items-center gap-2 ${isBackClicked ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                                    >
                                        <ArrowLeft className={`h-4 w-4 ${isBackClicked ? "animate-pulse" : ""}`} />
                                        {isBackClicked ? "Please wait…" : "Back to Dashboard"}
                                    </Button>

                                </AlertDialogTrigger>
                                {projectIdRef.current ? <Content id={projectIdRef.current} setIsBackClicked={setIsBackClicked} /> : null}
                            </AlertDialog>
                            :
                            null
                }
            </div>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="col-span-12 lg:col-span-5"
                    >
                        <Card className="rounded-2xl shadow-lg border border-gray-700 bg-gray-900/60 backdrop-blur-md h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-white">
                                        Scenes
                                    </CardTitle>
                                    <span className="text-xs text-gray-400">{scenes.length} items</span>
                                </div>
                            </CardHeader>
                            <Separator className="mb-2" />

                            <CardContent className="p-0">
                                <ScrollAreaPro
                                    className="h-[80vh] scrollbar-hide"
                                    showProgress="vertical"
                                    type="hover"
                                >
                                    <div className="p-4 space-y-3 pr-3">
                                        {scenes.length > 0 ? (
                                            scenes.map((scene) => (
                                                <motion.div
                                                    key={scene.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Scene scene={scene} />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="space-y-3">
                                                <Skeleton className="h-28 w-full rounded-xl" />
                                                <Skeleton className="h-28 w-full rounded-xl" />
                                                <Skeleton className="h-28 w-full rounded-xl" />
                                            </div>
                                        )}
                                    </div>
                                </ScrollAreaPro>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="col-span-12 lg:col-span-7"
                    >
                        <Card className="rounded-2xl shadow-lg border border-gray-700 bg-gray-900/60 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-white">
                                        Final Video
                                    </CardTitle>
                                    {
                                        progress === 100 &&
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <button
                                                            className="cursor-pointer bg-[#F7BF00] hover:bg-[#e6b200]"
                                                            onClick={handleAddTune}
                                                        >
                                                            {
                                                                isAddingTune ?
                                                                    <Loader className="w-4 h-4 animate-spin" />
                                                                    :
                                                                    <AudioLines />
                                                            }
                                                        </button>
                                                    </HoverCardTrigger>
                                                    {
                                                        isAddingTune ?
                                                            null
                                                            :
                                                            <HoverCardContent className={`${isAddingTune ? "" : "w-60"}`}>
                                                                <div className="space-y-1">
                                                                    <h4 className="text-sm font-semibold">Add Tune</h4>
                                                                    <p className="text-sm">
                                                                        Add the selected tune to your project with one click.
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                    }
                                                </HoverCard>
                                            </div>
                                            <div>
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <button
                                                            className="cursor-pointer bg-[#F7BF00] hover:bg-[#e6b200]"
                                                            onClick={handleAddCaption}
                                                        >
                                                            {
                                                                isAddingCaptions ?
                                                                    <Loader className="w-4 h-4 animate-spin" />
                                                                    :
                                                                    <Captions />
                                                            }
                                                        </button>
                                                    </HoverCardTrigger>
                                                    {
                                                        isAddingCaptions ?
                                                            null
                                                            :
                                                            <HoverCardContent className={`${isAddingCaptions ? "" : "w-60"}`}>
                                                                <div className="space-y-1">
                                                                    <h4 className="text-sm font-semibold">Add Caption</h4>
                                                                    <p className="text-sm">
                                                                        Add the subtitle/caption to your project with one click.
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                    }
                                                </HoverCard>
                                            </div>
                                            <div>
                                                <button
                                                    className="cursor-pointer bg-[#F7BF00] hover:bg-[#e6b200]"
                                                    onClick={handleDownload}
                                                >
                                                    <Download />
                                                </button>
                                            </div>
                                        </div>
                                    }

                                </div>
                            </CardHeader>
                            <Separator className="mb-2" />

                            <CardContent>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            {
                                                (progress < 100) ?
                                                    <ShinyText
                                                        text="Processsing"
                                                        disabled={false}
                                                        speed={3}
                                                        className='custom-class text-sm font-medium text-gray-300'
                                                    />
                                                    :
                                                    <GradientText
                                                        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                                                        animationSpeed={3}
                                                        showBorder={false}
                                                        className="text-sm font-medium text-gray-300"
                                                    >
                                                        Generated
                                                    </GradientText>
                                            }
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {progress}%
                                        </span>
                                    </div>

                                    <Progress
                                        value={progress}
                                        className="h-3 w-full overflow-hidden rounded-full bg-gray-700 transition-all duration-300"
                                    />

                                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                                        <span className={`inline-block h-2 w-2 ${(progress < 100) ? 'animate-ping' : ''} rounded-full bg-green-400/80`} />
                                        <span>
                                            {
                                                progress < 100 ?
                                                    `Generating frame ${scenes.reduce((count, scene) => scene.status === 'Generated' ? count + 1 : count, 0) + 1}`
                                                    :
                                                    "Final Video"
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full rounded-xl overflow-hidden flex items-center justify-center p-4">
                                    {projectUrl ? (
                                        <BackgroundGradient className="rounded-xxl dark:bg-zinc-900">
                                            <motion.video
                                                src={projectUrl}
                                                controls
                                                className="w-90 h-160 rounded-lg m-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </BackgroundGradient>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-300">Waiting for final video...</p>
                                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                                                <span>Processing</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

function Content(
    {
        id,
        setIsBackClicked
    }:
        {
            id: string,
            setIsBackClicked: (v: boolean) => void
        }
) {
    const router = useRouter();

    const handleDiscard = async () => {
        setIsBackClicked(true)
        try {
            await cancelProject(id)
            router.push(`/dashboard?discarded=${id}`)
        } catch (error) {
            console.log(error);
        } finally {
            setIsBackClicked(false);
        }
    }

    return (
        <>
            <AlertDialogContent className="max-w-md rounded-2xl bg-zinc-950 border border-zinc-800">
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-lg font-semibold text-white">
                        Leave this project?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-zinc-400 leading-relaxed">
                        Your video is still being generated.
                        <br />
                        <br />
                        You can continue working in the background and access the project later
                        from your dashboard, or discard this project permanently.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                        onClick={handleDiscard}
                    >
                        Discard Project
                    </AlertDialogAction>

                    <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        onClick={() => router.push('/dashboard ')}
                    >
                        Continue in Background
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </>
    )
}
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
import { useSession } from "next-auth/react";
import { Download } from "lucide-react";


export default function FinalVideo() {
    const lastIdRef = useRef<string | null>(null);
    const [scenes, setScenes] = useState<any[]>([]);
    const [projectUrl, setProjectUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const isPollingDone = useRef(false);
    const projectIdRef = useRef<string | null>(null);
    const session = useSession();
    const email = session?.data?.user.email;
    const name = session?.data?.user.name;

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

            const incomingScenes = data?.neededScenes ?? data?.allScenes ?? [];
            setProgress(data.progress);

            if (data.done || !data) {
                clearInterval(interval);
                isPollingDone.current = true;
                return;
            }

            setProjectUrl(data.project);
            if (incomingScenes.length > 0) {
                setScenes((prev) => {
                    const newOnes = incomingScenes.filter(
                        (incoming: any) => !prev.some((p) => p.id === incoming.id)
                    );
                    return [...prev, ...newOnes];
                });

                lastIdRef.current = incomingScenes[incomingScenes.length - 1].id;
            }
        }, 10000);

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

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Scenes Section */}
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

                    {/* Final Video Section */}
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
                                        <div>
                                            <button
                                                className="cursor-pointer bg-[#F7BF00] hover:bg-[#e6b200]"
                                                onClick={handleDownload}
                                            >
                                                <Download />
                                            </button>
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
                                                    `Generating frame ${scenes.reduce((GeneratingSceneNum, scene) => scene.finalUrl ? GeneratingSceneNum + 1 : GeneratingSceneNum, 0)}`
                                                    :
                                                    "Final Video"
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Video Player */}
                                <div className="w-full rounded-xl overflow-hidden flex items-center justify-center p-4">
                                    {projectUrl ? (
                                        <BackgroundGradient className="rounded-xxl dark:bg-zinc-900">
                                            <motion.video
                                                src={projectUrl}
                                                controls
                                                className="w-[360px] h-[640px] rounded-lg m-1"
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

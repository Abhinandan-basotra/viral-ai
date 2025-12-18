"use client";
import { useState } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { BASE_URL } from "@/lib/constants";
import { Spinner } from "./ui/spinner";

export default function GenerateScript({ setOpenScriptPage, generatedScript, title }: any) {
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
    const [idea, setIdea] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const durations = ["30s", "1m", "2m"];

    const handleGenerate = async () => {
        const durationForApi = selectedDuration === "30s" ? 30 : selectedDuration === "1m" ? 60 : 120;
        if (!idea || !selectedDuration) {
            toast.error("Please enter a prompt and select duration");
            return;
        }
        if(loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/video/generateScript`,{
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    idea,
                    expectedVideoLength: durationForApi
                })
            })
            const data = await res.json();
            if(data.success){
                toast.success(data.message);
                generatedScript(data.generatedScript);
                title(data.title);
            }else {
                toast.error(data.message);
            }            
        } catch (error) {
            console.log(error);
            toast.error("Server Error")
        }finally{
            setOpenScriptPage(false);
            setLoading(false);
        }
    }

    return (
        <div className="fixed z-50 flex justify-center items-center w-screen h-screen bg-black/50 backdrop-blur-xs">
            <div className="w-1/3">
                <Card className="p-4 flex flex-col gap-5">
                    <div className="font-bold text-xl flex justify-between items-center">
                        <span>Generate Script with AI</span>
                        <Button
                            className="bg-transparent hover:bg-transparent shadow-none cursor-pointer"
                            onClick={() => setOpenScriptPage(false)}
                        >
                            <X color="white" />
                        </Button>
                    </div>

                    <div>
                        <Textarea
                            id="idea"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Enter a prompt for your video script, e.g. Create a video about Operation Sindoor"
                            className="border-gray-700 text-white placeholder:text-gray-500 min-h-[200px] resize-none align-top p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <Clock size={20} />
                            <span>Duration</span>
                        </div>
                        <div className="flex gap-3">
                            {durations.map((duration) => (
                                <Button
                                    key={duration}
                                    onClick={() => setSelectedDuration(duration)}
                                    className={`flex justify-center items-center w-14 h-7 self-center rounded-2xl text-white ${selectedDuration === duration
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                >
                                    <span>{duration}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Button
                            className="ml-[70%] cursor-pointer"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {
                                loading ? (<div className="flex justify-center items-center gap-2"><span>Generating</span> <Spinner/> </div>) : "Generate Script"
                            }
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Spinner } from "./ui/spinner";
import { toast } from "react-toastify";
import { BASE_URL } from "@/lib/constants/constants";

import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "./ui/dialog";

export default function GenerateScript({
    setOpen,
    generatedScript,
    title,
}: {
    setOpen: (prev: boolean) => void;
    generatedScript: (prev: string) => void;
    title: (prev: string) => void;
}) {
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
    const [idea, setIdea] = useState("");
    const [loading, setLoading] = useState(false);

    const durations = ["30s", "1m", "2m"];

    const handleGenerate = async () => {
        if (!idea || !selectedDuration) {
            toast.error("Please enter a prompt and select duration");
            return;
        }

        if (loading) return;

        const durationForApi =
            selectedDuration === "30s" ? 30 : selectedDuration === "1m" ? 60 : 120;

        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/video/generateScript`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idea,
                    expectedVideoLength: durationForApi,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                generatedScript(data.generatedScript);
                title(data.title);
                setOpen(false);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.log(err);
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-125">
            <DialogHeader>
                <DialogTitle>Generate Script with AI</DialogTitle>
            </DialogHeader>

            <Card className="border-none shadow-none flex flex-col gap-5 bg-[#0b0a0a]">
                <Textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="(e.g Write a Story Script for a king playing with his son)"
                    className="min-h-45 resize-none"
                />

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>Duration</span>
                    </div>

                    <div className="flex gap-3">
                        {durations.map((duration) => (
                            <Button
                                key={duration}
                                type="button"
                                onClick={() => setSelectedDuration(duration)}
                                className={`cursor-pointer rounded-2xl px-4 h-8 transition-colors duration-200 
                                    ${selectedDuration === duration
                                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                                        : "bg-black text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black"
                                    }
  `}
                            >
                                {duration}
                            </Button>

                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" className="cursor-pointer">Cancel</Button>
                    </DialogClose>

                    <Button onClick={handleGenerate} disabled={loading} className="cursor-pointer">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                Generating <Spinner />
                            </div>
                        ) : (
                            "Generate Script"
                        )}
                    </Button>
                </div>
            </Card>
        </DialogContent>
    );
}

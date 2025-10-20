"use client";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, WandSparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import GenerateScript from "@/components/GenerateScript";

const GENRES = ["Fantasy", "Sci-Fi", "Mystery", "Romance", "Thriller", "Adventure", "Horror", "Drama"]
const TONES = ["Humorous", "Dark", "Inspirational", "Melancholic", "Suspenseful", "Whimsical", "Serious"]

export default function StoryCreationForm() {
    const [title, setTitle] = useState("")
    const [prompt, setPrompt] = useState("")
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [selectedTones, setSelectedTones] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [openScriptPage, setOpenScriptPage] = useState(false);
    const [script, setScript] = useState<string>("");

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
    }

    const toggleTone = (tone: string) => {
        setSelectedTones((prev) => (prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]))
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsGenerating(false)
    }

    console.log(script);

    return (
        <div>
            {
                openScriptPage && <GenerateScript setOpenScriptPage={setOpenScriptPage} generatedScript={setScript}/>
            }
            <div className="flex flex-row">
                <div className="w-3/5">
                    <div className="space-y-8 p-10">
                        {/* Header */}
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Create Your Story</h1>
                            <p className="text-gray-400">Let AI help you craft an unforgettable tale</p>
                        </div>

                        {/* Title Input */}
                        <Card className="bg-gray-900 border-gray-800 p-6 relative">
                            <div className="flex justify-between">
                                <Label htmlFor="script" className="text-white mb-2 block font-semibold">
                                    Video Script
                                </Label>
                                <div>
                                    <Button
                                        className="cursor-pointer"
                                        onClick={() => setOpenScriptPage(true)}
                                    >
                                        <WandSparkles className="" />Ai Script Writer
                                    </Button>
                                </div>
                            </div>

                            <Textarea
                                id="script"
                                placeholder="Enter your video script here..."
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                maxLength={1200}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[200px] resize-none align-top p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                            />

                            <p className="absolute bottom-10 right-10 text-gray-500 text-sm">
                                {script.length}/1200
                            </p>
                        </Card>


                        {/* Genre Selection */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label className="text-white mb-4 block font-semibold">Select Genres</Label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map((genre) => (
                                    <Badge
                                        key={genre}
                                        variant={selectedGenres.includes(genre) ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1.5 transition-all ${selectedGenres.includes(genre)
                                            ? "bg-white text-black hover:bg-gray-200"
                                            : "border-gray-600 text-gray-300 hover:border-gray-400"
                                            }`}
                                        onClick={() => toggleGenre(genre)}
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        {/* Tone Selection */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label className="text-white mb-4 block font-semibold">Select Tone</Label>
                            <div className="flex flex-wrap gap-2">
                                {TONES.map((tone) => (
                                    <Badge
                                        key={tone}
                                        variant={selectedTones.includes(tone) ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1.5 transition-all ${selectedTones.includes(tone)
                                            ? "bg-white text-black hover:bg-gray-200"
                                            : "border-gray-600 text-gray-300 hover:border-gray-400"
                                            }`}
                                        onClick={() => toggleTone(tone)}
                                    >
                                        {tone}
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        {/* Story Prompt */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label htmlFor="prompt" className="text-white mb-2 block font-semibold">
                                Story Prompt
                            </Label>
                            <Textarea
                                id="prompt"
                                placeholder="Describe your story idea, characters, plot points, or any specific details you want included..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-32 resize-none"
                            />
                            <p className="text-gray-500 text-sm mt-2">{prompt.length} / 2000 characters</p>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={!script || !prompt || isGenerating}
                                className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold py-6 text-base"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate Story
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-gray-700 text-white hover:bg-gray-900 py-6 text-base bg-transparent"
                            >
                                Save Draft
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="fixed h-[650px] ml-[900px]">
                    <Separator orientation="vertical" className="mt-12 mx-6 bg-gray-700 w-[2px]" />
                </div>
                <div className="fixed ml-[1050px] mt-10 h-[650px] w-1/4 flex flex-col gap-5">
                    <p className="text-2xl font-bold mt-2">Output Example</p>
                    <div className="rounded-2xl">
                        <video width="600" controls muted autoPlay className="rounded-2xl relative z-0">
                            <source src="/videoForOutputeg.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

            </div>
        </div>
    )
}

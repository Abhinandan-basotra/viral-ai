"use client";
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Pause, Play, PlayIcon, Proportions, RectangleHorizontal, RectangleVertical, Sparkles, Square, Wand2, WandSparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import GenerateScript from "@/components/GenerateScript";
import { BASE_URL } from "@/lib/constants";
import { LoaderThree } from "@/components/ui/loader";
import AllVoices from "@/components/AllVoices";
interface Tune {
    id: number;
    name: string;
    url: string;
    description: string;
}

interface Voices {
    voice_id: string;
    name: string;
    accent: string;
    preview_url: string;
    labels: {
        accent: string;
        gender: string;
        age: string;
        descriptive: string;
    };
}

const GENRES = [
    {
        name: "4k realisitc",
        image: '/4k.png'
    },
    {
        name: "Line Art",
        image: '/Line_Art.png'
    },
    {
        name: "Anime",
        image: '/anime.jpg'
    },
    {
        name: "Cinematic",
        image: '/Cinematic.jpeg'
    },
    {
        name: "Neon Futurisitic",
        image: '/neon_futurestic.jpg'
    },
    {
        name: "Cartoon",
        image: '/Cartoon.jpeg'
    },
    {
        name: "Collage",
        image: '/collage.jpeg'
    },
    {
        name: "Japenese Ink",
        image: '/japanese_ink.jpg'
    }
]


export default function StoryCreationForm() {
    const [title, setTitle] = useState("")
    const [prompt, setPrompt] = useState("")
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [selectedTones, setSelectedTones] = useState<string[]>([])
    const [selectedVoices, setSelectedVoices] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [openScriptPage, setOpenScriptPage] = useState(false);
    const [script, setScript] = useState<string>("");
    const [tunes, setTunes] = useState<Tune[]>([]);
    const [playingId, setPlayingId] = useState<string | number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [voices, setVoices] = useState<Voices[]>([]);
    const [loading, setLoading] = useState(false);
    const [openVoices, setOpenVoices] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("9:16");

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [genre]))
    }

    const toggleTone = (tone: string) => {
        setSelectedTones((prev) => (prev.includes(tone) ? prev.filter((t) => t !== tone) : [tone]))
    }

    const toggleVoice = (voiceName: string) => {
        setSelectedVoices((prev) => (prev.includes(voiceName) ? prev.filter((v) => v !== voiceName) : [voiceName]))
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsGenerating(false)
    }

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/tunes`);
                const data = await res.json();
                if (!cancelled) setTunes(data.tunes);
            } catch (error) {
                console.log(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [])

    const playAudio = (item: Tune | Voices) => {
        const id = 'id' in item ? item.id : item.voice_id;
        const src = 'url' in item ? item.url : item.preview_url;

        if (!src) return;

        if (playingId === id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            setPlayingId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        const audio = new Audio(src);
        audioRef.current = audio;
        audio.play();
        setPlayingId(id);

        audio.onended = () => {
            setPlayingId(null);
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
        };
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/getVoices`);
                const data = await res.json();
                if (!cancelled) setVoices(data.voices);
            } catch (error) {
                console.log(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [])

    return (
        <div>
            {
                openScriptPage && <GenerateScript setOpenScriptPage={setOpenScriptPage} generatedScript={setScript} />
            }
            {
                openVoices && 
                <AllVoices 
                voices={voices} 
                playAudio={playAudio} 
                openVoices={openVoices} 
                setOpenVoices={setOpenVoices}
                toggleVoice={toggleVoice}
                />
            }
            <div className="flex flex-row">
                <div className="w-3/5">
                    <div className="space-y-8 p-10">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Create Your Story</h1>
                            <p className="text-gray-400">Let AI help you craft an unforgettable tale</p>
                        </div>

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
                    
                        {/* Generation Preset */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label className="text-white mb-4 block font-semibold">Choose a generation preset</Label>
                            <div className="grid grid-cols-4 gap-4">
                                {GENRES.map((genre) => (
                                    <Card
                                        key={genre.name}
                                        onClick={() => toggleGenre(genre.name)}
                                        className={`relative cursor-pointer w-full h-24 rounded-xl border border-gray-700 overflow-hidden bg-cover bg-center transition-all duration-300 ${selectedGenres.includes(genre.name) ? "ring-2 ring-yellow-500 scale-105" : "hover:scale-105"
                                            }`}
                                        style={{ backgroundImage: `url(${genre.image})` }}
                                    >
                                        <div className="absolute inset-0 flex flex-col items-start justify-end">
                                            <p className="text-sm font-bold text-white text-center p-2" style={{ WebkitTextStroke: "0.5px black" }}>{genre.name}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>


                        {/* Tone Section */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label className="text-white mb-4 block font-semibold">Select Tone</Label>
                            <div className={loading ? "flex justify-center items-center w-full" : "grid grid-cols-2 gap-4"}>
                                {
                                    loading ? (
                                        <div>
                                            <LoaderThree />
                                        </div>
                                    )
                                        :
                                        (
                                            <>
                                                {tunes.map((tone: Tune) => (
                                                    <Card
                                                        key={tone.id}
                                                        onClick={() => toggleTone(tone.name)}
                                                        className={`cursor-pointer flex flex-row justify-between p-4 h-20 rounded-xl border border-gray-700 transition-all duration-300 ${selectedTones.includes(tone.name) ? "ring-2 ring-yellow-500 scale-105 bg-gray-800" : "hover:bg-gray-800"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col justify-center">
                                                            <span className="font-semibold text-white">{tone.name}</span>
                                                            <span className="text-gray-400 text-sm">{tone.description}</span>
                                                        </div>
                                                        <Button
                                                            className="cursor-pointer bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full"
                                                            onClick={() => {
                                                                playAudio(tone)
                                                            }}
                                                        >
                                                            {playingId === tone.id ? <Pause color="white" /> : <PlayIcon color="white" />}
                                                        </Button>
                                                    </Card>
                                                ))}
                                            </>
                                        )
                                }
                            </div>
                        </Card>

                        {/* Voice Section */}
                        <Card className="bg-gray-900 border-gray-800 p-6">
                            <Label className="text-white mb-4 block font-semibold">Select Voice</Label>

                            <div className={!loading ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex justify-center items-center w-full"}>
                                {
                                    loading ? (
                                        <div>
                                            <LoaderThree/>
                                        </div>
                                    ) : (
                                        <>
                                            {voices.slice(0, 4).map((voice: Voices) => {
                                                const isSelected = selectedVoices.includes(voice.name);
                                                const isPlaying = playingId === voice.voice_id;

                                                return (
                                                    <Card
                                                        key={voice.voice_id}
                                                        onClick={() => toggleVoice(voice.name)}
                                                        className={`relative cursor-pointer flex flex-col justify-between p-5 h-32 rounded-xl border border-gray-700 transition-all duration-300 
                                                ${isSelected ? "ring-2 ring-yellow-500 bg-gray-800" : "hover:bg-gray-800"} 
                                                ${isPlaying ? "shadow-lg shadow-yellow-500/30" : ""}
                                            `}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-col space-y-1">
                                                                <span className="font-semibold text-white text-lg">{voice.name}</span>
                                                                <div className="text-gray-400 text-sm">
                                                                    {voice.labels.accent && <span>{voice.labels.accent} • </span>}
                                                                    {voice.labels.gender && <span>{voice.labels.gender} • </span>}
                                                                    {voice.labels.age && <span>{voice.labels.age}</span>}
                                                                </div>
                                                                <span className="text-xs text-gray-500 italic">{voice.labels.descriptive}</span>
                                                            </div>

                                                            <Button
                                                                className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                                                        ${isPlaying
                                                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                                                        : "bg-gray-800 hover:bg-gray-700"
                                                                    }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    playAudio(voice);
                                                                }}
                                                            >
                                                                {isPlaying ? (
                                                                    <Pause color="black" className="w-5 h-5" />
                                                                ) : (
                                                                    <PlayIcon color="white" className="w-5 h-5" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {isPlaying && (
                                                            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-yellow-500 animate-pulse rounded-b-xl"></div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </>
                                    )
                                }

                            </div>
                            <div className="flex justify-center">
                                <Button 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() =>{
                                    setOpenVoices(!openVoices)
                                }}
                                >
                                    View More
                                    <ChevronDown width={20} height={20} />
                                </Button>
                            </div>
                        </Card>

                        <Separator/>

                        <div className="flex flex-col gap-4 ml-8">
                            <div className="flex items-center gap-2">
                            <Proportions/> <span>Aspect Ratio</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="border border-gray-600 h-13 w-auto flex items-center rounded-2xl gap-4 p-2">
                                    <div className="flex items-center">
                                        <Button 
                                        className={"bg-transparent hover:bg-transparent cursor-pointer text-white " + (aspectRatio === "9:16" ? "bg-gray-700 hover:bg-gray-600" : "")}
                                        onClick={() => {
                                            setAspectRatio("9:16")
                                        }}
                                        >
                                            <RectangleVertical color="white"/> <span>9:16</span>
                                        </Button>
                                    </div>
                                    <div className="flex items-center">
                                        <Button 
                                        className={"bg-transparent hover:bg-transparent cursor-pointer text-white " + (aspectRatio === "16:9" ? "bg-gray-700 hover:bg-gray-600" : "")}
                                        onClick={() => {
                                            setAspectRatio("16:9")
                                        }}
                                        >
                                            <RectangleHorizontal color="white"/> <span>16:9</span>
                                        </Button>
                                    </div>
                                    <div className="flex items-center">
                                        <Button 
                                        className= {"bg-transparent hover:bg-transparent cursor-pointer text-white " + (aspectRatio === "1:1" ? "bg-gray-700 hover:bg-gray-600" : "")}
                                        onClick={() => {
                                            setAspectRatio("1:1")
                                        }}
                                        >
                                            <Square color="white"/> <span>1:1</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !script || selectedVoices.length === 0 || !aspectRatio}
                                className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold py-6 text-base cursor-pointer"
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
                        <video width="600" controls muted autoPlay className="rounded-2xl relative z-0" loop>
                            <source src="/videoForOutputeg.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

            </div>
        </div>
    )
}

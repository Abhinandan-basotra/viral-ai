"use client";
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ChevronDown, Pause, Play, Proportions, RectangleHorizontal, RectangleVertical, Sparkles, Square, Wand2, WandSparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import GenerateScript from "@/components/GenerateScript";
import { BASE_URL } from "@/lib/constants";
import { LoaderThree } from "@/components/ui/loader";
import AllVoices from "@/components/AllVoices";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import addProjectScript from "@/app/(pages)/dashboard/addProjectScript";
import { getUser } from "@/app/(pages)/login/getSession";
import { Dialog, DialogTrigger } from "./ui/dialog";
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

export default function CreateVideo() {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [selectedTune, setSelectedTune] = useState<Number | null>(-1)
    const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false)
    const [openScriptPage, setOpenScriptPage] = useState(false);
    const [script, setScript] = useState<string>("");
    const [title, setTitle] = useState("");
    const [tunes, setTunes] = useState<Tune[]>([]);
    const [playingId, setPlayingId] = useState<string | number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [voices, setVoices] = useState<Voices[]>([]);
    const [loading, setLoading] = useState(false);
    const [openVoices, setOpenVoices] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("9:16");

    const router = useRouter();

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [genre]))
    }

    const toggleTone = (tone: Number) => {
        setSelectedTune((prev) => (prev === tone? null : tone))
    }

    const aspectRatios = [
        {
            ratio: "16:9",
            icon: RectangleHorizontal
        },
        {
            ratio: "9:16",
            icon: RectangleVertical
        },
        {
            ratio: "1:1",
            icon: Square
        }
    ]

    const toggleVoice = (voiceId: string) => {
        setSelectedVoiceId((prev) => (prev === voiceId ? null : voiceId));
    };

    const handleGenerate = async () => {
        setIsGenerating(true)
        if(isGenerating) return;
        try {
            const user = await getUser();
            const userId = user?.user.id;


            const projectId = await addProjectScript(script, title, Number(userId));

            fetch(`${BASE_URL}/api/v1/video/generateScenes`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    projectId: projectId,
                    type: 'image',
                    generationPreset: selectedGenres[0],
                    aspectRatio: aspectRatio,
                    voiceId: selectedVoiceId,
                    tuneId: selectedTune
                })
            })

            router.push(`/finalVideo?projectId=${projectId}`);
        } catch (error) {
            console.log('Handle Generate: ', error);
            toast('Something went wrong');
            setIsGenerating(false)
        }
    }

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
        const run1 = async () => {
            try {
                setLoading(true);
                const voiceRes = await fetch(`${BASE_URL}/api/getVoices`);
                const voiceData = await voiceRes.json();
                setVoices(voiceData.voices);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        const run2 = async () => {
            try {
                setLoading(true);
                const tuneRes = await fetch(`${BASE_URL}/api/tunes`);
                const tuneData = await tuneRes.json();
                setTunes(tuneData.tunes);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        run2();
        run1();
    }, [])

    return (
        <div className="min-h-screen">
            {openVoices && (
                <AllVoices
                    voices={voices}
                    playAudio={playAudio}
                    openVoices={openVoices}
                    setOpenVoices={setOpenVoices}
                    toggleVoice={toggleVoice}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
                <div className="w-full lg:w-3/5 xl:w-2/3">
                    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Your Story</h1>
                            <p className="text-gray-400 text-sm md:text-base">Let AI help you craft an unforgettable tale</p>
                        </div>

                        <Card className="bg-gray-900 border-gray-800 p-4 md:p-6 relative">
                            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                                <Label htmlFor="script" className="text-white font-semibold">
                                    Video Script
                                </Label>
                                <Dialog>
                                    <DialogTrigger onClick={() => setOpenScriptPage(true)} className="cursor-pointer sm:w-auto flex justify-center items-center">
                                        <>
                                            <WandSparkles className="w-4 h-4 mr-2" />AI Script Writer
                                        </>
                                    </DialogTrigger>
                                    {
                                        openScriptPage && <GenerateScript setOpen={setOpenScriptPage} generatedScript={setScript} title={setTitle} />
                                    }

                                </Dialog>
                            </div>

                            <Textarea
                                id="script"
                                placeholder="Enter your video script here..."
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                maxLength={1200}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-37.5 md:min-h-50 resize-none p-3 md:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                            />

                            <p className="absolute bottom-4 md:bottom-6 right-4 md:right-7 text-gray-500 text-xs md:text-sm">
                                {script.length}/1200
                            </p>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800 p-4 md:p-6">
                            <Label className="text-white mb-3 md:mb-4 block font-semibold">Choose a generation preset</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                {GENRES.map((genre) => (
                                    <Card
                                        key={genre.name}
                                        onClick={() => toggleGenre(genre.name)}
                                        className={`relative cursor-pointer w-full h-20 md:h-24 rounded-xl border border-gray-700 overflow-hidden bg-cover bg-center transition-all duration-300 ${selectedGenres.includes(genre.name) ? "ring-2 ring-yellow-500 scale-105" : "hover:scale-105"
                                            }`}
                                        style={{ backgroundImage: `url(${genre.image})` }}
                                    >
                                        <div className="absolute inset-0 flex flex-col items-start justify-end">
                                            <p className="text-xs md:text-sm font-bold text-white p-2" style={{ WebkitTextStroke: "0.5px black" }}>
                                                {genre.name}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800 p-4 md:p-6">
                            <Label className="text-white mb-3 md:mb-4 block font-semibold">Select Tone</Label>
                            <div className={loading ? "flex justify-center items-center w-full min-h-25" : "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"}>
                                {loading ? (
                                    <LoaderThree />
                                ) : (
                                    <>
                                        {tunes.map((tone: Tune) => (
                                            <Card
                                                key={tone.id}
                                                onClick={() => toggleTone(tone.id)}
                                                className={`cursor-pointer flex flex-row justify-between p-3 md:p-4 h-auto md:h-20 rounded-xl border border-gray-700 transition-all duration-300 ${selectedTune === tone.id ? "ring-2 ring-yellow-500 scale-105 bg-gray-800" : "hover:bg-gray-800"
                                                    }`}
                                            >
                                                <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                                                    <span className="font-semibold text-white text-sm md:text-base truncate">{tone.name}</span>
                                                    <span className="text-gray-400 text-xs md:text-sm line-clamp-2">{tone.description}</span>
                                                </div>
                                                <Button
                                                    className="cursor-pointer bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playAudio(tone);
                                                    }}
                                                >
                                                    {playingId === tone.id ? <Pause className="w-4 h-4" color="white" /> : <Play className="w-4 h-4" color="white" />}
                                                </Button>
                                            </Card>
                                        ))}
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800 p-4 md:p-6">
                            <Label className="text-white mb-3 md:mb-4 block font-semibold">Select Voice</Label>

                            <div className={!loading ? "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4" : "flex justify-center items-center w-full min-h-25"}>
                                {loading ? (
                                    <LoaderThree />
                                ) : (
                                    <>
                                        {voices.slice(0, 4).map((voice: Voices) => {
                                            const isSelected = selectedVoiceId === voice.voice_id;
                                            const isPlaying = playingId === voice.voice_id;

                                            return (
                                                <Card
                                                    key={voice.voice_id}
                                                    onClick={() => toggleVoice(voice.voice_id)}
                                                    className={`relative cursor-pointer flex flex-col justify-between p-4 md:p-5 h-auto md:h-32 rounded-xl border border-gray-700 transition-all duration-300 
                                                        ${isSelected ? "ring-2 ring-yellow-500 bg-gray-800" : "hover:bg-gray-800"} 
                                                        ${isPlaying ? "shadow-lg shadow-yellow-500/30" : ""}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex flex-col space-y-1 flex-1 min-w-0">
                                                            <span className="font-semibold text-white text-base md:text-lg truncate">{voice.name}</span>
                                                            <div className="text-gray-400 text-xs md:text-sm">
                                                                {voice.labels.accent && <span>{voice.labels.accent} • </span>}
                                                                {voice.labels.gender && <span>{voice.labels.gender} • </span>}
                                                                {voice.labels.age && <span>{voice.labels.age}</span>}
                                                            </div>
                                                            <span className="text-xs text-gray-500 italic line-clamp-2">{voice.labels.descriptive}</span>
                                                        </div>

                                                        <Button
                                                            className={`cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                                                                ${isPlaying ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-800 hover:bg-gray-700"}
                                                            `}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playAudio(voice);
                                                            }}
                                                        >
                                                            {isPlaying ? (
                                                                <Pause color="black" className="w-4 h-4 md:w-5 md:h-5" />
                                                            ) : (
                                                                <Play color="white" className="w-4 h-4 md:w-5 md:h-5" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {isPlaying && (
                                                        <div className="absolute bottom-0 left-0 h-0.75 w-full bg-yellow-500 animate-pulse rounded-b-xl"></div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    className="flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                                    onClick={() => setOpenVoices(!openVoices)}
                                >
                                    View More
                                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                        </Card>

                        <Separator className="my-4 md:my-6" />

                        <div className="flex flex-col gap-3 md:gap-4 md:ml-8">
                            <div className="flex items-center gap-2">
                                <Proportions className="w-5 h-5" />
                                <span className="font-semibold">Aspect Ratio</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="border border-gray-600 h-auto flex items-center rounded-2xl gap-2 md:gap-4 p-2 flex-wrap">
                                    {aspectRatios.map((ratio) => {
                                        const Icon = ratio.icon;
                                        const isSelected = aspectRatio === ratio.ratio;

                                        return (
                                            <Button
                                                key={ratio.ratio}
                                                className={`flex items-center gap-2 cursor-pointer text-white px-3 py-2 rounded-xl transition-all duration-300 ${isSelected ? "bg-gray-700 hover:bg-gray-600" : "bg-transparent hover:bg-gray-800"
                                                    }`}
                                                onClick={() => setAspectRatio(ratio.ratio)}
                                            >
                                                <Icon color="white" className="w-4 h-4 md:w-5 md:h-5" />
                                                <span className="text-sm md:text-base">{ratio.ratio}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !script || !selectedVoiceId || !aspectRatio}
                                className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold py-5 md:py-6 text-sm md:text-base cursor-pointer"
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
                                className="flex-1 border-gray-700 text-white hover:bg-gray-900 py-5 md:py-6 text-sm md:text-base bg-transparent"
                            >
                                Save Draft
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <Separator orientation="vertical" className="h-full bg-gray-700 w-0.5 mx-4 xl:mx-6" />
                </div>

                <div className="w-full lg:w-2/5 xl:w-1/3 p-4 md:p-6 lg:p-10">
                    <div className="flex flex-col gap-4 md:gap-5 lg:sticky lg:top-4">
                        <p className="text-xl md:text-2xl font-bold">Output Example</p>
                        <div className="rounded-2xl overflow-hidden">
                            <video
                                className="w-full rounded-2xl"
                                controls
                                muted
                                autoPlay
                                loop
                            >
                                <source src="/videoForOutputeg.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
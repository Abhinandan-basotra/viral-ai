import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Search, Check } from "lucide-react";

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

export default function AllVoices(
    { 
        voices, playAudio, 
        openVoices, 
        setOpenVoices,
        toggleVoice
    }
    : 
    { 
        voices: Voices[], 
        playAudio: (voice: Voices) => void, 
        openVoices: boolean, 
        setOpenVoices: Dispatch<SetStateAction<boolean>>,
        toggleVoice: (voiceName: string, voice_id: string) => void
    }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [languageFilter, setLanguageFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [ageFilter, setAgeFilter] = useState("all");
    const [trendingFilter, setTrendingFilter] = useState("all");

    const filteredVoices = voices.filter(voice => {
        const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = languageFilter === "all" || voice.labels.accent === languageFilter;
        const matchesGender = genderFilter === "all" || voice.labels.gender === genderFilter;
        const matchesAge = ageFilter === "all" || voice.labels.age === ageFilter;
        return matchesSearch && matchesLanguage && matchesGender && matchesAge;
    });

    return (
        <Sheet open={openVoices} onOpenChange={setOpenVoices}>
            <SheetContent side="right" className="!w-[700px] !max-w-none bg-black text-white border-l border-zinc-800 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-semibold text-white">Select Voice</SheetTitle>
                    <p className="text-sm text-zinc-400 mt-2">Choose a voice for your video narration</p>
                </SheetHeader>

                <div className="space-y-4 p-4">
                    {/* Search Input with shadcn Input component */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            type="text"
                            placeholder="Search voices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                        />
                    </div>

                    {/* Filters with shadcn Select components */}
                    <div className="flex gap-3 flex-wrap">
                        <Select value={languageFilter} onValueChange={setLanguageFilter}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white cursor-pointer">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Languages</SelectItem>
                                <SelectItem value="american">American</SelectItem>
                                <SelectItem value="british">British</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white cursor-pointer">
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={ageFilter} onValueChange={setAgeFilter}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white cursor-pointer">
                                <SelectValue placeholder="Age" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Ages</SelectItem>
                                <SelectItem value="young">Young</SelectItem>
                                <SelectItem value="middle aged">Middle Aged</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={trendingFilter} onValueChange={setTrendingFilter}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white cursor-pointer">
                                <SelectValue placeholder="Trending" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="trending">Trending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Voice List */}
                    <div className="space-y-3 mt-6">
                        {filteredVoices.map((voice) => (
                            <div
                                key={voice.voice_id}
                                className={`p-4 rounded-lg border ${selectedVoice === voice.voice_id
                                    ? 'bg-zinc-900 border-zinc-700'
                                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                                    } transition-colors cursor-pointer`}
                                onClick={() => playAudio(voice)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {voice.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <h3 className="font-medium text-white">{voice.name}</h3>
                                            </div>
                                            <div className="flex gap-1.5 mt-1">
                                                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800">
                                                    {voice.labels.accent}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800">
                                                    {voice.labels.gender}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-800">
                                                    {voice.labels.age}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="px-3 py-1 text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
                                            {voice.labels.descriptive || 'Unknown'}
                                        </Badge>
                                        {selectedVoice === voice.voice_id ? (
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                className="bg-zinc-800 text-white hover:bg-zinc-800"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Selected
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVoice(voice.voice_id);
                                                    toggleVoice(voice.name, voice.voice_id);
                                                }}
                                                className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                                            >
                                                Select
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
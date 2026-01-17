
export interface Tune {
    id: number;
    name: string;
    url: string;
    description: string;
}

export const tunes: Tune[] = [
    {
        id: 1,
        name: "Else-Paris",
        url: "https://res.cloudinary.com/dohhykgvb/video/upload/v1764150451/paris_kuvyik.mp3",
        description: 'Suspense,Epic'
    },
    {
        id: 2,
        name: "Fur-Elise",
        url: "https://res.cloudinary.com/dohhykgvb/video/upload/v1764150721/fur_elise_fkf0gv.mp3",
        description: 'Classical,Piano'
    }
]
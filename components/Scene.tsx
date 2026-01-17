import { Speech, Timer } from "lucide-react";

interface SceneInterface {
  scene: {
    id: string;
    projectId: string;
    sceneNumber: number;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    startTime: string;
    endTime: string;
    finalUrl: string;
    status: string;
  };
}

export default function Scene({ scene }: SceneInterface) {

  const start = parseInt(scene.startTime.replace("s", ""));
  const end = parseInt(scene.endTime.replace("s", ""));
  const duration = end - start;

  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all">
      
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300 font-medium">Scene #{scene.sceneNumber.toString()}</p>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 capitalize">
          {scene.status}
        </span>
      </div>

      {/* Caption Box */}
      <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
        <div className="flex items-center gap-2 text-amber-400 font-medium text-xs bg-amber-500/10 px-2.5 py-1 rounded-md w-fit">
          <Speech size={16} />
          <span>Video Caption</span>
        </div>

        <p className="text-sm leading-relaxed text-gray-200 mt-2">{scene.description}</p>
      </div>

      {/* Bottom Section */}
      <div className="mt-4 grid grid-cols-3 items-center gap-2 text-sm">
        <p className="text-gray-400"><span className="font-medium text-gray-300">Start:</span> {start}s</p>
        <p className="text-gray-400"><span className="font-medium text-gray-300">End:</span> {end}s</p>
        <p className="justify-self-end font-semibold text-white flex items-center gap-1">
          <Timer size={16} /> {duration}s
        </p>
      </div>
    </div>
  );
}

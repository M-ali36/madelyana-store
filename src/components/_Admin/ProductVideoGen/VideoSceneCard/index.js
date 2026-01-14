import Image from "next/image";
import { useTranslations } from "next-intl";

export default function VideoSceneCard({ scene, selected, onToggle }) {
  const t = useTranslations("VideoScenes");

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-xl border p-3 text-left transition
        ${selected ? "border-black ring-2 ring-black" : "hover:border-black"}
      `}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {scene.image && (
          <Image
            src={scene.image}
            alt={scene.sceneId}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium">
          {t(`${scene.sceneId}.title`)}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {t(`${scene.sceneId}.description`)}
        </p>
      </div>
    </button>
  );
}

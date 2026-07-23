import Image from "next/image";
import {
  PlayCircle,
  Television,
  ListBullets,
  CheckCircle,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { classifyResource } from "@/lib/resource-media";

type Resource = {
  id: string;
  title: string;
  url: string | null;
  author: string | null;
  note: string | null;
};

export function WatchCard({
  r,
  opened,
}: {
  r: Resource;
  opened: boolean;
}) {
  const media = classifyResource(r.url);
  const href = r.url ? `/go/${r.id}` : undefined;

  const card = (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition ${
        opened
          ? "border-teal/40"
          : "border-border hover:border-teal/50 hover:shadow-[0_8px_24px_-12px_rgba(20,148,144,0.35)]"
      }`}
    >
      {/* 16:9 thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-ink">
        {media.type === "video" && media.thumb ? (
          <Image
            src={media.thumb}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {media.type === "playlist" ? (
              <ListBullets size={34} weight="duotone" className="text-teal-bright" />
            ) : (
              <Television size={34} weight="duotone" className="text-teal-bright" />
            )}
          </div>
        )}

        {/* play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/55 backdrop-blur-sm transition group-hover:bg-teal">
            <PlayCircle size={26} weight="fill" className="text-white" />
          </span>
        </div>

        {opened && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-teal px-2 py-0.5 font-display text-[11px] font-semibold text-white">
            <CheckCircle size={12} weight="fill" /> Watched
          </span>
        )}
      </div>

      {/* meta */}
      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-display text-sm font-semibold leading-snug text-ink">
          {r.title}
        </p>
        {r.note && (
          <p className="prose-money mt-1 line-clamp-2 text-xs text-muted">
            {r.note}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 font-display text-xs font-semibold text-teal">
          {media.type === "video"
            ? "Watch"
            : media.type === "playlist"
              ? "Open playlist"
              : "Open channel"}
          <ArrowUpRight size={13} weight="bold" />
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {card}
      </a>
    );
  }
  return card;
}

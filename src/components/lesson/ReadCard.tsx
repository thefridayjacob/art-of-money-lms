import {
  BookOpen,
  NewspaperClipping,
  CheckCircle,
  ArrowUpRight,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { resourceHref } from "@/lib/resource-media";

type Resource = {
  id: string;
  kind: "watch" | "read" | "article";
  title: string;
  url: string | null;
  author: string | null;
  note: string | null;
};

export function ReadCard({ r, opened }: { r: Resource; opened: boolean }) {
  const isArticle = r.kind === "article";
  const isBook = r.kind === "read";
  const { href, tracked } = resourceHref(r);

  const inner = (
    <div
      className={`flex h-full items-start gap-3.5 rounded-2xl border p-4 transition ${
        opened
          ? "border-teal/40 bg-teal/[0.04]"
          : "border-border bg-card hover:border-teal/50"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isArticle ? "bg-amber/15 text-amber-ink" : "bg-pink/10 text-pink"
        }`}
      >
        {isArticle ? (
          <NewspaperClipping size={22} weight="duotone" />
        ) : (
          <BookOpen size={22} weight="duotone" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold leading-snug text-ink">
          {r.title}
          {r.author && (
            <span className="font-normal text-muted"> · {r.author}</span>
          )}
        </p>
        {r.note && (
          <p className="prose-money mt-1 line-clamp-2 text-xs text-muted">
            {r.note}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 font-display text-xs font-semibold text-teal">
          {tracked && opened ? (
            <>
              <CheckCircle size={13} weight="fill" /> Opened
            </>
          ) : tracked ? (
            <>
              Read <ArrowUpRight size={13} weight="bold" />
            </>
          ) : isBook ? (
            <>
              <MagnifyingGlass size={13} weight="bold" /> Find this book
            </>
          ) : (
            <>
              <MagnifyingGlass size={13} weight="bold" /> Search for this
            </>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
      {inner}
    </a>
  );
}

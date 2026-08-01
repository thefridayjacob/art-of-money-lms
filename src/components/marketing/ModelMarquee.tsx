import { Cards } from "@phosphor-icons/react/dist/ssr";

/**
 * A seamless, infinitely-scrolling band of real model names. Two identical
 * tracks translate by -50% so the loop is gapless. Pure CSS (off the main
 * thread); the global reduced-motion reset pauses it.
 */
export function ModelMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee gap-3">
        {[0, 1].map((track) => (
          <ul key={track} aria-hidden={track === 1} className="flex shrink-0 gap-3">
            {items.map((name, i) => (
              <li
                key={`${track}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-ink-soft px-4 py-2 font-display text-sm font-semibold text-chalk/80"
              >
                <Cards size={14} weight="duotone" className="shrink-0 text-teal-bright" />
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

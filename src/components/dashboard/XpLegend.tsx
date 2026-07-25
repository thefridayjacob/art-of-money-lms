import {
  PlayCircle,
  Brain,
  NotePencil,
  UsersThree,
  CheckCircle,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";
import { XP } from "@/lib/xp";

const ITEMS = [
  { Icon: PlayCircle, label: "Open a video or book", pts: XP.resource_opened },
  { Icon: Brain, label: "Master a model", pts: XP.model_mastered },
  { Icon: NotePencil, label: "Do the homework", pts: XP.homework_done },
  { Icon: UsersThree, label: "Teach one person", pts: XP.taught_someone },
  { Icon: CheckCircle, label: "Finish a lesson", pts: XP.lesson_complete },
];

/** Explains what XP is and exactly how you earn it. Amber-accented. */
export function XpLegend() {
  return (
    <div className="rounded-3xl border border-amber/25 bg-amber/[0.04] p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber/20 text-amber-ink">
          <Lightning size={16} weight="fill" />
        </span>
        How you earn XP
      </h2>
      <p className="prose-money mt-2 text-sm text-muted">
        XP are points you collect for doing the work. Stack them up to climb
        levels and unlock badges.
      </p>
      <ul className="mt-4 divide-y divide-amber/15">
        {ITEMS.map(({ Icon, label, pts }) => (
          <li key={label} className="flex items-center gap-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber-ink">
              <Icon size={17} weight="duotone" />
            </span>
            <span className="flex-1 font-display text-sm text-ink">{label}</span>
            <span className="font-display text-sm font-bold text-amber-ink">
              +{pts}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

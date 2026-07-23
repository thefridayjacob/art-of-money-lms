import {
  PlayCircle,
  Brain,
  NotePencil,
  UsersThree,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { XP } from "@/lib/xp";

const ITEMS = [
  { Icon: PlayCircle, label: "Open a video or book", pts: XP.resource_opened },
  { Icon: Brain, label: "Master a model", pts: XP.model_mastered },
  { Icon: NotePencil, label: "Do the homework", pts: XP.homework_done },
  { Icon: UsersThree, label: "Teach one person", pts: XP.taught_someone },
  { Icon: CheckCircle, label: "Finish a lesson", pts: XP.lesson_complete },
];

/** Explains what XP is and exactly how you earn it, so the number on the
 * dashboard is never a mystery. */
export function XpLegend() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="font-display text-sm font-bold text-ink">
        How you earn XP
      </p>
      <p className="prose-money mt-1 text-sm text-muted">
        XP are points you collect for doing the work. Stack them up to climb
        levels and unlock badges.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ITEMS.map(({ Icon, label, pts }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
              <Icon size={17} weight="duotone" />
            </span>
            <span className="flex-1 font-display text-sm text-ink">{label}</span>
            <span className="font-display text-sm font-bold text-teal">
              +{pts}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

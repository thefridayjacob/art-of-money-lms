import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDeck } from "@/lib/deck";
import { ProgressRing } from "@/components/ProgressRing";
import { ModelDeckCard } from "@/components/deck/ModelDeckCard";

export const metadata = { title: "The Model Deck · The Art of Money" };

export default async function DeckPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deck = await getDeck(session.user.id);
  const pct = deck.total ? deck.masteredCount / deck.total : 0;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="peel" style={{ backgroundColor: "var(--color-pink)" }}>
            The Deck
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink">
            76 models, one deck.
          </h1>
          <p className="prose-money mt-2 max-w-xl text-muted">
            Every big idea in the course, named so you can hold it in your head.
            Flip a card, read it, and mark the ones you&apos;ve truly got.
          </p>
        </div>
        <ProgressRing progress={pct} size={110} stroke={9} color="var(--color-pink)">
          <span className="font-display text-2xl font-extrabold leading-none text-ink">
            {deck.masteredCount}
          </span>
          <span className="font-display text-xs text-muted">/ {deck.total}</span>
        </ProgressRing>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deck.cards.map((card) => (
          <ModelDeckCard key={card.id} card={card} />
        ))}
      </div>
    </main>
  );
}

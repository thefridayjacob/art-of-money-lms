"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  GraduationCap,
  Cards,
  Medal,
} from "@phosphor-icons/react";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/learn", label: "Course", Icon: GraduationCap },
  { href: "/deck", label: "Deck", Icon: Cards },
  { href: "/badges", label: "Badges", Icon: Medal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur sm:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === "/learn"
              ? pathname.startsWith("/learn")
              : pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 font-display text-[10px] font-semibold transition ${
                  active ? "text-teal" : "text-muted"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

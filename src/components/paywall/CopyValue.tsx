"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label ?? "value"}`}
      className="press inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-base font-bold text-chalk transition hover:bg-white/5"
    >
      {value}
      {copied ? (
        <Check size={15} weight="bold" className="text-teal-bright" />
      ) : (
        <Copy size={15} weight="bold" className="text-chalk/40" />
      )}
    </button>
  );
}

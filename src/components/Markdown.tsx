import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Brand-styled markdown for lesson prose. Serif body (Lora), teal links,
 * and a scrollable, readable treatment for the GFM data tables (e.g. the
 * Nigeria Check figures).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-money space-y-4 text-[15px] leading-relaxed text-ink/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-3">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal underline decoration-teal/30 underline-offset-2 hover:decoration-teal"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-teal">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-teal">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-amber bg-amber/10 px-4 py-2 font-display text-[15px] not-italic text-ink/90">
              {children}
            </blockquote>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 font-display text-lg font-bold text-ink">
              {children}
            </h3>
          ),
          code: ({ children }) => (
            <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[13px] text-pink-ink">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-ink/[0.04] font-display">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-4 py-2.5 font-semibold text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/60 px-4 py-2.5 align-top">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

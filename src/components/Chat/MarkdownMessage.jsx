import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// NVIDIA's replies come back as markdown (tables for price breakdowns, bold
// for emphasis, bullet lists) — rendering it as plain text left literal
// "| Product | Price |" table syntax on screen instead of an actual table.
const components = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
  ul: ({ node, ...props }) => <ul className="my-2 ml-4 list-disc space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="my-2 ml-4 list-decimal space-y-1" {...props} />,
  li: ({ node, ...props }) => <li {...props} />,
  a: ({ node, ...props }) => (
    <a className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-xs" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
  th: ({ node, ...props }) => (
    <th className="border-b border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-700" {...props} />
  ),
  td: ({ node, ...props }) => <td className="border-b border-gray-100 px-2 py-1.5" {...props} />,
  code: ({ node, ...props }) => (
    <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em]" {...props} />
  ),
  h1: ({ node, ...props }) => <p className="mt-2 mb-1 text-base font-semibold" {...props} />,
  h2: ({ node, ...props }) => <p className="mt-2 mb-1 text-base font-semibold" {...props} />,
  h3: ({ node, ...props }) => <p className="mt-2 mb-1 text-sm font-semibold" {...props} />,
};

export default function MarkdownMessage({ text, className = "" }) {
  if (!text) return null;
  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

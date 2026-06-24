import type { ResourceLink } from "@/lib/types";

const KIND_LABEL: Record<NonNullable<ResourceLink["kind"]>, string> = {
  article: "Article",
  docs: "Docs",
  video: "Video",
};

const KIND_GLYPH: Record<NonNullable<ResourceLink["kind"]>, string> = {
  article: "📄",
  docs: "📚",
  video: "▶",
};

/**
 * A clean external resource link card. Never embeds third-party/video content -
 * it links out in a new tab instead.
 */
export default function ResourceCard({ resource }: { resource: ResourceLink }) {
  const kind = resource.kind ?? "article";
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base"
      >
        {KIND_GLYPH[kind]}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{resource.label}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {KIND_LABEL[kind]}
          </span>
        </span>
        {resource.description && (
          <span className="mt-0.5 block text-sm text-slate-500">
            {resource.description}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="ml-auto self-center text-slate-300">
        ↗
      </span>
    </a>
  );
}

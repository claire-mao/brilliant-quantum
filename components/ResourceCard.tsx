"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
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

const CARD_CLASS =
  "flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40";

function isInternalUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

/** Stop parent lesson handlers; leave modified clicks (new tab, etc.) alone. */
function handleLinkClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.stopPropagation();
}

/**
 * A clean resource link card. External links open in one new tab via a single
 * native anchor (never window.open). Internal routes use Next.js Link.
 */
export default function ResourceCard({ resource }: { resource: ResourceLink }) {
  const kind = resource.kind ?? "article";
  const body = (
    <>
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
          <span className="mt-0.5 block text-sm text-slate-500">{resource.description}</span>
        )}
      </span>
      <span aria-hidden="true" className="ml-auto self-center text-slate-300">
        ↗
      </span>
    </>
  );

  if (isInternalUrl(resource.url)) {
    return (
      <Link href={resource.url} className={CARD_CLASS} onClick={handleLinkClick}>
        {body}
      </Link>
    );
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={CARD_CLASS}
      onClick={handleLinkClick}
    >
      {body}
    </a>
  );
}

"use client";

import { useState } from "react";
import type { ResourceLink } from "@/lib/types";
import ResourceCard from "./ResourceCard";

/**
 * Collapsible "Learn more" section. Resources are hidden by default so lessons
 * read cleanly; an inline underlined text link reveals the existing resource
 * cards and hides them again on a second click.
 */
export default function LearnMore({ resources }: { resources: ResourceLink[] }) {
  const [open, setOpen] = useState(false);

  if (resources.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm font-medium text-indigo-600 underline underline-offset-2 transition-colors hover:text-indigo-700"
      >
        {open ? "Hide resources" : "Learn more"}
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.url + resource.label} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}

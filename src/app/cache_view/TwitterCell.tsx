"use client";

import { useState, useTransition } from "react";

interface TwitterCellProps {
  username: string | null;
  handle: string | null;
  saveAction: (username: string, handle: string) => Promise<void>;
}

export default function TwitterCell({
  username,
  handle,
  saveAction,
}: TwitterCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(handle ?? "");
  const [pending, startTransition] = useTransition();

  if (!username) {
    return <span className="text-gray-modern-600">—</span>;
  }

  if (editing) {
    return (
      <form
        action={async (formData) => {
          const next = (formData.get("handle") as string) ?? "";
          startTransition(async () => {
            await saveAction(username, next);
            setEditing(false);
          });
        }}
        className="flex items-center gap-1"
      >
        <input
          name="handle"
          autoFocus
          defaultValue={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="handle (no @)"
          className="px-1.5 py-0.5 rounded border border-electric-purple-500 bg-gray-modern-950 text-electric-purple-200 text-xs w-32"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-1.5 py-0.5 rounded border border-aqua-marine-500 bg-aqua-marine-900/40 text-aqua-marine-200 text-xs disabled:opacity-50"
        >
          {pending ? "…" : "save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(handle ?? "");
            setEditing(false);
          }}
          disabled={pending}
          className="px-1.5 py-0.5 rounded border border-gray-modern-700 bg-gray-modern-900 text-gray-modern-400 text-xs disabled:opacity-50"
        >
          ×
        </button>
      </form>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {handle ? (
        <a
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-electric-purple-300 hover:underline"
        >
          @{handle}
        </a>
      ) : (
        <span className="text-gray-modern-600">—</span>
      )}
      <button
        type="button"
        onClick={() => setEditing(true)}
        title={`Edit twitter for @${username}`}
        className="text-gray-modern-500 hover:text-electric-purple-300 text-base cursor-pointer"
      >
        ✎
      </button>
    </span>
  );
}

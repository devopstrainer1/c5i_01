"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Issue, Status } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import Column from "./Column";

const STATUS_KEYS = STATUSES.map((s) => s.key);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export default function Board() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useEffect(() => {
    api<Issue[]>("/api/issues").then((data) => {
      setIssues(data);
      setLoading(false);
    });
  }, []);

  const byStatus = useMemo(() => {
    const map: Record<Status, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    [...issues]
      .sort((a, b) => a.order - b.order)
      .forEach((i) => map[i.status].push(i));
    return map;
  }, [issues]);

  const findContainer = (id: string): Status | undefined => {
    if (STATUS_KEYS.includes(id as Status)) return id as Status;
    return issues.find((i) => i.id === id)?.status;
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle("");
    const created = await api<Issue>("/api/issues", {
      method: "POST",
      body: JSON.stringify({ title: value, status: "backlog" }),
    });
    setIssues((prev) => [...prev, created]);
  }

  async function handleStatusChange(id: string, status: Status) {
    const updated = await api<Issue>(`/api/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const from = findContainer(active.id as string);
    const to = findContainer(over.id as string);
    if (!from || !to || from === to) return;

    setIssues((prev) => {
      const moving = prev.find((i) => i.id === active.id);
      if (!moving) return prev;
      const maxOrder = Math.max(-1, ...prev.filter((i) => i.status === to).map((i) => i.order));
      return prev.map((i) =>
        i.id === active.id ? { ...i, status: to, order: maxOrder + 1 } : i,
      );
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const to = findContainer(over.id as string);
    if (!to) return;

    let column = byStatus[to];
    const fromIdx = column.findIndex((i) => i.id === active.id);
    const toIdx = column.findIndex((i) => i.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
      column = arrayMove(column, fromIdx, toIdx);
    }

    const orderedIds = column.map((i) => i.id);
    setIssues((prev) =>
      prev.map((i) => {
        const idx = orderedIds.indexOf(i.id);
        return idx === -1 ? i : { ...i, status: to, order: idx };
      }),
    );
    await api(`/api/columns/${to}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ orderedIds }),
    });
  }

  return (
    <>
      <form className="new-issue" onSubmit={handleAdd}>
        <input
          placeholder="Add a new issue..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" disabled={!title.trim()}>
          Add
        </button>
      </form>

      {loading ? (
        <div className="empty">Loading...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="board">
            {STATUSES.map((s) => (
              <Column
                key={s.key}
                status={s.key}
                label={s.label}
                issues={byStatus[s.key]}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </DndContext>
      )}
    </>
  );
}

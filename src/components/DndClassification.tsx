"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { gameCopy } from "@/src/data/gameCopy";
import type {
  ClassificationItem,
  ClassificationSlot,
} from "@/src/types/game";

interface Props {
  items: ClassificationItem[];
  slots: ClassificationSlot[];
  answers: Record<string, string>;
  onChange: (itemId: string, slotId: string | null) => void;
  shape?: "torn" | "puzzle";
}

function DraggableEvidence({
  item,
  selected,
  filed,
  shape,
  onSelect,
}: {
  item: ClassificationItem;
  selected: boolean;
  filed: boolean;
  shape: "torn" | "puzzle";
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, disabled: filed });

  if (filed) return null;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`evidence-card ${shape} ${selected ? "selected" : ""}`}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.55 : 1,
      }}
      aria-pressed={selected}
      aria-label={`${item.text} Select this clue, then choose a folder. You can also drag it.`}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      <span className="evidence-index">
        EVIDENCE / {item.id.toUpperCase()}
      </span>
      <span>{item.text}</span>
      <span className="drag-hint">{gameCopy.classification.drag}</span>
    </button>
  );
}

function EvidenceSlot({
  slot,
  items,
  selected,
  onPlace,
  onReturn,
}: {
  slot: ClassificationSlot;
  items: ClassificationItem[];
  selected: boolean;
  onPlace: () => void;
  onReturn: (itemId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id });

  const activate = () => {
    if (selected) onPlace();
  };

  return (
    <div
      ref={setNodeRef}
      className={`folder-slot ${isOver ? "over" : ""} ${
        selected ? "ready-to-file" : ""
      }`}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`File selected clue under ${slot.label}`}
    >
      <span className="folder-tab">{slot.label}</span>
      {slot.note && <small>{slot.note}</small>}
      <span className="folder-count">
        {items.length
          ? `${items.length} ${gameCopy.classification.filed}`
          : gameCopy.classification.drop}
      </span>
      <span className="filed-stack" aria-live="polite">
        {items.map((item) => (
          <button
            type="button"
            className="filed-slip"
            key={item.id}
            onClick={(event) => {
              event.stopPropagation();
              onReturn(item.id);
            }}
            aria-label={`${gameCopy.classification.remove}: ${item.text}`}
          >
            {item.text}
            <b>{gameCopy.classification.filed}</b>
          </button>
        ))}
      </span>
    </div>
  );
}

export function DndClassification({
  items,
  slots,
  answers,
  onChange,
  shape = "torn",
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState(gameCopy.classification.start);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const classify = (itemId: string, slotId: string) => {
    if (!items.some((item) => item.id === itemId)) return;
    if (!slots.some((slot) => slot.id === slotId)) return;
    onChange(itemId, slotId);
    setSelected(null);
    setMessage(gameCopy.classification.saved);
  };

  const returnClue = (itemId: string) => {
    onChange(itemId, null);
    setSelected(itemId);
    setMessage(gameCopy.classification.returned);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) classify(String(active.id), String(over.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="classification-workbench">
        <div
          className="evidence-tray"
          aria-label={gameCopy.classification.tray}
        >
          {items.map((item) => (
            <DraggableEvidence
              key={item.id}
              item={item}
              selected={selected === item.id}
              filed={Boolean(answers[item.id])}
              shape={shape}
              onSelect={() =>
                setSelected((current) =>
                  current === item.id ? null : item.id,
                )
              }
            />
          ))}
          {items.every((item) => answers[item.id]) && (
            <div className="tray-cleared">
              <span className="stamp small">VIEW SAVED</span>
              {gameCopy.classification.empty}
            </div>
          )}
        </div>
        <div className="folder-grid">
          {slots.map((slot) => (
            <EvidenceSlot
              key={slot.id}
              slot={slot}
              items={items.filter((item) => answers[item.id] === slot.id)}
              selected={Boolean(selected)}
              onPlace={() => selected && classify(selected, slot.id)}
              onReturn={returnClue}
            />
          ))}
        </div>
      </div>
      <p className="archive-message" aria-live="polite">
        {message}
      </p>
    </DndContext>
  );
}

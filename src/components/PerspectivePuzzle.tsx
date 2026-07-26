"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { connectionNotes, perspectives } from "@/src/data/caseData";
import { gameCopy } from "@/src/data/gameCopy";
import type { FileId } from "@/src/types/game";

interface Props {
  completed: FileId[];
  completeMode?: boolean;
  onOpen?: (file: FileId) => void;
  onInspect?: (file: FileId) => void;
}

const wedgeClasses = [
  "north",
  "east",
  "south-east",
  "south-west",
  "west",
];

export function PerspectivePuzzle({
  completed,
  completeMode = false,
  onOpen,
  onInspect,
}: Props) {
  const [active, setActive] = useState<FileId | null>(null);
  const availableIndex = completed.length;

  const activate = (file: FileId, available: boolean) => {
    if (completeMode) {
      setActive(file);
      onInspect?.(file);
    } else if (available) {
      onOpen?.(file);
    }
  };

  return (
    <div
      className={`perspective-puzzle-wrap ${
        completeMode ? "complete" : ""
      } ${active ? "has-active-link" : ""}`}
    >
      <div
        className="perspective-puzzle"
        aria-label="Five-view case puzzle"
      >
        <div className="thread-map" aria-hidden="true">
          {completeMode &&
            Array.from({ length: 5 }, (_, index) => (
              <i
                key={index}
                style={{ transform: `rotate(${index * 36 + 8}deg)` }}
              />
            ))}
        </div>
        {perspectives.map((perspective, index) => {
          const isComplete =
            completeMode || completed.includes(perspective.id);
          const isAvailable = isComplete || index === availableIndex;
          return (
            <motion.button
              type="button"
              key={perspective.id}
              className={`perspective-wedge ${wedgeClasses[index]} ${
                isComplete
                  ? "recovered"
                  : isAvailable
                    ? "available"
                    : "locked"
              } ${active === perspective.id ? "active" : ""}`}
              aria-label={`${perspective.role}: ${
                isComplete
                  ? "view found"
                  : isAvailable
                    ? "file ready"
                    : "file locked"
              }`}
              disabled={!completeMode && !isAvailable}
              initial={
                isComplete
                  ? {
                      opacity: 0,
                      scale: 1.45,
                      x: index % 2 ? 70 : -70,
                    }
                  : false
              }
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: index * 0.08,
              }}
              onClick={() => activate(perspective.id, isAvailable)}
              onMouseEnter={() =>
                completeMode && setActive(perspective.id)
              }
              onMouseLeave={() => completeMode && setActive(null)}
            >
              <span className="silhouette" aria-hidden="true">
                <i />
              </span>
              <span className="wedge-copy">
                <small>{perspective.file}</small>
                <b>{perspective.role}</b>
                {isComplete ? (
                  <em>{perspective.keyword}</em>
                ) : isAvailable ? (
                  <em>{gameCopy.puzzle.openFile}</em>
                ) : (
                  <em>⌁ {gameCopy.puzzle.locked}</em>
                )}
              </span>
            </motion.button>
          );
        })}
        <div className="puzzle-core">
          <span>
            {completeMode
              ? gameCopy.puzzle.coreCompleteTop
              : `${completed.length} / 5`}
          </span>
          <b>
            {completeMode
              ? gameCopy.puzzle.coreCompleteBottom
              : gameCopy.puzzle.coreProgress}
          </b>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {completeMode && active && (
          <motion.div
            className="connection-card"
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span className="eyebrow">
              LINKED CLUES / {active.toUpperCase()}
            </span>
            <strong>
              {perspectives.find((item) => item.id === active)?.view}
            </strong>
            {connectionNotes[active].map((note) => (
              <p key={`${note.with}-${note.type}`}>
                <b>{note.type}</b>
                <span>→ {note.with}</span>
                {note.text}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {completeMode && !active && (
        <p className="hover-instruction">{gameCopy.puzzle.inspect}</p>
      )}
    </div>
  );
}

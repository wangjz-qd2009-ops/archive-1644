"use client";

import { motion } from "framer-motion";
import { decisionOptions } from "@/src/data/caseData";
import { gameCopy } from "@/src/data/gameCopy";
import type { DecisionChoice } from "@/src/types/game";

interface Props {
  mode: "initial" | "final";
  choice: DecisionChoice | null;
  confidence: number;
  onChoice: (choice: DecisionChoice) => void;
  onConfidence: (confidence: number) => void;
}

export function DecisionPanel({
  mode,
  choice,
  confidence,
  onChoice,
  onConfidence,
}: Props) {
  return (
    <>
      <div
        className="decision-puzzle"
        role="radiogroup"
        aria-label="Case choices"
      >
        {decisionOptions.map((option, index) => (
          <motion.button
            type="button"
            role="radio"
            aria-checked={choice === option.id}
            className={`puzzle-choice piece-${index + 1} ${choice === option.id ? "chosen" : ""}`}
            key={option.id}
            onClick={() => onChoice(option.id)}
            whileHover={{ y: -6, rotate: index % 2 ? 0.6 : -0.6 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <span className="piece-code">OPTION {String(index + 1).padStart(2, "0")}</span>
            <strong>{mode === "initial" ? option.initialLabel : option.finalLabel}</strong>
            <span className="piece-state">
              {choice === option.id
                ? gameCopy.puzzle.choiceSaved
                : gameCopy.puzzle.choose}
            </span>
            {choice === option.id && (
              <motion.i
                className="view-saved-stamp"
                initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
              >
                VIEW SAVED
              </motion.i>
            )}
          </motion.button>
        ))}
      </div>

      <div className="confidence-dial">
        <div className="dial-head">
          <div>
            <span className="eyebrow">CONFIDENCE NOTE</span>
            <h3>{gameCopy.puzzle.confidenceTitle}</h3>
          </div>
          <output aria-live="polite">{confidence} / 100</output>
        </div>
        <div className="mechanical-scale">
          <input
            aria-label="How sure you feel, from not sure to very sure"
            type="range"
            min="0"
            max="100"
            step="5"
            value={confidence}
            onChange={(event) => onConfidence(Number(event.target.value))}
            style={{ "--confidence": `${confidence}%` } as React.CSSProperties}
          />
          <span className="needle" style={{ left: `${confidence}%` }} aria-hidden="true" />
          <div className="scale-ticks" aria-hidden="true">
            {Array.from({ length: 21 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
        <div className="scale-labels">
          <span>{gameCopy.puzzle.notSure}</span>
          <span>{gameCopy.puzzle.verySure}</span>
        </div>
      </div>
    </>
  );
}

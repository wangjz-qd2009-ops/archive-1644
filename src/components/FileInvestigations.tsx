"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  designerGoals,
  designerReasons,
  historianConfidenceOptions,
  historianItems,
  historianSlots,
  moderatorItems,
  moderatorSlots,
  newPlayerOptions,
  newPlayerStatement,
  perspectiveReasonOptions,
  perspectives,
  veteranItems,
  veteranSlots,
} from "@/src/data/caseData";
import { gameCopy } from "@/src/data/gameCopy";
import type { FileId, GameState } from "@/src/types/game";
import { DndClassification } from "./DndClassification";

interface Props {
  fileId: FileId;
  state: GameState;
  patchState: (patch: Partial<GameState>) => void;
  updateState: (updater: (current: GameState) => GameState) => void;
  onComplete: (file: FileId) => void;
  onBoard: () => void;
}

function FileHeader({
  fileId,
  onBoard,
}: {
  fileId: FileId;
  onBoard: () => void;
}) {
  const perspective = perspectives.find((item) => item.id === fileId)!;
  return (
    <header className="file-header">
      <button type="button" className="text-button" onClick={onBoard}>
        ← {gameCopy.files.back}
      </button>
      <div>
        <span className="eyebrow">
          {perspective.file} / {perspective.code}
        </span>
        <h1>{perspective.role}</h1>
      </div>
      <span className="stamp">{gameCopy.files.evidenceStamp}</span>
    </header>
  );
}

function FileBrief({ fileId }: { fileId: FileId }) {
  const perspective = perspectives.find((item) => item.id === fileId)!;
  return (
    <aside className="file-brief paper-panel">
      <div
        className="portrait-card"
        role="img"
        aria-label={`${perspective.role} archive silhouette`}
      >
        <div className="large-silhouette">
          <i />
        </div>
        <span>{perspective.code}</span>
      </div>
      <div>
        <span className="eyebrow">{gameCopy.files.testimony}</span>
        <ul className="typed-list">
          {perspective.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <i className="paper-clip" aria-hidden="true" />
    </aside>
  );
}

function CompletionButton({
  ready,
  fileId,
  onComplete,
}: {
  ready: boolean;
  fileId: FileId;
  onComplete: (file: FileId) => void;
}) {
  return (
    <div className={`file-completion ${ready ? "ready" : ""}`}>
      <span>
        {ready ? gameCopy.files.complete : gameCopy.files.incomplete}
      </span>
      {ready && (
        <motion.i
          className="completion-stamp"
          initial={{ opacity: 0, scale: 1.5, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
        >
          VIEW SAVED
        </motion.i>
      )}
      <button
        type="button"
        className="primary-button"
        disabled={!ready}
        onClick={() => onComplete(fileId)}
      >
        {gameCopy.files.button}
      </button>
    </div>
  );
}

function updatePlacement(
  state: GameState,
  patchState: Props["patchState"],
  itemId: string,
  slotId: string | null,
) {
  const classificationPlacements = {
    ...state.classificationPlacements,
  };
  if (slotId) classificationPlacements[itemId] = slotId;
  else delete classificationPlacements[itemId];
  patchState({ classificationPlacements });
}

function VeteranFile(props: Props) {
  const ready = veteranItems.every(
    (item) => props.state.classificationPlacements[item.id],
  );
  return (
    <>
      <FileBrief fileId="veteran" />
      <section className="task-panel torn-board">
        <div className="task-heading">
          <span>{gameCopy.files.veteran.code}</span>
          <h2>{gameCopy.files.veteran.title}</h2>
          <p>{gameCopy.files.veteran.note}</p>
        </div>
        <DndClassification
          items={veteranItems}
          slots={veteranSlots}
          answers={props.state.classificationPlacements}
          onChange={(itemId, slotId) =>
            updatePlacement(props.state, props.patchState, itemId, slotId)
          }
        />
      </section>
      <CompletionButton
        ready={ready}
        fileId="veteran"
        onComplete={props.onComplete}
      />
    </>
  );
}

function HistorianFile(props: Props) {
  const allPlaced = historianItems.every(
    (item) => props.state.classificationPlacements[item.id],
  );
  const ready = allPlaced && Boolean(props.state.confidenceLevels.historian);
  return (
    <>
      <FileBrief fileId="historian" />
      <section className="task-panel museum-board">
        <div className="task-heading">
          <span>{gameCopy.files.historian.code}</span>
          <h2>{gameCopy.files.historian.title}</h2>
          <p>{gameCopy.files.historian.note}</p>
        </div>
        <DndClassification
          items={historianItems}
          slots={historianSlots}
          answers={props.state.classificationPlacements}
          shape="puzzle"
          onChange={(itemId, slotId) =>
            updatePlacement(props.state, props.patchState, itemId, slotId)
          }
        />
        {allPlaced && (
          <motion.div
            className="certainty-file"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <fieldset>
              <legend>{gameCopy.files.historian.confidence}</legend>
              <div>
                {historianConfidenceOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name="historian-confidence"
                      checked={
                        props.state.confidenceLevels.historian === option.id
                      }
                      onChange={() =>
                        props.patchState({
                          confidenceLevels: {
                            ...props.state.confidenceLevels,
                            historian: option.id,
                          },
                          selectedChoices: {
                            ...props.state.selectedChoices,
                            historianConfidence: option.id,
                          },
                        })
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </motion.div>
        )}
        {ready && (
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="archive-maxim"
          >
            {gameCopy.files.historian.maxim}
          </motion.blockquote>
        )}
      </section>
      <CompletionButton
        ready={ready}
        fileId="historian"
        onComplete={props.onComplete}
      />
    </>
  );
}

function NewPlayerFile(props: Props) {
  const [feedback, setFeedback] = useState("");
  const ready = Boolean(
    props.state.perspectiveAnswer && props.state.perspectiveReason,
  );

  const answer = (id: string) => {
    props.patchState({
      perspectiveAnswer: id,
      selectedChoices: {
        ...props.state.selectedChoices,
        newPlayerView: id,
      },
    });
    setFeedback(
      id === "A"
        ? gameCopy.files.newPlayer.strong
        : id === "B" || id === "C"
          ? gameCopy.files.newPlayer.partial
          : gameCopy.files.newPlayer.open,
    );
  };

  return (
    <>
      <FileBrief fileId="new-player" />
      <section className="task-panel interview-board">
        <div className="statement-sheet">
          <span className="tape" aria-hidden="true" />
          <span className="eyebrow">
            {gameCopy.files.newPlayer.transcript}
          </span>
          <blockquote>“{newPlayerStatement}”</blockquote>
        </div>
        <div className="task-heading">
          <span>{gameCopy.files.newPlayer.code}</span>
          <h2>{gameCopy.files.newPlayer.title}</h2>
        </div>
        <div
          className="summary-puzzle"
          role="radiogroup"
          aria-label={gameCopy.files.newPlayer.title}
        >
          {newPlayerOptions.map((option, index) => (
            <motion.button
              type="button"
              role="radio"
              aria-checked={props.state.perspectiveAnswer === option.id}
              className={`summary-piece shape-${index + 1} ${
                props.state.perspectiveAnswer === option.id ? "selected" : ""
              }`}
              key={option.id}
              onClick={() => answer(option.id)}
              whileHover={{ y: -5 }}
            >
              <b>{option.id}</b>
              <span>{option.text}</span>
              {props.state.perspectiveAnswer === option.id && (
                <em>VIEW SAVED</em>
              )}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {props.state.perspectiveAnswer && (
            <motion.fieldset
              className="reading-reason"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <legend>{gameCopy.files.newPlayer.reason}</legend>
              <div>
                {perspectiveReasonOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name="perspective-reason"
                      checked={props.state.perspectiveReason === option.id}
                      onChange={() =>
                        props.patchState({
                          perspectiveReason: option.id,
                          selectedChoices: {
                            ...props.state.selectedChoices,
                            perspectiveReason: option.id,
                          },
                        })
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.p
              key={feedback}
              className="interpretation-feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <b>{gameCopy.files.newPlayer.saved}</b>
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </section>
      <CompletionButton
        ready={ready}
        fileId="new-player"
        onComplete={props.onComplete}
      />
    </>
  );
}

function DesignerFile(props: Props) {
  const allocation = props.state.designerAllocation;
  const total = Object.values(allocation).reduce(
    (sum, value) => sum + value,
    0,
  );
  const ready = total === 100 && props.state.selectedReasons.length > 0;

  const toggleGoal = (id: string) => {
    if (!props.state.designerReadGoals.includes(id)) {
      props.patchState({
        designerReadGoals: [...props.state.designerReadGoals, id],
      });
    }
  };

  const shift = (target: keyof typeof allocation, delta: number) => {
    const keys = Object.keys(allocation) as Array<keyof typeof allocation>;
    const otherKeys = keys.filter((key) => key !== target);
    const next = { ...allocation };
    if (delta > 0) {
      const donor = [...otherKeys].sort((a, b) => next[b] - next[a])[0];
      if (next[donor] < 5 || next[target] >= 100) return;
      next[donor] -= 5;
      next[target] += 5;
    } else {
      if (next[target] < 5) return;
      const receiver = [...otherKeys].sort((a, b) => next[a] - next[b])[0];
      next[target] -= 5;
      next[receiver] += 5;
    }
    props.patchState({
      designerAllocation: next,
      selectedChoices: {
        ...props.state.selectedChoices,
        designerAllocation: Object.entries(next)
          .map(([key, value]) => `${key}:${value}`)
          .join(","),
      },
    });
  };

  return (
    <>
      <FileBrief fileId="designer" />
      <section className="task-panel machine-board">
        <div className="task-heading">
          <span>{gameCopy.files.designer.code}</span>
          <h2>{gameCopy.files.designer.title}</h2>
          <p>{gameCopy.files.designer.note}</p>
        </div>
        <div className="goal-files">
          {designerGoals.map((goal) => (
            <details
              key={goal.id}
              onToggle={(event) =>
                event.currentTarget.open && toggleGoal(goal.id)
              }
              open={props.state.designerReadGoals.includes(goal.id)}
            >
              <summary>
                <span>{goal.label}</span>
                <small>
                  {props.state.designerReadGoals.includes(goal.id)
                    ? "VIEWED"
                    : "OPEN BRIEF"}
                </small>
              </summary>
              <p>{goal.note}</p>
            </details>
          ))}
        </div>

        <div className="allocation-machine">
          <div className="machine-total">
            <span>{gameCopy.files.designer.total}</span>
            <b>{total}</b>
            <small>/ 100</small>
          </div>
          <div className="weight-columns">
            {designerGoals.map((goal) => {
              const value = allocation[goal.id];
              return (
                <div className="weight-column" key={goal.id}>
                  <div className="token-stack" aria-hidden="true">
                    {Array.from(
                      { length: Math.round(value / 5) },
                      (_, index) => <i key={index} />,
                    )}
                  </div>
                  <div className="weight-readout">
                    <strong>{value}</strong>
                    <span>{goal.label}</span>
                  </div>
                  <div className="machine-controls">
                    <button
                      type="button"
                      onClick={() => shift(goal.id, -5)}
                      aria-label={`Remove five tokens from ${goal.label}`}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => shift(goal.id, 5)}
                      aria-label={`Add five tokens to ${goal.label}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <fieldset className="reason-ledger">
          <legend>{gameCopy.files.designer.reasons}</legend>
          {designerReasons.map((reason) => (
            <label key={reason.id}>
              <input
                type="checkbox"
                checked={props.state.selectedReasons.includes(reason.id)}
                onChange={() => {
                  const selectedReasons =
                    props.state.selectedReasons.includes(reason.id)
                      ? props.state.selectedReasons.filter(
                          (item) => item !== reason.id,
                        )
                      : [...props.state.selectedReasons, reason.id];
                  props.patchState({
                    selectedReasons,
                    selectedChoices: {
                      ...props.state.selectedChoices,
                      designerReasons: selectedReasons,
                    },
                  });
                }}
              />
              <span>{reason.label}</span>
            </label>
          ))}
        </fieldset>
        <label className="explanation-sheet">
          <span>{gameCopy.files.designer.optional}</span>
          <textarea
            value={props.state.designerExplanation}
            onChange={(event) =>
              props.patchState({ designerExplanation: event.target.value })
            }
            placeholder={gameCopy.files.designer.placeholder}
          />
        </label>
      </section>
      <CompletionButton
        ready={ready}
        fileId="designer"
        onComplete={props.onComplete}
      />
    </>
  );
}

function ModeratorFile(props: Props) {
  const ready = moderatorItems.every(
    (item) => props.state.classificationPlacements[item.id],
  );
  return (
    <>
      <FileBrief fileId="moderator" />
      <section className="task-panel clipping-board">
        <div className="task-heading">
          <span>{gameCopy.files.moderator.code}</span>
          <h2>{gameCopy.files.moderator.title}</h2>
          <p>{gameCopy.files.moderator.note}</p>
        </div>
        <DndClassification
          items={moderatorItems}
          slots={moderatorSlots}
          answers={props.state.classificationPlacements}
          onChange={(itemId, slotId) =>
            updatePlacement(props.state, props.patchState, itemId, slotId)
          }
        />
      </section>
      <CompletionButton
        ready={ready}
        fileId="moderator"
        onComplete={props.onComplete}
      />
    </>
  );
}

export function FileInvestigation(props: Props) {
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
  }, [props.fileId]);

  const finishFile = (fileId: FileId) => {
    const seconds = Math.max(
      1,
      Math.round((Date.now() - startedAt.current) / 1000),
    );
    props.updateState((current) => ({
      ...current,
      readingTime: {
        ...current.readingTime,
        [fileId]: (current.readingTime[fileId] ?? 0) + seconds,
      },
      skippedContent:
        current.skippedContent + (seconds < 8 ? 1 : 0),
    }));
    props.onComplete(fileId);
  };

  const fileProps = { ...props, onComplete: finishFile };

  return (
    <motion.main
      className="file-page page-shell"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <FileHeader fileId={props.fileId} onBoard={props.onBoard} />
      {props.fileId === "veteran" && <VeteranFile {...fileProps} />}
      {props.fileId === "historian" && <HistorianFile {...fileProps} />}
      {props.fileId === "new-player" && <NewPlayerFile {...fileProps} />}
      {props.fileId === "designer" && <DesignerFile {...fileProps} />}
      {props.fileId === "moderator" && <ModeratorFile {...fileProps} />}
    </motion.main>
  );
}

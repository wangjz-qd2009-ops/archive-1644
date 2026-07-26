"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DecisionPanel } from "@/src/components/DecisionPanel";
import { FileInvestigation } from "@/src/components/FileInvestigations";
import { PerspectivePuzzle } from "@/src/components/PerspectivePuzzle";
import { ResultPage } from "@/src/components/ResultPage";
import {
  finalReasonOptions,
  initialReasonOptions,
  perspectives,
} from "@/src/data/caseData";
import { gameCopy } from "@/src/data/gameCopy";
import { useGameState } from "@/src/hooks/useGameState";
import type {
  FileId,
  GameState,
  PatternLevel,
} from "@/src/types/game";
import {
  calculatePattern,
  demoDimensions,
  demoReasons,
} from "@/src/utils/scoring";

function RewardStatus({
  fragments,
  unlocked,
}: {
  fragments: number;
  unlocked: boolean;
}) {
  const copy = gameCopy.rewardStatus;
  return (
    <aside
      className={`reward-status ${unlocked ? "unlocked" : ""}`}
      aria-label="Reward progress"
    >
      <span>{unlocked ? copy.unlocked : copy.locked}</span>
      <b>
        {fragments} / 4 {unlocked ? "CLUES FOUND" : "CLUES FOUND"}
      </b>
      <small>{unlocked ? copy.unlockedNote : copy.lockedNote}</small>
    </aside>
  );
}

function CaseMarks({ current }: { current: string }) {
  return (
    <nav className="case-marks" aria-label="Case sections">
      {gameCopy.navigation.map((label) => (
        <span className={current === label ? "active" : ""} key={label}>
          {label}
        </span>
      ))}
    </nav>
  );
}

function Opening({ onOpen }: { onOpen: () => void }) {
  const copy = gameCopy.opening;
  return (
    <motion.main
      className="opening page-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="opening-title">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>
          {copy.title} <em>1644</em>
        </h1>
        <p>{copy.caseLine}</p>
      </div>
      <motion.button
        type="button"
        className="archive-envelope"
        onClick={onOpen}
        whileHover={{ y: -10, rotate: -0.5 }}
        whileTap={{ scale: 0.985 }}
        aria-label={copy.button}
      >
        <span className="envelope-tab">{copy.fileLabel}</span>
        <span className="stamp">{copy.stamp}</span>
        <div className="envelope-copy">
          <small>{copy.groupLabel}</small>
          <strong>{copy.group}</strong>
          <p>{copy.teammateNote}</p>
          <p>{copy.privacyNote}</p>
        </div>
        <b className="open-label">
          {copy.button} <i>→</i>
        </b>
      </motion.button>
      <div className="opening-foot">
        <span>{copy.access}</span>
        <span>{copy.motto}</span>
      </div>
    </motion.main>
  );
}

function Introduction({ onReview }: { onReview: () => void }) {
  const copy = gameCopy.introduction;
  return (
    <motion.main
      className="intro page-shell"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="section-header">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
        </div>
        <span className="stamp">UNCHECKED</span>
      </header>
      <div className="investigation-scene">
        <article className="newspaper-clipping">
          <span>{copy.paperName}</span>
          <h2>{copy.headline}</h2>
          <p>{copy.story}</p>
          <p>{copy.promise}</p>
          <div className="redacted-lines">
            <i />
            <i />
            <i />
          </div>
        </article>
        <figure className="character-proof">
          <div
            className="blurred-commander"
            role="img"
            aria-label={copy.imageAlt}
          >
            <i className="cannon-line" />
            <span className="figure-head" />
            <span className="figure-body" />
          </div>
          <figcaption>{copy.imageLabel}</figcaption>
          <span className="tape" aria-hidden="true" />
        </figure>
        <article className="forum-extract">
          <header>
            <span>{copy.postLabel}</span>
            <b>RANK #01</b>
          </header>
          <blockquote>{copy.post}</blockquote>
          <footer>
            <span>● {copy.likes}</span>
            <span>↗ {copy.reposts}</span>
          </footer>
          <span className="pin" aria-hidden="true" />
        </article>
        <div className="scene-string one" aria-hidden="true" />
        <div className="scene-string two" aria-hidden="true" />
      </div>
      <div className="intro-action">
        <p>{copy.note}</p>
        <button
          type="button"
          className="primary-button"
          onClick={onReview}
        >
          {copy.button}
        </button>
      </div>
    </motion.main>
  );
}

function InitialDecision({
  state,
  patchState,
  onContinue,
}: {
  state: GameState;
  patchState: (patch: Partial<GameState>) => void;
  onContinue: () => void;
}) {
  const copy = gameCopy.initialDecision;
  return (
    <motion.main
      className="decision-page page-shell"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <header className="section-header">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.note}</p>
        </div>
        <span className="stamp rotated">FIRST VIEW</span>
      </header>
      <DecisionPanel
        mode="initial"
        choice={state.initialChoice}
        confidence={state.confidenceLevels.initial}
        onChoice={(initialChoice) =>
          patchState({
            initialChoice,
            selectedChoices: {
              ...state.selectedChoices,
              initialChoice,
            },
          })
        }
        onConfidence={(initial) =>
          patchState({
            confidenceLevels: { ...state.confidenceLevels, initial },
          })
        }
      />
      <fieldset className="choice-reasons first-reasons">
        <legend>{copy.reasonTitle}</legend>
        <small>Pick any that fit. You may skip.</small>
        <div>
          {initialReasonOptions.map((reason) => (
            <label key={reason.id}>
              <input
                type="checkbox"
                checked={state.initialReasons.includes(reason.id)}
                onChange={() => {
                  const initialReasons = state.initialReasons.includes(
                    reason.id,
                  )
                    ? state.initialReasons.filter(
                        (item) => item !== reason.id,
                      )
                    : [...state.initialReasons, reason.id];
                  patchState({ initialReasons });
                }}
              />
              <span>{reason.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="decision-submit">
        <p>{copy.privacy}</p>
        <button
          type="button"
          className="primary-button"
          disabled={!state.initialChoice}
          onClick={onContinue}
        >
          {copy.button}
        </button>
      </div>
    </motion.main>
  );
}

function InvestigationBoard({
  state,
  onOpen,
}: {
  state: GameState;
  onOpen: (file: FileId) => void;
}) {
  const copy = gameCopy.board;
  const nextFile = perspectives[state.completedFiles.length];
  return (
    <motion.main
      className="board-page page-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="section-header board-header">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
        </div>
        <span className="board-counter">
          {state.completedFiles.length} / 5 {copy.counterSuffix}
        </span>
      </header>
      <div className="board-layout">
        <section className="board-main">
          <PerspectivePuzzle
            completed={state.completedFiles}
            onOpen={onOpen}
          />
          <div className="board-next-file">
            <p>
              {state.completedFiles.length === 0
                ? copy.firstHint
                : copy.nextHint}
            </p>
            {nextFile && (
              <button
                type="button"
                className="primary-button board-open-button"
                onClick={() => onOpen(nextFile.id)}
              >
                OPEN {nextFile.file}
              </button>
            )}
          </div>
        </section>
        <aside className="team-docket">
          <header>
            <span>{copy.teamTitle}</span>
            <b>{copy.teamName}</b>
          </header>
          {state.teammateProgress.map((teammate) => (
            <div
              key={teammate.name}
              className={teammate.name === "You" ? "you" : ""}
            >
              <span className="status-light" aria-hidden="true" />
              <p>
                <b>{teammate.name}</b>
                <small>{teammate.status}</small>
              </p>
            </div>
          ))}
          <footer>{copy.privacy}</footer>
        </aside>
      </div>
      <footer className="board-motto">
        {copy.motto.map((line, index) => (
          <span key={line}>
            {index > 0 && <i aria-hidden="true" />}
            <b>{line}</b>
          </span>
        ))}
      </footer>
    </motion.main>
  );
}

function CompletedPuzzle({
  onContinue,
  onInspect,
}: {
  onContinue: () => void;
  onInspect: (file: FileId) => void;
}) {
  const copy = gameCopy.completePuzzle;
  return (
    <motion.main
      className="complete-puzzle-page page-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="section-header centered">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.note}</p>
        </div>
        <span className="stamp">REVIEWED</span>
      </header>
      <PerspectivePuzzle
        completed={perspectives.map((item) => item.id)}
        completeMode
        onInspect={onInspect}
      />
      <div className="complete-action">
        <p>{copy.hint}</p>
        <button
          type="button"
          className="primary-button"
          onClick={onContinue}
        >
          {copy.button}
        </button>
      </div>
    </motion.main>
  );
}

function FinalDecisionPage({
  state,
  patchState,
  onSubmit,
}: {
  state: GameState;
  patchState: (patch: Partial<GameState>) => void;
  onSubmit: () => void;
}) {
  const copy = gameCopy.finalDecision;
  return (
    <motion.main
      className="decision-page final-decision page-shell"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <header className="section-header">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.note}</p>
        </div>
        <span className="stamp rotated">FINAL VIEW</span>
      </header>
      <DecisionPanel
        mode="final"
        choice={state.finalChoice}
        confidence={state.confidenceLevels.final}
        onChoice={(finalChoice) =>
          patchState({
            finalChoice,
            selectedChoices: {
              ...state.selectedChoices,
              finalChoice,
            },
          })
        }
        onConfidence={(final) =>
          patchState({
            confidenceLevels: { ...state.confidenceLevels, final },
            changedConfidence:
              Math.abs(final - state.confidenceLevels.initial) >= 5,
          })
        }
      />
      <fieldset className="choice-reasons final-reasons">
        <legend>{copy.reasonsTitle}</legend>
        <small>{copy.reasonsNote}</small>
        <div>
          {finalReasonOptions.map((reason) => (
            <label key={reason.id}>
              <input
                type="checkbox"
                checked={state.finalReasons.includes(reason.id)}
                onChange={() => {
                  const finalReasons = state.finalReasons.includes(reason.id)
                    ? state.finalReasons.filter(
                        (item) => item !== reason.id,
                      )
                    : [...state.finalReasons, reason.id];
                  patchState({ finalReasons });
                }}
              />
              <span>{reason.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="decision-submit">
        <p>{copy.privacy}</p>
        <button
          type="button"
          className="primary-button"
          disabled={!state.finalChoice || state.finalReasons.length === 0}
          onClick={onSubmit}
        >
          {copy.button}
        </button>
      </div>
    </motion.main>
  );
}

function RewardPage({ onRestart }: { onRestart: () => void }) {
  const rewards = [
    ["500", "XP"],
    ["EPIC", "Card Pack"],
    ["LIMITED", "Archive Avatar Frame"],
    ["V", "Fifth View Guild Badge"],
  ];
  const copy = gameCopy.reward;
  return (
    <motion.main
      className="reward-page page-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="reward-hero">
        <motion.div
          className="final-key"
          initial={{ rotate: -30, y: -80, opacity: 0 }}
          animate={{ rotate: 0, y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.25 }}
          aria-hidden="true"
        >
          <i />
          <span>017</span>
        </motion.div>
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.note}</p>
        </div>
      </header>
      <motion.section
        className="archive-cabinet"
        initial="closed"
        animate="open"
        variants={{
          closed: {},
          open: {
            transition: { staggerChildren: 0.18, delayChildren: 0.5 },
          },
        }}
      >
        <div className="cabinet-label">
          <span>CASE 017</span>
          <b>CASE REWARDS</b>
        </div>
        <div className="reward-drawer">
          {rewards.map(([mark, label], index) => (
            <motion.article
              key={label}
              variants={{
                closed: { opacity: 0, y: 50, scale: 0.9 },
                open: { opacity: 1, y: 0, scale: 1 },
              }}
            >
              <span>{mark}</span>
              <b>{label}</b>
              <small>UNLOCKED / {String(index + 1).padStart(2, "0")}</small>
            </motion.article>
          ))}
        </div>
        <span className="stamp reward-stamp">UNLOCKED</span>
      </motion.section>
      <div className="reward-footer">
        <p>{copy.caseClosed}</p>
        <button
          type="button"
          className="secondary-button"
          onClick={onRestart}
        >
          {copy.restart}
        </button>
      </div>
    </motion.main>
  );
}

export function ArchiveGame() {
  const { state, patchState, updateState, reset, hydrated } = useGameState();
  const [paramsApplied, setParamsApplied] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (!hydrated || paramsApplied) return;
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo") as PatternLevel | null;
    setDebugMode(params.get("debug") === "scoring");
    if (demo && ["mild", "moderate", "severe"].includes(demo)) {
      patchState({
        currentStep: "result",
        patternLevel: demo,
        interactionDimensions: demoDimensions[demo],
        scoringReasons: demoReasons[demo],
        completedFiles: perspectives.map((item) => item.id),
        viewedFiles: perspectives.map((item) => item.id),
        rewardFragments: 3,
        rewardUnlocked: false,
      });
    }
    setParamsApplied(true);
  }, [hydrated, paramsApplied, patchState]);

  const section = useMemo(() => {
    if (
      state.currentStep === "opening" ||
      state.currentStep === "introduction"
    )
      return "Brief";
    if (state.currentStep.includes("decision")) return "Choice";
    if (
      state.currentStep === "board" ||
      state.currentStep.startsWith("file-") ||
      state.currentStep === "puzzle-complete"
    )
      return "Files";
    if (state.currentStep === "result") return "Review";
    return "Reward";
  }, [state.currentStep]);

  if (!hydrated) {
    return (
      <main className="loading-archive">
        <span>ARCHIVE 1644</span>
        <b>OPENING CASE FILE…</b>
      </main>
    );
  }

  const openFile = (fileId: FileId) => {
    updateState((current) => {
      const viewedBefore = current.viewedFiles.includes(fileId);
      return {
        ...current,
        currentStep: `file-${fileId}`,
        viewedFiles: viewedBefore
          ? current.viewedFiles
          : [...current.viewedFiles, fileId],
        reopenedFiles:
          viewedBefore && current.completedFiles.includes(fileId)
            ? Array.from(new Set([...current.reopenedFiles, fileId]))
            : current.reopenedFiles,
      };
    });
  };

  const completeFile = (fileId: FileId) => {
    updateState((current) => {
      const completedFiles = current.completedFiles.includes(fileId)
        ? current.completedFiles
        : [...current.completedFiles, fileId];
      return {
        ...current,
        completedFiles,
        currentStep:
          completedFiles.length === 5 ? "puzzle-complete" : "board",
      };
    });
  };

  const inspectConnection = (fileId: FileId) => {
    updateState((current) => ({
      ...current,
      viewedConnections: current.viewedConnections.includes(fileId)
        ? current.viewedConnections
        : [...current.viewedConnections, fileId],
    }));
  };

  const submitFinal = () => {
    updateState((current) => {
      const result = calculatePattern(current);
      const groupInfluenceSelections = [
        ...(current.initialReasons.includes("popular-post")
          ? ["initial-popular-post"]
          : []),
        ...(current.perspectiveReason === "group-view"
          ? ["new-player-group-view"]
          : []),
        ...(current.selectedReasons.includes("group-majority")
          ? ["designer-group-majority"]
          : []),
        ...(current.finalReasons.includes("group-majority")
          ? ["final-group-majority"]
          : []),
      ];
      return {
        ...current,
        interactionDimensions: result.dimensions,
        scoringReasons: result.reasons,
        patternLevel: result.patternLevel,
        groupInfluenceSelections,
        currentStep: "result",
      };
    });
  };

  const unlockReward = () => {
    patchState({
      currentStep: "reward",
      rewardFragments: 4,
      rewardUnlocked: true,
    });
  };

  return (
    <div className="archive-app">
      <div className="grain" aria-hidden="true" />
      <RewardStatus
        fragments={state.rewardFragments}
        unlocked={state.rewardUnlocked}
      />
      {state.currentStep !== "opening" && (
        <CaseMarks current={section} />
      )}

      <AnimatePresence mode="wait">
        {state.currentStep === "opening" && (
          <Opening
            key="opening"
            onOpen={() => patchState({ currentStep: "introduction" })}
          />
        )}
        {state.currentStep === "introduction" && (
          <Introduction
            key="introduction"
            onReview={() =>
              patchState({ currentStep: "initial-decision" })
            }
          />
        )}
        {state.currentStep === "initial-decision" && (
          <InitialDecision
            key="initial"
            state={state}
            patchState={patchState}
            onContinue={() => patchState({ currentStep: "board" })}
          />
        )}
        {state.currentStep === "board" && (
          <InvestigationBoard
            key="board"
            state={state}
            onOpen={openFile}
          />
        )}
        {state.currentStep.startsWith("file-") && (
          <FileInvestigation
            key={state.currentStep}
            fileId={
              state.currentStep.replace("file-", "") as FileId
            }
            state={state}
            patchState={patchState}
            updateState={updateState}
            onComplete={completeFile}
            onBoard={() => patchState({ currentStep: "board" })}
          />
        )}
        {state.currentStep === "puzzle-complete" && (
          <CompletedPuzzle
            key="puzzle-complete"
            onInspect={inspectConnection}
            onContinue={() =>
              patchState({ currentStep: "final-decision" })
            }
          />
        )}
        {state.currentStep === "final-decision" && (
          <FinalDecisionPage
            key="final"
            state={state}
            patchState={patchState}
            onSubmit={submitFinal}
          />
        )}
        {state.currentStep === "result" && state.patternLevel && (
          <ResultPage
            key={`result-${state.patternLevel}`}
            level={state.patternLevel}
            dimensions={state.interactionDimensions}
            scoringReasons={state.scoringReasons}
            debug={debugMode}
            onComplete={unlockReward}
            onReview={() =>
              patchState({ currentStep: "final-decision" })
            }
          />
        )}
        {state.currentStep === "reward" && (
          <RewardPage key="reward" onRestart={reset} />
        )}
      </AnimatePresence>
    </div>
  );
}

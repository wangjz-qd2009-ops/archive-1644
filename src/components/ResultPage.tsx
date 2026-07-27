"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { perspectives } from "@/src/data/caseData";
import {
  archiveLabel,
  decisionLabels,
  generateCaseReflection,
  practiceActions,
  reflectionDisclaimer,
  ruleOptions,
  transferActions,
} from "@/src/utils/caseReflection";
import type {
  FileId,
  GameState,
  InvestigationRuleId,
  PracticeActionId,
  TransferActionId,
} from "@/src/types/game";

interface Props {
  state: GameState;
  patchState: (patch: Partial<GameState>) => void;
  onComplete: () => void;
  onReview: () => void;
}

const stageOrder: Array<{ id: GameState["resultStage"]; label: string }> = [
  { id: "reconstruction", label: "Reconstruct" },
  { id: "evidence", label: "Evidence" },
  { id: "turning-point", label: "Turn" },
  { id: "rule", label: "Rule" },
  { id: "practice", label: "Practice" },
  { id: "transfer", label: "Transfer" },
  { id: "closed", label: "Close" },
];

const turningReasons = [
  { id: "facts", label: "The facts of the case" },
  { id: "post-intention", label: "The intention behind the post" },
  { id: "player-effect", label: "The effect on other players" },
  {
    id: "criticism-attack",
    label: "The difference between criticism and personal attack",
  },
  { id: "limits", label: "The limits of the available evidence" },
  {
    id: "strengthened-original",
    label: "It strengthened my original judgement",
  },
  { id: "not-sure", label: "I am not sure" },
];

const practiceScenario =
  "A leaked screenshot claims that the next update removes a historical feature to satisfy new players. The full update note has not been released.";

const transferScenario =
  "A popular post accuses a character designer of deliberately insulting the game's historical setting. The post includes a cropped image but no link to the original interview.";

function appendEvent(state: GameState, event: string) {
  return Array.from(new Set([...state.resultEvents, event]));
}

function stageAfter(stage: GameState["resultStage"]) {
  const index = stageOrder.findIndex((item) => item.id === stage);
  return stageOrder[Math.min(index + 1, stageOrder.length - 1)].id;
}

function ResultShell({
  state,
  children,
}: {
  state: GameState;
  children: React.ReactNode;
}) {
  const activeIndex = stageOrder.findIndex(
    (stage) => stage.id === state.resultStage,
  );
  return (
    <motion.main
      className="result-page page-shell reflection-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="result-header">
        <span>CASE 017 / PRIVATE REFLECTION</span>
        <b>YOUR RESULT STAYS PRIVATE</b>
      </header>
      <nav className="reflection-steps" aria-label="Reflection stages">
        {stageOrder.map((stage, index) => (
          <span
            key={stage.id}
            className={index <= activeIndex ? "active" : ""}
            aria-current={stage.id === state.resultStage ? "step" : undefined}
          >
            {stage.label}
          </span>
        ))}
      </nav>
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </motion.main>
  );
}

function ContinueButton({
  state,
  patchState,
  label = "Continue",
}: {
  state: GameState;
  patchState: Props["patchState"];
  label?: string;
}) {
  return (
    <button
      type="button"
      className="primary-button"
      onClick={() =>
        patchState({
          resultStage: stageAfter(state.resultStage),
        })
      }
    >
      {label}
    </button>
  );
}

function ArchiveChips({ files }: { files: FileId[] }) {
  return (
    <div className="archive-chip-grid">
      {files.map((file) => {
        const perspective = perspectives.find((item) => item.id === file);
        return (
          <span className="archive-chip" key={file}>
            <small>{perspective?.code ?? file}</small>
            <b>{archiveLabel(file)}</b>
          </span>
        );
      })}
    </div>
  );
}

function CaseReconstruction({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  const reflection = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  });

  return (
    <motion.section
      className="reflection-stage case-reconstruction"
      key="reconstruction"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">CASE RECONSTRUCTION</span>
      <h1>Case Reconstruction</h1>
      <p>Let&apos;s retrace how your judgement developed.</p>

      <div className="judgement-path" aria-label="Judgement comparison">
        <article>
          <span>FIRST JUDGEMENT</span>
          <b>{reflection.reconstruction.first}</b>
        </article>
        <i aria-hidden="true" />
        <article>
          <span>FINAL JUDGEMENT</span>
          <b>{reflection.reconstruction.final}</b>
        </article>
      </div>

      <p className="reflection-note">
        {reflection.reconstruction.message}
      </p>

      <section className="trace-panel">
        <h2>Clues you said influenced your final judgement</h2>
        <ArchiveChips files={reflection.reconstruction.influencedArchives} />
        <small>
          If the final judgement used broad reason labels, this prototype maps
          them to the closest case files instead of inventing extra data.
        </small>
      </section>

      <p className="universal-disclaimer">{reflectionDisclaimer}</p>
      <div className="result-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => patchState({ currentStep: "final-decision" })}
        >
          Review Final Choice
        </button>
        <ContinueButton state={state} patchState={patchState} />
      </div>
    </motion.section>
  );
}

function EvidenceTrail({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  const reflection = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  });

  const toggleCard = (id: string) => {
    const expandedEvidenceCards = state.expandedEvidenceCards.includes(id)
      ? state.expandedEvidenceCards.filter((item) => item !== id)
      : [...state.expandedEvidenceCards, id];
    patchState({
      expandedEvidenceCards,
      resultEvents: appendEvent(state, "evidence_card_expanded"),
    });
  };

  return (
    <motion.section
      className="reflection-stage"
      key="evidence"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">EVIDENCE TRAIL</span>
      <h1>Your Evidence Trail</h1>
      <p>
        Each card is tied to a recorded choice in this prototype. It does not
        infer hidden motives.
      </p>

      <div className="evidence-card-grid">
        {reflection.evidenceCards.map((card) => {
          const expanded = state.expandedEvidenceCards.includes(card.id);
          return (
            <article className="reflection-evidence-card" key={card.id}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => toggleCard(card.id)}
              >
                <span>{card.title}</span>
                <b>{expanded ? "Hide source" : "Show source"}</b>
              </button>
              <p>
                <strong>Evidence:</strong> {card.evidence}
              </p>
              <p>{card.explanation}</p>
              <AnimatePresence>
                {expanded && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {card.sources.map((source) => (
                      <li key={source}>{source}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>

      <div className="result-actions">
        <ContinueButton state={state} patchState={patchState} />
      </div>
    </motion.section>
  );
}

function TurningPoint({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  const preferredFiles = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  }).reconstruction.influencedArchives;

  const files = preferredFiles.length ? preferredFiles : state.completedFiles;
  const effectiveTurningPointFile =
    state.turningPointFile ?? (files.length === 1 ? files[0] : null);

  return (
    <motion.section
      className="reflection-stage"
      key="turning-point"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">TURNING POINT</span>
      <h1>Where Did the Case Turn?</h1>
      <p>Which clue most changed or strengthened your judgement?</p>

      <div className="archive-select-grid" role="radiogroup">
        {files.map((file) => (
          <button
            type="button"
            role="radio"
            aria-checked={effectiveTurningPointFile === file}
            className={effectiveTurningPointFile === file ? "selected" : ""}
            key={file}
            onClick={() =>
              patchState({
                turningPointFile: file,
                resultEvents: appendEvent(
                  state,
                  "turning_point_selected",
                ),
              })
            }
          >
            <small>{perspectives.find((item) => item.id === file)?.code}</small>
            <b>{archiveLabel(file)}</b>
          </button>
        ))}
      </div>

      <fieldset className="turning-reasons">
        <legend>What did this clue make you reconsider?</legend>
        {turningReasons.map((reason) => (
          <label key={reason.id}>
            <input
              type="radio"
              name="turning-point-reason"
              checked={state.turningPointReason === reason.id}
              onChange={() =>
                patchState({
                  turningPointReason: reason.id,
                  resultEvents: appendEvent(
                    state,
                    "turning_point_selected",
                  ),
                })
              }
            />
            <span>{reason.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="result-actions">
        {(!effectiveTurningPointFile || !state.turningPointReason) && (
          <small className="action-requirement">
            Select one clue and one reason to continue.
          </small>
        )}
        <button
          type="button"
          className="primary-button"
          disabled={!effectiveTurningPointFile || !state.turningPointReason}
          onClick={() =>
            patchState({
              turningPointFile: effectiveTurningPointFile,
              resultStage: "rule",
            })
          }
        >
          Continue
        </button>
      </div>

      <p className="reflection-note">
        This is your interpretation of the turning point, not proof of why your
        behaviour changed.
      </p>
    </motion.section>
  );
}

function RuleChoice({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  const [showAll, setShowAll] = useState(false);
  const reflection = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  });
  const selectedRule = state.adoptedRule ?? reflection.recommendedRule;
  const visibleRules = showAll
    ? Object.entries(ruleOptions)
    : [[reflection.recommendedRule, ruleOptions[reflection.recommendedRule]]];

  return (
    <motion.section
      className="reflection-stage"
      key="rule"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">NEXT CASE RULE</span>
      <h1>Choose One Rule for Your Next Case</h1>
      <p>
        The highlighted rule is a recommendation from this case record. You can
        choose a different one.
      </p>

      <div className="rule-card-grid">
        {visibleRules.map(([id, rule]) => (
          <button
            type="button"
            key={id}
            className={`rule-card ${selectedRule === id ? "selected" : ""}`}
            onClick={() =>
              patchState({ adoptedRule: id as InvestigationRuleId })
            }
          >
            <span>
              {id === reflection.recommendedRule ? "PRIMARY RULE" : "RULE"}
            </span>
            <b>{rule.title}</b>
            <small>{rule.description}</small>
          </button>
        ))}
      </div>

      <div className="result-actions">
        {!state.practiceAction && (
          <small className="action-requirement">
            Select one practice action, or skip practice.
          </small>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Show Recommended Rule" : "Choose a Different Rule"}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() =>
            patchState({
              adoptedRule: selectedRule,
              resultStage: "practice",
              resultEvents: appendEvent(
                state,
                "investigation_rule_adopted",
              ),
            })
          }
        >
          Adopt This Rule
        </button>
      </div>
    </motion.section>
  );
}

function PracticeCase({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  const adoptedRule = state.adoptedRule;
  const summary = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  }).practiceSummary;

  return (
    <motion.section
      className="reflection-stage practice-case"
      key="practice"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">PRACTICE CASE</span>
      <h1>Practice on a New Case</h1>
      <p>{practiceScenario}</p>

      <div className="comment-stack">
        <p>The developers have officially abandoned the original fans.</p>
        <p>
          We have only seen one screenshot. The full update may explain it.
        </p>
        <p>Anyone defending this update is not a real fan.</p>
      </div>

      {adoptedRule && (
        <aside className="rule-reminder">
          <span>Your investigation rule is available here.</span>
          <b>{ruleOptions[adoptedRule].title}</b>
        </aside>
      )}

      <div className="action-grid" role="radiogroup">
        {Object.entries(practiceActions).map(([id, label]) => (
          <button
            type="button"
            role="radio"
            key={id}
            aria-checked={state.practiceAction === id}
            className={state.practiceAction === id ? "selected" : ""}
            onClick={() =>
              patchState({
                practiceAction: id as PracticeActionId,
                practiceSkipped: false,
                resultEvents: appendEvent(
                  state,
                  "practice_action_selected",
                ),
              })
            }
          >
            {label}
          </button>
        ))}
      </div>

      {(state.practiceAction || state.practiceSkipped) && (
        <p className="reflection-note">{summary}</p>
      )}

      <div className="result-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            patchState({
              practiceSkipped: true,
              practiceAction: null,
              resultStage: "transfer",
              resultEvents: appendEvent(state, "practice_skipped"),
            })
          }
        >
          Skip Practice
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!state.practiceAction}
          onClick={() =>
            patchState({
              resultStage: "transfer",
              resultEvents: appendEvent(state, "practice_completed"),
            })
          }
        >
          Continue
        </button>
      </div>
    </motion.section>
  );
}

function TransferCheck({
  state,
  patchState,
}: {
  state: GameState;
  patchState: Props["patchState"];
}) {
  return (
    <motion.section
      className="reflection-stage practice-case"
      key="transfer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="eyebrow">FINAL INDEPENDENT CASE</span>
      <h1>One Final Case</h1>
      <p>{transferScenario}</p>

      <div className="action-grid transfer-grid" role="radiogroup">
        {Object.entries(transferActions).map(([id, label]) => (
          <button
            type="button"
            role="radio"
            key={id}
            aria-checked={state.transferAction === id}
            className={state.transferAction === id ? "selected" : ""}
            onClick={() =>
              patchState({
                transferAction: id as TransferActionId,
                resultEvents: appendEvent(
                  state,
                  "transfer_action_selected",
                ),
              })
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="result-actions">
        {!state.transferAction && (
          <small className="action-requirement">
            Select one action to close the case.
          </small>
        )}
        <button
          type="button"
          className="primary-button"
          disabled={!state.transferAction}
          onClick={() => patchState({ resultStage: "closed" })}
        >
          Close Case
        </button>
      </div>
    </motion.section>
  );
}

function CaseClosed({
  state,
  patchState,
  onComplete,
}: {
  state: GameState;
  patchState: Props["patchState"];
  onComplete: () => void;
}) {
  const reflection = generateCaseReflection({
    initialDecision: state.initialChoice,
    finalDecision: state.finalChoice,
    selectedInfluentialClues: state.finalReasons,
    viewedArchives: state.completedFiles,
    turningPoint: state.turningPointFile,
    turningPointReason: state.turningPointReason,
    adoptedRule: state.adoptedRule,
    practiceAction: state.practiceAction,
    practiceSkipped: state.practiceSkipped,
    transferAction: state.transferAction,
    classificationPlacements: state.classificationPlacements,
  });
  const rule = state.adoptedRule ?? reflection.recommendedRule;

  return (
    <motion.section
      className="reflection-stage case-closed"
      key="closed"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="stamp reward-stamp">CASE CLOSED</span>
      <h1>Case Closed</h1>
      <p>How your investigation developed</p>

      <div className="closing-timeline">
        <article>
          <span>01 / First Judgement</span>
          <p>
            In the first case, your first recorded judgement was{" "}
            <b>
              {state.initialChoice
                ? decisionLabels[state.initialChoice]
                : "not recorded"}
            </b>
            .
          </p>
        </article>
        <article>
          <span>02 / Guided Practice</span>
          <p>{reflection.practiceSummary}</p>
        </article>
        <article>
          <span>03 / Final Independent Case</span>
          <p>{reflection.transferSummary}</p>
        </article>
      </div>

      <section className="final-reflection-card">
        <h2>{reflection.finalReflection}</h2>
        <p>
          My Rule for the Next Case: <b>{ruleOptions[rule].title}</b>
        </p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => patchState({ savedCaseCard: true })}
        >
          {state.savedCaseCard ? "Case Card Saved" : "Save Case Card"}
        </button>
      </section>

      <p className="universal-disclaimer">{reflectionDisclaimer}</p>

      <div className="result-actions">
        <button
          type="button"
          className="primary-button"
          onClick={onComplete}
        >
          Unlock Original Rewards
        </button>
      </div>
    </motion.section>
  );
}

export function ResultPage(props: Props) {
  const stage = props.state.resultStage;

  useEffect(() => {
    if (!props.state.resultEvents.includes("result_reconstruction_viewed")) {
      props.patchState({
        resultEvents: appendEvent(
          props.state,
          "result_reconstruction_viewed",
        ),
      });
    }
  }, [props]);

  return (
    <ResultShell state={props.state}>
      {stage === "reconstruction" && (
        <CaseReconstruction
          state={props.state}
          patchState={props.patchState}
        />
      )}
      {stage === "evidence" && (
        <EvidenceTrail state={props.state} patchState={props.patchState} />
      )}
      {stage === "turning-point" && (
        <TurningPoint state={props.state} patchState={props.patchState} />
      )}
      {stage === "rule" && (
        <RuleChoice state={props.state} patchState={props.patchState} />
      )}
      {stage === "practice" && (
        <PracticeCase state={props.state} patchState={props.patchState} />
      )}
      {stage === "transfer" && (
        <TransferCheck state={props.state} patchState={props.patchState} />
      )}
      {stage === "closed" && (
        <CaseClosed
          state={props.state}
          patchState={props.patchState}
          onComplete={props.onComplete}
        />
      )}
    </ResultShell>
  );
}

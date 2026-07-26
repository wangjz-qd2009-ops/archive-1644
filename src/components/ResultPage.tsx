"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { gameCopy } from "@/src/data/gameCopy";
import type {
  InteractionDimensions,
  PatternLevel,
  ScoringReason,
} from "@/src/types/game";

interface Props {
  level: PatternLevel;
  dimensions: InteractionDimensions;
  scoringReasons: ScoringReason[];
  debug: boolean;
  onComplete: () => void;
  onReview: () => void;
}

const dimensionLabels: Record<keyof InteractionDimensions, string> = {
  exploration: "Exploring Information",
  evidenceChecking: "Checking Evidence",
  understandingOthers: "Understanding Others",
  groupDependence: "Group Dependence",
  hostilityTolerance: "Hostility Tolerance",
};

function DebugLedger({
  dimensions,
  reasons,
  level,
}: {
  dimensions: InteractionDimensions;
  reasons: ScoringReason[];
  level: PatternLevel;
}) {
  return (
    <section className="debug-ledger" aria-label="Scoring debug panel">
      <header>
        <span>DEBUG / SCORING</span>
        <b>FINAL LEVEL: {level.toUpperCase()}</b>
      </header>
      <div className="debug-grid">
        {Object.entries(dimensions).map(([key, score]) => (
          <div key={key}>
            <span>
              {dimensionLabels[key as keyof InteractionDimensions]}
            </span>
            <output>{score} / 20</output>
          </div>
        ))}
      </div>
      <ul>
        {reasons.map((reason, index) => (
          <li key={`${reason.dimension}-${index}`}>
            <b>{dimensionLabels[reason.dimension]}:</b> {reason.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AiAvatar({ level }: { level: PatternLevel }) {
  const label =
    level === "mild"
      ? "Soft round AI archive guide"
      : level === "moderate"
        ? "AI support guide with a simple metal face"
        : "AI cyber-safety guide with a dark red scanner";
  return (
    <div className={`ai-avatar ${level}`} role="img" aria-label={label}>
      <div className="avatar-halo" />
      <div className="avatar-face">
        <i className="eye left" />
        <i className="eye right" />
        <i className="voice-line" />
      </div>
      <span className="scan-line" />
      <span className="avatar-id">AI / 017</span>
    </div>
  );
}

function MildResult(props: Props) {
  const [learn, setLearn] = useState(false);
  const copy = gameCopy.results.mild;
  return (
    <>
      <div className="result-identity">
        <AiAvatar level="mild" />
        <div>
          <span className="eyebrow">{copy.role}</span>
          <h1>{copy.title}</h1>
          <p>{copy.feedback}</p>
        </div>
      </div>
      <AnimatePresence>
        {learn && (
          <motion.section
            className="guidance-sheet"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <h2>One source, many echoes</h2>
            <ul>
              {copy.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
      <div className="result-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setLearn((value) => !value)}
        >
          {copy.buttons[0]}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={props.onReview}
        >
          {copy.buttons[1]}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={props.onComplete}
        >
          {copy.buttons[2]}
        </button>
      </div>
    </>
  );
}

const guidePrompts = [
  {
    question: "Which part made you feel annoyed?",
    replies: ["The history claim", "The group posts", "The hard trade-off"],
  },
  {
    question: "Do online arguments often feel personal?",
    replies: ["Often", "Sometimes", "Not often"],
  },
  {
    question: "What could help you pause next time?",
    replies: ["Check the source", "Wait before replying", "Read another view"],
  },
];

function ModerateResult(props: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const activePrompt = guidePrompts[Math.min(round, guidePrompts.length - 1)];
  const copy = gameCopy.results.moderate;

  const reply = (text: string) => {
    setResponses((current) => [...current, text]);
    setRound((current) => current + 1);
  };

  return (
    <>
      <div className="result-identity">
        <AiAvatar level="moderate" />
        <div>
          <span className="eyebrow">{copy.role}</span>
          <h1>{copy.title}</h1>
          <p>{copy.feedback}</p>
          <strong className="identity-disclaimer">{copy.identity}</strong>
        </div>
      </div>
      <section className="guidance-sheet">
        <ul>
          {copy.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {chatOpen && (
          <motion.section
            className="guide-chat"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <header>
              <div className="mini-avatar" aria-hidden="true" />
              <div>
                <b>{copy.role}</b>
                <small>PRIVATE / OPTIONAL</small>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Exit chat"
              >
                ×
              </button>
            </header>
            <div className="chat-log" aria-live="polite">
              {responses.map((response, index) => (
                <div key={`${response}-${index}`}>
                  <p className="guide-line">
                    {guidePrompts[index].question}
                  </p>
                  <p className="user-line">{response}</p>
                </div>
              ))}
              {round < guidePrompts.length ? (
                <>
                  <p className="guide-line">{activePrompt.question}</p>
                  <div className="quick-replies">
                    {activePrompt.replies.map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => reply(option)}
                      >
                        {option}
                      </button>
                    ))}
                    <button type="button" onClick={() => reply("Skipped")}>
                      SKIP
                    </button>
                  </div>
                </>
              ) : (
                <p className="guide-line">
                  Your note is saved. You can leave now.
                </p>
              )}
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => setChatOpen(false)}
            >
              EXIT CHAT
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="result-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => setChatOpen(true)}
        >
          {copy.buttons[0]}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={props.onComplete}
        >
          {copy.buttons[1]}
        </button>
      </div>
    </>
  );
}

function SevereResult(props: Props) {
  const [panel, setPanel] = useState<"rules" | "support" | null>(null);
  const copy = gameCopy.results.severe;
  const panelContent = useMemo(() => {
    if (panel === "rules") {
      return {
        title: "ONLINE SAFETY NOTES",
        items: [
          "Do not share private details or threats.",
          "Block and report instead of attacking back.",
          "Save proof without reposting private details.",
        ],
      };
    }
    return {
      title: "SUPPORT OPTIONS",
      items: [
        "Step away and tell a trusted person.",
        "Use the platform’s safety tools.",
        "Ask for help if online fights affect daily life.",
      ],
    };
  }, [panel]);

  return (
    <>
      <div className="result-identity">
        <AiAvatar level="severe" />
        <div>
          <span className="eyebrow">{copy.role}</span>
          <h1>{copy.title}</h1>
          <p>{copy.feedback}</p>
          <strong className="identity-disclaimer">{copy.identity}</strong>
        </div>
      </div>
      <section className="guidance-sheet severe-guidance">
        <ul>
          {copy.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>

      <AnimatePresence mode="wait">
        {panel && (
          <motion.section
            className="safety-panel"
            key={panel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="stamp small">PAUSE & REVIEW</span>
            <h2>{panelContent.title}</h2>
            <ul>
              {panelContent.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="result-actions severe-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setPanel("rules")}
        >
          {copy.buttons[0]}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={props.onComplete}
        >
          {copy.buttons[1]}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setPanel("support")}
        >
          {copy.buttons[2]}
        </button>
      </div>
    </>
  );
}

export function ResultPage(props: Props) {
  return (
    <motion.main
      className={`result-page page-shell result-${props.level}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="result-header">
        <span>{gameCopy.results.header}</span>
        <b>{gameCopy.results.private}</b>
      </header>
      {props.level === "mild" && <MildResult {...props} />}
      {props.level === "moderate" && <ModerateResult {...props} />}
      {props.level === "severe" && <SevereResult {...props} />}
      {props.debug && (
        <DebugLedger
          dimensions={props.dimensions}
          reasons={props.scoringReasons}
          level={props.level}
        />
      )}
      <p className="universal-disclaimer">
        {gameCopy.results.disclaimer}
      </p>
    </motion.main>
  );
}

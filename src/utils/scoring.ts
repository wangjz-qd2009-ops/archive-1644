import type {
  GameState,
  InteractionDimension,
  InteractionDimensions,
  PatternLevel,
  ScoringReason,
} from "@/src/types/game";

const clamp = (value: number) =>
  Math.max(0, Math.min(20, Math.round(value)));

function addReason(
  reasons: ScoringReason[],
  dimension: InteractionDimension,
  text: string,
) {
  reasons.push({ dimension, text });
}

function clueSignal(
  placements: Record<string, string>,
  expected: Record<string, string>,
  points: number,
) {
  return Object.entries(expected).reduce(
    (score, [item, slot]) =>
      score + (placements[item] === slot ? points : 0),
    0,
  );
}

export function calculatePattern(state: GameState): {
  dimensions: InteractionDimensions;
  patternLevel: PatternLevel;
  reasons: ScoringReason[];
} {
  const reasons: ScoringReason[] = [];
  const totalReadTime = Object.values(state.readingTime).reduce(
    (sum, seconds) => sum + (seconds ?? 0),
    0,
  );

  const exploration = clamp(
    state.completedFiles.length * 2.6 +
      state.viewedFiles.length * 0.8 +
      Math.min(2, state.designerReadGoals.length * 0.7) +
      Math.min(1.5, state.viewedConnections.length * 0.5) +
      Math.min(1.5, state.reopenedFiles.length * 0.75) +
      Math.min(1.5, totalReadTime / 120) -
      Math.min(4, state.skippedContent * 0.8),
  );
  addReason(
    reasons,
    "exploration",
    `${state.completedFiles.length} files saved; ${state.reopenedFiles.length} files reopened.`,
  );

  const evidenceBase = clueSignal(
    state.classificationPlacements,
    {
      h1: "known",
      h2: "known",
      h3: "possible",
      h4: "possible",
      h5: "made-up",
      h6: "made-up",
    },
    2.7,
  );
  const usesPossible = Object.entries(
    state.classificationPlacements,
  ).some(
    ([item, slot]) => item.startsWith("h") && slot === "possible",
  );
  const evidenceChecking = clamp(
    evidenceBase + (usesPossible ? 3.8 : 0),
  );
  addReason(
    reasons,
    "evidenceChecking",
    usesPossible
      ? "Used the middle clue type."
      : "Used only the two outer clue types.",
  );

  const viewPoints: Record<string, number> = {
    A: 2,
    B: 9,
    C: 9,
    D: 14,
  };
  const reasonPoints: Record<string, number> = {
    "exact-words": 4,
    "first-impression": 2,
    "group-view": 0,
    "not-sure": 3,
  };
  const understandingOthers = clamp(
    (state.perspectiveAnswer
      ? viewPoints[state.perspectiveAnswer] ?? 4
      : 0) +
      (state.perspectiveReason
        ? reasonPoints[state.perspectiveReason] ?? 0
        : 0) +
      (state.finalReasons.length >= 2 ? 2 : 0),
  );
  addReason(
    reasons,
    "understandingOthers",
    `New Player view: ${state.perspectiveAnswer ?? "none"}; source: ${state.perspectiveReason ?? "none"}.`,
  );

  const designerOnlyGroup =
    state.selectedReasons.length === 1 &&
    state.selectedReasons[0] === "group-majority";
  const finalOnlyGroup =
    state.finalReasons.length === 1 &&
    state.finalReasons[0] === "group-majority";
  const groupDependence = clamp(
    (state.initialReasons.includes("popular-post") ? 4 : 0) +
      (state.perspectiveReason === "group-view" ? 6 : 0) +
      (designerOnlyGroup
        ? 8
        : state.selectedReasons.includes("group-majority")
          ? 3
          : 0) +
      (finalOnlyGroup
        ? 8
        : state.finalReasons.includes("group-majority")
          ? 3
          : 0),
  );
  addReason(
    reasons,
    "groupDependence",
    designerOnlyGroup || finalOnlyGroup
      ? "A group choice was the only reason."
      : "The final view used more than the group vote.",
  );

  let hostilityTolerance = 0;
  const placements = state.classificationPlacements;
  if (placements.v3 === "fair") hostilityTolerance += 7;
  if (placements.v3 === "feeling") hostilityTolerance += 4;
  if (placements.m3 === "helpful" || placements.m3 === "taste")
    hostilityTolerance += 4;
  if (placements.m4 === "helpful" || placements.m4 === "taste")
    hostilityTolerance += 4;
  if (placements.m5 === "helpful" || placements.m5 === "taste")
    hostilityTolerance += 7;
  if (placements.m1 === "attack") hostilityTolerance += 2;
  if (placements.m2 === "attack") hostilityTolerance += 2;
  hostilityTolerance = clamp(hostilityTolerance);
  addReason(
    reasons,
    "hostilityTolerance",
    hostilityTolerance >= 10
      ? "Several attacks were filed as normal comments."
      : "Most attacks were kept apart from normal comments.",
  );

  const dimensions: InteractionDimensions = {
    exploration,
    evidenceChecking,
    understandingOthers,
    groupDependence,
    hostilityTolerance,
  };

  const riskSignals = [
    20 - exploration,
    20 - evidenceChecking,
    20 - understandingOthers,
    groupDependence,
    hostilityTolerance,
  ];
  const averageRisk =
    riskSignals.reduce((sum, value) => sum + value, 0) /
    riskSignals.length;
  const strongSignals = riskSignals.filter(
    (value) => value >= 13,
  ).length;
  const warningSignals = riskSignals.filter(
    (value) => value >= 9,
  ).length;
  const certaintyStayedHigh =
    state.confidenceLevels.initial >= 85 &&
    state.confidenceLevels.final >= 85 &&
    Math.abs(
      state.confidenceLevels.final - state.confidenceLevels.initial,
    ) < 5 &&
    state.confidenceLevels.historian === "very-sure";

  let patternLevel: PatternLevel = "mild";
  if (
    averageRisk >= 13 &&
    strongSignals >= 3 &&
    groupDependence >= 13 &&
    hostilityTolerance >= 13 &&
    certaintyStayedHigh
  ) {
    patternLevel = "severe";
  } else if (
    (averageRisk >= 8.5 && warningSignals >= 2) ||
    strongSignals >= 2
  ) {
    patternLevel = "moderate";
  }

  addReason(
    reasons,
    "exploration",
    `Level uses ${strongSignals} strong signals and ${warningSignals} warning signals.`,
  );

  return { dimensions, patternLevel, reasons };
}

export const demoDimensions: Record<
  PatternLevel,
  InteractionDimensions
> = {
  mild: {
    exploration: 18,
    evidenceChecking: 17,
    understandingOthers: 18,
    groupDependence: 4,
    hostilityTolerance: 3,
  },
  moderate: {
    exploration: 11,
    evidenceChecking: 10,
    understandingOthers: 9,
    groupDependence: 12,
    hostilityTolerance: 10,
  },
  severe: {
    exploration: 5,
    evidenceChecking: 5,
    understandingOthers: 4,
    groupDependence: 17,
    hostilityTolerance: 18,
  },
};

export const demoReasons: Record<
  PatternLevel,
  ScoringReason[]
> = {
  mild: [
    {
      dimension: "exploration",
      text: "All five files were viewed.",
    },
    {
      dimension: "groupDependence",
      text: "Several reasons shaped the final view.",
    },
  ],
  moderate: [
    {
      dimension: "groupDependence",
      text: "The group view shaped several choices.",
    },
    {
      dimension: "exploration",
      text: "Few files were checked again.",
    },
  ],
  severe: [
    {
      dimension: "hostilityTolerance",
      text: "Several attacks were treated as normal.",
    },
    {
      dimension: "groupDependence",
      text: "The group vote was used again and again.",
    },
    {
      dimension: "exploration",
      text: "Several clues were skipped.",
    },
  ],
};

export type FileId =
  | "veteran"
  | "historian"
  | "new-player"
  | "designer"
  | "moderator";

export type GameStep =
  | "opening"
  | "introduction"
  | "initial-decision"
  | "board"
  | `file-${FileId}`
  | "puzzle-complete"
  | "final-decision"
  | "result"
  | "reward";

export type DecisionChoice =
  | "remove"
  | "keep"
  | "revise"
  | "investigate";

export type PatternLevel = "mild" | "moderate" | "severe";
export type ResultLevel = PatternLevel;

export type ConfidenceChoice =
  | "not-sure"
  | "a-little-sure"
  | "quite-sure"
  | "very-sure";

export interface ClassificationItem {
  id: string;
  text: string;
}

export interface ClassificationSlot {
  id: string;
  label: string;
  note?: string;
}

export interface InteractionDimensions {
  exploration: number;
  evidenceChecking: number;
  understandingOthers: number;
  groupDependence: number;
  hostilityTolerance: number;
}

export type InteractionDimension = keyof InteractionDimensions;

export interface ScoringReason {
  dimension: InteractionDimension;
  text: string;
}

export interface TeammateProgress {
  name: string;
  status: "File submitted" | "Checking clues" | "Case active";
}

export interface GameState {
  currentStep: GameStep;
  viewedFiles: FileId[];
  completedFiles: FileId[];
  reopenedFiles: FileId[];
  viewedConnections: FileId[];
  readingTime: Partial<Record<FileId, number>>;
  skippedContent: number;
  initialChoice: DecisionChoice | null;
  initialReasons: string[];
  finalChoice: DecisionChoice | null;
  finalReasons: string[];
  confidenceLevels: {
    initial: number;
    final: number;
    historian: ConfidenceChoice | null;
  };
  changedConfidence: boolean;
  selectedChoices: Record<string, string | string[]>;
  classificationPlacements: Record<string, string>;
  perspectiveAnswer: string | null;
  perspectiveReason: string | null;
  designerAllocation: Record<"history" | "players" | "fun", number>;
  designerReadGoals: string[];
  designerExplanation: string;
  selectedReasons: string[];
  groupInfluenceSelections: string[];
  interactionDimensions: InteractionDimensions;
  scoringReasons: ScoringReason[];
  patternLevel: PatternLevel | null;
  rewardFragments: number;
  rewardUnlocked: boolean;
  teammateProgress: TeammateProgress[];
}

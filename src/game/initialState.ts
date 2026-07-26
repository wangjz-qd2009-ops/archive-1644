import type {
  GameState,
  InteractionDimensions,
} from "@/src/types/game";

export const emptyDimensions: InteractionDimensions = {
  exploration: 0,
  evidenceChecking: 0,
  understandingOthers: 0,
  groupDependence: 0,
  hostilityTolerance: 0,
};

export const initialGameState: GameState = {
  currentStep: "opening",
  viewedFiles: [],
  completedFiles: [],
  reopenedFiles: [],
  viewedConnections: [],
  readingTime: {},
  skippedContent: 0,
  initialChoice: null,
  initialReasons: [],
  finalChoice: null,
  finalReasons: [],
  confidenceLevels: {
    initial: 50,
    final: 50,
    historian: null,
  },
  changedConfidence: false,
  selectedChoices: {},
  classificationPlacements: {},
  perspectiveAnswer: null,
  perspectiveReason: null,
  designerAllocation: {
    history: 35,
    players: 30,
    fun: 35,
  },
  designerReadGoals: [],
  designerExplanation: "",
  selectedReasons: [],
  groupInfluenceSelections: [],
  interactionDimensions: emptyDimensions,
  scoringReasons: [],
  patternLevel: null,
  rewardFragments: 3,
  rewardUnlocked: false,
  teammateProgress: [
    { name: "Raven_03", status: "File submitted" },
    { name: "NorthStar", status: "Checking clues" },
    { name: "Lynx_17", status: "File submitted" },
    { name: "You", status: "Case active" },
  ],
};

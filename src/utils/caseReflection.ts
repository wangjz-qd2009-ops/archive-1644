import {
  finalReasonOptions,
  perspectives,
} from "@/src/data/caseData";
import type {
  DecisionChoice,
  FileId,
  InvestigationRuleId,
  PracticeActionId,
  TransferActionId,
} from "@/src/types/game";

export const reflectionDisclaimer =
  "This reflection is based on your choices in this case. It is not a diagnosis of your identity, beliefs, or personality.";

export const decisionLabels: Record<DecisionChoice, string> = {
  remove: "Remove",
  keep: "Keep",
  revise: "Modify",
  investigate: "Need More Evidence",
};

export const ruleOptions: Record<
  InvestigationRuleId,
  { title: string; description: string }
> = {
  "check-source": {
    title: "Check the source before following the crowd.",
    description:
      "When a claim becomes popular, open one original source before deciding.",
  },
  "critique-claim": {
    title: "Critique the claim, not the person.",
    description:
      "Keep your position, but separate criticism of an idea from labels about a person.",
  },
  "leave-uncertainty": {
    title: "Leave room for uncertainty.",
    description:
      "When evidence is incomplete, 'not sure yet' can be a responsible decision.",
  },
  "missing-perspective": {
    title: "Look for one missing perspective.",
    description:
      "Before closing the case, ask whose experience has not been considered.",
  },
};

export const practiceActions: Record<PracticeActionId, string> = {
  "open-source": "Open the available source",
  "read-discussion": "Read the full discussion",
  "rewrite-reply": "Rewrite a reply",
  "not-enough-evidence": "Choose 'Not enough evidence yet'",
  "respond-immediately": "Respond immediately",
  "leave-discussion": "Leave the discussion briefly",
};

export const transferActions: Record<TransferActionId, string> = {
  "open-interview": "Open the original interview",
  "read-interpretation": "Read another interpretation",
  "rewrite-response": "Rewrite a response",
  "not-sure-yet": "Choose 'Not sure yet'",
  "reply-immediately": "Reply immediately",
  "remove-post": "Remove the post",
  "keep-post": "Keep the post",
  "modify-post": "Modify the post",
};

export interface EvidenceCard {
  id: string;
  title: string;
  evidence: string;
  explanation: string;
  sources: string[];
}

export interface CaseReflectionInput {
  initialDecision: DecisionChoice | null;
  finalDecision: DecisionChoice | null;
  selectedInfluentialClues: string[];
  viewedArchives: FileId[];
  turningPoint: FileId | null;
  turningPointReason: string | null;
  adoptedRule: InvestigationRuleId | null;
  practiceAction: PracticeActionId | null;
  practiceSkipped: boolean;
  transferAction: TransferActionId | null;
  classificationPlacements?: Record<string, string>;
}

export interface CaseReflection {
  reconstruction: {
    first: string;
    final: string;
    message: string;
    influencedArchives: FileId[];
  };
  evidenceCards: EvidenceCard[];
  recommendedRule: InvestigationRuleId;
  practiceSummary: string;
  transferSummary: string;
  finalReflection: string;
}

const reasonToArchives: Record<string, FileId[]> = {
  history: ["historian", "veteran"],
  players: ["new-player"],
  fun: ["designer"],
  community: ["moderator"],
  "group-majority": ["moderator"],
  combined: ["veteran", "historian", "new-player", "designer", "moderator"],
};

const archiveNames = new Map(
  perspectives.map((item) => [item.id, item.role]),
);

function uniqueArchives(archives: FileId[]): FileId[] {
  return Array.from(new Set(archives));
}

export function archiveLabel(fileId: FileId): string {
  return archiveNames.get(fileId) ?? fileId;
}

export function influentialArchivesFromReasons(
  selectedInfluentialClues: string[],
  viewedArchives: FileId[],
): FileId[] {
  const mapped = selectedInfluentialClues.flatMap(
    (reason) => reasonToArchives[reason] ?? [],
  );
  const available = mapped.filter((file) => viewedArchives.includes(file));
  if (available.length > 0) return uniqueArchives(available);
  return viewedArchives.slice(0, 3);
}

function reasonLabels(selectedInfluentialClues: string[]): string[] {
  return selectedInfluentialClues
    .map(
      (reason) =>
        finalReasonOptions.find((option) => option.id === reason)?.label,
    )
    .filter((label): label is string => Boolean(label));
}

function hasAttackJudgement(placements: Record<string, string>) {
  return ["v3", "m3", "m4", "m5"].some((item) => placements[item]);
}

export function recommendRule(
  input: Pick<
    CaseReflectionInput,
    | "initialDecision"
    | "finalDecision"
    | "selectedInfluentialClues"
    | "turningPointReason"
    | "classificationPlacements"
  >,
): InvestigationRuleId {
  if (
    input.initialDecision === "investigate" ||
    input.selectedInfluentialClues.includes("history") ||
    (input.initialDecision &&
      input.finalDecision &&
      input.initialDecision !== input.finalDecision)
  ) {
    return "check-source";
  }
  if (
    input.selectedInfluentialClues.includes("community") ||
    input.selectedInfluentialClues.includes("group-majority") ||
    hasAttackJudgement(input.classificationPlacements ?? {})
  ) {
    return "critique-claim";
  }
  if (
    input.initialDecision === "investigate" ||
    input.turningPointReason === "limits"
  ) {
    return "leave-uncertainty";
  }
  return "missing-perspective";
}

function actionMatchesRule(
  rule: InvestigationRuleId | null,
  action: PracticeActionId | TransferActionId | null,
) {
  if (!rule || !action) return false;
  if (rule === "check-source") {
    return action === "open-source" || action === "open-interview";
  }
  if (rule === "critique-claim") {
    return action === "rewrite-reply" || action === "rewrite-response";
  }
  if (rule === "leave-uncertainty") {
    return action === "not-enough-evidence" || action === "not-sure-yet";
  }
  return action === "read-discussion" || action === "read-interpretation";
}

export function generateCaseReflection(
  input: CaseReflectionInput,
): CaseReflection {
  const first = input.initialDecision
    ? decisionLabels[input.initialDecision]
    : "No first judgement recorded";
  const final = input.finalDecision
    ? decisionLabels[input.finalDecision]
    : "No final judgement recorded";
  const influencedArchives = influentialArchivesFromReasons(
    input.selectedInfluentialClues,
    input.viewedArchives,
  );

  let message =
    "Your judgement stayed the same, but it was reconsidered with more evidence.";
  if (input.initialDecision === "investigate") {
    message =
      "You chose to preserve uncertainty before reaching a conclusion.";
  } else if (
    input.initialDecision &&
    input.finalDecision &&
    input.initialDecision !== input.finalDecision
  ) {
    message =
      "You revised your judgement after reviewing the five case files.";
  }

  const cards: EvidenceCard[] = [
    {
      id: "judgement-path",
      title:
        input.initialDecision && input.initialDecision !== input.finalDecision
          ? "Your judgement changed after investigation"
          : "You reconsidered your judgement after investigation",
      evidence: `Your first decision was ${first}. Your final decision was ${final}.`,
      explanation:
        input.initialDecision && input.initialDecision !== input.finalDecision
          ? "The additional case files influenced how you approached the post."
          : "More information did not change the recorded conclusion, but it may have changed the reasons behind it.",
      sources: [
        `First judgement: ${first}`,
        `Final judgement: ${final}`,
      ],
    },
  ];

  if (influencedArchives.length >= 2) {
    cards.push({
      id: "multiple-perspectives",
      title: "You considered multiple perspectives",
      evidence: `You selected ${influencedArchives
        .map(archiveLabel)
        .join(", ")} as influential clues.`,
      explanation:
        "Your final judgement drew on more than one type of evidence in this case.",
      sources: influencedArchives.map(
        (file) =>
          `${archiveLabel(file)}: ${
            perspectives.find((item) => item.id === file)?.summary[0] ??
            "Archive summary unavailable."
          }`,
      ),
    });
  } else if (reasonLabels(input.selectedInfluentialClues).length > 0) {
    cards.push({
      id: "stated-reasons",
      title: "You named what shaped your final judgement",
      evidence: `You selected: ${reasonLabels(
        input.selectedInfluentialClues,
      ).join(", ")}.`,
      explanation:
        "This records the reasons you selected, not proof of why your behaviour changed.",
      sources: reasonLabels(input.selectedInfluentialClues),
    });
  }

  if (input.viewedArchives.length >= 5) {
    cards.push({
      id: "full-file-set",
      title: "You completed the full case file set",
      evidence:
        "All five case files were saved before the final judgement.",
      explanation:
        "This suggests the final judgement was made after the complete prototype investigation path in this session.",
      sources: input.viewedArchives.map(archiveLabel),
    });
  }

  const recommendedRule = recommendRule(input);

  const practiceSummary = input.practiceSkipped
    ? "You can still finish the case. No practice evidence was collected."
    : input.practiceAction
      ? actionMatchesRule(input.adoptedRule, input.practiceAction)
        ? "You practised the investigation rule you selected."
        : `You chose ${practiceActions[input.practiceAction]} during practice.`
      : "No practice action has been recorded in this session.";

  const transferSummary = input.transferAction
    ? actionMatchesRule(input.adoptedRule, input.transferAction)
      ? `In the final case, you used ${transferActions[input.transferAction]} without a prompt.`
      : `In the final case, you chose ${transferActions[input.transferAction]}.`
    : "No final independent case action has been recorded.";

  let finalReflection =
    "No transfer conclusion can be made from this session.";
  if (input.practiceSkipped) {
    finalReflection =
      "You skipped the practice case. No transfer conclusion can be made from this session.";
  } else if (input.practiceAction && input.transferAction) {
    if (
      actionMatchesRule(input.adoptedRule, input.practiceAction) &&
      actionMatchesRule(input.adoptedRule, input.transferAction)
    ) {
      finalReflection =
        "You did not have to change your opinion. In this session, you changed how you reached it.";
    } else if (actionMatchesRule(input.adoptedRule, input.practiceAction)) {
      finalReflection =
        "You used the investigation rule during practice, but did not use it in the final case. One guided attempt may not yet be enough for the action to transfer independently.";
    } else {
      finalReflection =
        "This session suggests the selected rule was not clearly practised before the independent case.";
    }
  }

  return {
    reconstruction: {
      first,
      final,
      message,
      influencedArchives,
    },
    evidenceCards: cards.slice(0, 3),
    recommendedRule,
    practiceSummary,
    transferSummary,
    finalReflection,
  };
}

import type {
  ClassificationItem,
  ClassificationSlot,
  ConfidenceChoice,
  DecisionChoice,
  FileId,
} from "@/src/types/game";

export const STORAGE_KEY = "archive-1644-progress-v1";

export const decisionOptions: Array<{
  id: DecisionChoice;
  initialLabel: string;
  finalLabel: string;
}> = [
  { id: "remove", initialLabel: "Remove the character", finalLabel: "Remove the character" },
  { id: "keep", initialLabel: "Keep as it is", finalLabel: "Keep as it is" },
  { id: "revise", initialLabel: "Keep, but revise", finalLabel: "Keep, but revise" },
  { id: "investigate", initialLabel: "Need more clues", finalLabel: "Need more clues" },
];

export const initialReasonOptions = [
  { id: "popular-post", label: "The popular post" },
  { id: "history-promise", label: "The history promise" },
  { id: "player-feelings", label: "How players may feel" },
  { id: "need-clues", label: "I need more clues" },
];

export const perspectives: Array<{
  id: FileId;
  file: string;
  role: string;
  keyword: string;
  code: string;
  view: string;
  summary: string[];
}> = [
  {
    id: "veteran",
    file: "FILE 01",
    role: "Veteran Player",
    keyword: "Promises",
    code: "VP-01",
    view: "The game should keep the history promise it made.",
    summary: [
      "The game promised a close look at real history.",
      "The new costume and skills feel out of place.",
      "His concern may be unclear labels, not the character’s gender.",
    ],
  },
  {
    id: "historian",
    file: "FILE 02",
    role: "Historian",
    keyword: "Clues",
    code: "HX-02",
    view: "Some clues are facts. Others leave room for ideas.",
    summary: [
      "Some facts are backed by strong records.",
      "Some lives left only small or broken records.",
      "A possible idea is not the same as a known fact.",
    ],
  },
  {
    id: "new-player",
    file: "FILE 03",
    role: "New Player",
    keyword: "Belonging",
    code: "NP-03",
    view: "She wants to feel included and know what is made up.",
    summary: [
      "Lin Yue made her curious about this time.",
      "New faces can help more players enter the story.",
      "She still wants clear labels for made-up parts.",
    ],
  },
  {
    id: "designer",
    file: "FILE 04",
    role: "Game Designer",
    keyword: "Trade-offs",
    code: "GD-04",
    view: "History, different players, and fun all need space.",
    summary: [
      "A game has limited time, money, and design space.",
      "History, different players, and fun can pull apart.",
      "Clear labels can make a hard choice easier to understand.",
    ],
  },
  {
    id: "moderator",
    file: "FILE 05",
    role: "Community Moderator",
    keyword: "Boundaries",
    code: "CM-05",
    view: "People can disagree without attacking each other.",
    summary: [
      "A strong comment is not always a personal attack.",
      "Sweeping claims make the other side sound more extreme.",
      "Threats and group attacks can cause real harm.",
    ],
  },
];

export const veteranSlots: ClassificationSlot[] = [
  { id: "fair", label: "Fair Comment", note: "Talks about the game or claim." },
  { id: "feeling", label: "Strong Feeling", note: "Shares a feeling or experience." },
  { id: "attack", label: "Attack on People", note: "Targets people, not the issue." },
];

export const veteranItems: ClassificationItem[] = [
  {
    id: "v1",
    text: "“This skill does not match the game’s older style.”",
  },
  {
    id: "v2",
    text: "“I feel like the team no longer cares about us.”",
  },
  {
    id: "v3",
    text: "“Supporters of this character know nothing about history.”",
  },
];

export const historianSlots: ClassificationSlot[] = [
  { id: "known", label: "Known Fact", note: "Backed by a clear record." },
  { id: "possible", label: "Possible Idea", note: "Could fit, but records are incomplete." },
  { id: "made-up", label: "Made for the Game", note: "Created for play or drama." },
];

export const historianItems: ClassificationItem[] = [
  { id: "h1", text: "Artillery units existed at this time." },
  { id: "h2", text: "The battle is based on a recorded siege." },
  { id: "h3", text: "Women may have helped with defence and supplies." },
  { id: "h4", text: "One character could join several broken records." },
  { id: "h5", text: "One hero can trigger a magic area blast." },
  { id: "h6", text: "Lin Yue led the real siege exactly this way." },
];

export const historianConfidenceOptions: Array<{
  id: ConfidenceChoice;
  label: string;
}> = [
  { id: "not-sure", label: "Not Sure" },
  { id: "a-little-sure", label: "A Little Sure" },
  { id: "quite-sure", label: "Quite Sure" },
  { id: "very-sure", label: "Very Sure" },
];

export const newPlayerStatement =
  "I rarely saw people like me in history games. Lin Yue made me curious about this time. I want clear labels for every made-up part.";

export const newPlayerOptions = [
  { id: "A", text: "History does not matter to her." },
  { id: "B", text: "She wants more players to feel included." },
  { id: "C", text: "She wants made-up parts clearly marked." },
  { id: "D", text: "She cares about inclusion and clear facts." },
];

export const perspectiveReasonOptions = [
  { id: "exact-words", label: "Her exact words" },
  { id: "first-impression", label: "My first impression" },
  { id: "group-view", label: "What my group would say" },
  { id: "not-sure", label: "I am not sure" },
];

export const designerGoals = [
  {
    id: "history",
    label: "History",
    note: "Keep the game close to its promise about real history.",
  },
  {
    id: "players",
    label: "Different Players",
    note: "Help more players find a way into the world.",
  },
  {
    id: "fun",
    label: "Fun",
    note: "Make battles clear, exciting, and good to play.",
  },
] as const;

export const designerReasons = [
  { id: "history-promise", label: "The game promised real history." },
  { id: "include-players", label: "More players should feel included." },
  { id: "game-fun", label: "A game must be fun." },
  { id: "clear-labels", label: "Made-up parts need clear labels." },
  { id: "group-majority", label: "Most of my group chose this." },
  { id: "unsure", label: "I am still unsure." },
];

export const moderatorSlots: ClassificationSlot[] = [
  { id: "helpful", label: "Helpful Comment", note: "Names a clear issue." },
  { id: "taste", label: "Different Taste", note: "Shares a personal choice." },
  { id: "sweeping", label: "Sweeping Claim", note: "Makes a claim about a whole group." },
  { id: "attack", label: "Attack on People", note: "Targets or pushes out people." },
];

export const moderatorItems: ClassificationItem[] = [
  { id: "m1", text: "“This skill does not fit the game’s older style.”" },
  { id: "m2", text: "“I prefer a stricter history mode.”" },
  { id: "m3", text: "“Every supporter wants to destroy history.”" },
  { id: "m4", text: "“Every critic of this update hates women.”" },
  { id: "m5", text: "“People like you should leave this community.”" },
];

export const finalReasonOptions = [
  { id: "history", label: "History clues" },
  { id: "players", label: "Different players" },
  { id: "fun", label: "Fun and play" },
  { id: "community", label: "Group reactions" },
  { id: "group-majority", label: "Group majority" },
  { id: "combined", label: "Several clues" },
  { id: "unsure", label: "I am still unsure" },
];

export const connectionNotes: Record<
  FileId,
  Array<{ with: string; type: "shared clue" | "tension"; text: string }>
> = {
  veteran: [
    { with: "New Player", type: "shared clue", text: "Both want clearer labels." },
    { with: "Designer", type: "tension", text: "Big skills can break the history style." },
  ],
  historian: [
    { with: "Veteran Player", type: "shared clue", text: "Both care about clear claims." },
    { with: "New Player", type: "tension", text: "Broken records leave room for ideas." },
  ],
  "new-player": [
    { with: "Veteran Player", type: "shared clue", text: "Both want clearer labels." },
    { with: "Historian", type: "tension", text: "Belonging and proof answer different needs." },
  ],
  designer: [
    { with: "Historian", type: "shared clue", text: "Labels can separate facts from game ideas." },
    { with: "Moderator", type: "tension", text: "Design choices can heat up group fights." },
  ],
  moderator: [
    { with: "Every file", type: "shared clue", text: "Clear comments help every side." },
    { with: "Veteran Player", type: "tension", text: "Strong feelings can turn into group attacks." },
  ],
};

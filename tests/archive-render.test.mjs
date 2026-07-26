import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server renders the Archive 1644 application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ARCHIVE 1644/);
  assert.match(html, /OPENING CASE FILE/);
  assert.doesNotMatch(
    html,
    /codex-preview|react-loading-skeleton|Starter Project/,
  );
});

test("the playable source includes five files and three result paths", async () => {
  const [data, copy, app] = await Promise.all([
    readFile(new URL("../src/data/caseData.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/data/gameCopy.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../src/components/ArchiveGame.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  for (const role of [
    "Veteran Player",
    "Historian",
    "New Player",
    "Game Designer",
    "Community Moderator",
  ]) {
    assert.match(data, new RegExp(role));
  }

  assert.match(app, /rewardUnlocked: true/);
  assert.match(copy, /MILD PATTERN/);
  assert.match(copy, /SOME WARNING SIGNS/);
  assert.match(copy, /STRONG WARNING SIGNS/);
  assert.match(copy, /No real police officer is viewing your account/);
});

test("investigation tasks save choices without answer gates", async () => {
  const [classification, files, scoring] = await Promise.all([
    readFile(
      new URL("../src/components/DndClassification.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/FileInvestigations.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../src/utils/scoring.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(classification, /accepted\.includes/);
  assert.match(files, /perspectiveAnswer && props\.state\.perspectiveReason/);
  assert.match(scoring, /strongSignals >= 3/);
  assert.doesNotMatch(scoring, /initialChoice === "remove"/);
  assert.doesNotMatch(scoring, /finalChoice === "keep"/);
});

test("selection labels stay distinct from saved-file confirmation", async () => {
  const [app, decision, classification, files, copy] = await Promise.all([
    readFile(
      new URL("../src/components/ArchiveGame.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/DecisionPanel.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/DndClassification.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/FileInvestigations.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../src/data/gameCopy.ts", import.meta.url), "utf8"),
  ]);

  assert.match(app, /showRewardProgress/);
  assert.match(app, /"initial-decision"/);
  assert.match(decision, /currentChoice/);
  assert.doesNotMatch(decision, />\s*VIEW SAVED\s*</);
  assert.match(classification, /ALL FILED/);
  assert.doesNotMatch(classification, />\s*VIEW SAVED\s*</);
  assert.match(files, /gameCopy\.files\.complete/);
  assert.doesNotMatch(files, />\s*VIEW SAVED\s*</);
  assert.match(copy, /TEAM REWARD PROGRESS/);
  assert.match(copy, /CLUE FILED\. YOU CAN MOVE IT BEFORE SAVING THE FILE/);
});

export const glossary = {
  hub: "Records an algorithm from shop tests through to a released version.",
  algorithm:
    "A component of the rig, stored in one git repository. It has a contract, a procedure, released versions, and investigations.",
  currentRelease: "The version prod is pinned to.",
  repository: "The git repository that holds this algorithm's source. The hub stores the name; the code stays in git.",
  contract: "The inputs the algorithm accepts and the outputs it must return, with an allowed range on each output.",
  version: "An immutable release of an algorithm. The next release is a new version, not a change to the previous one.",
  investigation: "One researcher's question about an algorithm. It has one candidate and produces at most one version.",
  candidate:
    "The commit under test. It is built into an artifact, pinned in dev, and given a version number only at release.",
  procedure:
    "The blank form a technician fills in for a shop visit. The technician did not write the algorithm. A form change is a new revision.",
  run: "One shop visit: a filled procedure revision, including the version or candidate that was on the rig.",
  tested: "The version or candidate loaded on the rig for this visit.",
  artifact: "The built package the app executes, produced from a git commit.",
  dev: "The shop environment. It runs the current release or the one candidate under test.",
  prod: "The customer environment. It runs a released version only.",
  pin: "The artifact an environment is set to execute.",
  release: "Publishes the candidate as the next version, using the artifact the shop already ran, and points prod at that version.",
  checks: "Five gates. A candidate becomes a version only when all five pass.",
  open: "The investigation is named and has no candidate yet.",
  testing: "A candidate is pinned in dev, and shop runs can record it.",
  released: "The candidate was published as a version. The investigation is finished.",
  closed: "The investigation ended without a release. Its runs are kept.",
  correctionError: "The difference, in degrees, between the commanded correction angle and the measured wheel angle.",
  predict: "Executes the artifact pinned in the selected environment and returns the contract outputs.",
  result: "The contract outputs and correction error written when the run was completed.",
  setup: "Shop, vehicle, tire, and sensors recorded at the start of the visit.",
  measurements: "The contract inputs recorded during the visit.",
  folder:
    "The directory for this question. Notes and analysis are copied here. Code stays in the git repository, and each shop visit gets a subfolder.",
  files: "Files saved in the folder this run created.",
} as const;

export const termCopy = {
  "current release": glossary.currentRelease,
  repository: glossary.repository,
  contract: glossary.contract,
  version: glossary.version,
  candidate: glossary.candidate,
  tested: glossary.tested,
  artifact: glossary.artifact,
  dev: glossary.dev,
  prod: glossary.prod,
  pin: glossary.pin,
  procedure: glossary.procedure,
  open: glossary.open,
  testing: glossary.testing,
  released: glossary.released,
  closed: glossary.closed,
} as const;

export type TermId = keyof typeof termCopy;

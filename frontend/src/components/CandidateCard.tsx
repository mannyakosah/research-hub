import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";
import { Term } from "./Term";

export function CandidateCard({
  commit,
  artifact,
  status,
  published,
}: {
  commit: string;
  artifact: string;
  status: string;
  published?: string;
}) {
  if (!commit) {
    return (
      <SectionBlock tone="investigation" kind="Candidate" title="None" sentence={glossary.candidate}>
        <p>No commit is pinned yet.</p>
      </SectionBlock>
    );
  }
  if (status === "Released") {
    return (
      <SectionBlock tone="version" kind="Version" title={published || "Released"} sentence={glossary.version}>
        <p>
          Commit <code>{commit}</code> was published as <code>{artifact}</code>.
        </p>
      </SectionBlock>
    );
  }
  return (
    <SectionBlock tone="investigation" kind="Candidate" title={commit} sentence={glossary.candidate}>
      <p>
        <Term id="artifact">Artifact</Term> <code>{artifact}</code>
      </p>
    </SectionBlock>
  );
}

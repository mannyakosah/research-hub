import { fileUrl } from "../api/client";
import type { RunFile } from "../api/types";
import { glossary } from "../lib/glossary";
import { SectionBlock } from "./SectionBlock";

export function FileList({
  files,
  algorithmId,
  investigationId,
  runNumber,
}: {
  files: RunFile[];
  algorithmId: string;
  investigationId: string;
  runNumber: number;
}) {
  return (
    <SectionBlock tone="run" title="Files" sentence={glossary.files}>
      <ul className="file-list">
        {files.map((file) => (
          <li key={file.path}>
            <a href={fileUrl(algorithmId, investigationId, runNumber, file.path)}>{file.name}</a>
            <span className="kind">{file.kind}</span>
          </li>
        ))}
      </ul>
    </SectionBlock>
  );
}

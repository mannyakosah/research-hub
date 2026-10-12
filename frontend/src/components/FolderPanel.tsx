import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fileUrl, folderFileUrl } from "../api/client";
import type { RunFile } from "../api/types";
import { useFolder } from "../hooks/useFolder";
import { glossary } from "../lib/glossary";

type AddedSource = {
  id: string;
  kind: "file" | "link";
  name: string;
  origin: string;
  url: string;
};

function fileCount(files: RunFile[]): string {
  return files.length === 1 ? "1 file" : `${files.length} files`;
}

export function FolderPanel({
  algorithmId,
  investigationId,
  folder,
  repository,
  commit,
}: {
  algorithmId: string;
  investigationId: string;
  folder: string;
  repository: string;
  commit: string;
}) {
  const listing = useFolder(algorithmId, investigationId);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [added, setAdded] = useState<AddedSource[]>([]);
  const [openRuns, setOpenRuns] = useState<Record<number, boolean>>({});
  const [kind, setKind] = useState<"file" | "link">("link");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [url, setUrl] = useState("");

  function resetForm() {
    setKind("link");
    setName("");
    setOrigin("");
    setUrl("");
  }

  function addSource() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (kind === "link" && !url.trim()) return;
    setAdded((current) => [
      ...current,
      { id: `${Date.now()}`, kind, name: trimmed, origin: origin.trim(), url: url.trim() },
    ]);
    dialogRef.current?.close();
    resetForm();
  }

  const fileTotal = (listing.data?.files.length ?? 0) + added.length + (commit ? 1 : 0);
  const runTotal = listing.data?.runs.length ?? 0;
  const summary = `${fileTotal} ${fileTotal === 1 ? "item" : "items"} · ${runTotal} ${runTotal === 1 ? "run" : "runs"}`;

  return (
    <section className="section section-investigation folder-section">
      <details>
        <summary>
          <span className="folder-heading">
            <span className="kind-line">
              <span className="eyebrow">Folder</span>
              <span className="definition">{glossary.folder}</span>
            </span>
            <span className="folder-summary">
              <code>{folder}</code>
              <span className="origin">{summary}</span>
            </span>
          </span>
        </summary>
        <div className="section-body">
          <button type="button" onClick={() => dialogRef.current?.showModal()}>
            Add source
          </button>
          <p className="muted">A file or a link is listed here. This demo keeps it on screen for the session.</p>
          <dialog ref={dialogRef} className="confirm-dialog">
            <p className="eyebrow">Source</p>
            <h2>Add a source to this folder?</h2>
            <p>Record a file or a link that belongs to this investigation. Nothing is written to the folder.</p>
            <form
              className="source-form"
              onSubmit={(event) => {
                event.preventDefault();
                addSource();
              }}
            >
              <label>
                Kind
                <select value={kind} onChange={(event) => setKind(event.target.value as "file" | "link")}>
                  <option value="link">Link</option>
                  <option value="file">File</option>
                </select>
              </label>
              {kind === "file" ? (
                <label>
                  File
                  <input
                    type="file"
                    onChange={(event) => {
                      const picked = event.target.files?.[0];
                      if (picked) setName(picked.name);
                    }}
                  />
                </label>
              ) : (
                <label>
                  URL
                  <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" />
                </label>
              )}
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label>
                Where it was
                <input
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="A document, a MATLAB file, a shared drive"
                />
              </label>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    dialogRef.current?.close();
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit">Add</button>
              </div>
            </form>
          </dialog>
          {listing.loading && <p className="loading">Loading…</p>}
          {listing.error && <p className="error">Request failed ({listing.error})</p>}
          {listing.data && (
            <ul className="folder-tree">
              {commit && (
                <li className="folder-row">
                  <span className="kind">repository</span>
                  <span>
                    <code>{repository}</code> @ <code>{commit}</code>
                  </span>
                  <span className="origin">Stays in the git repository. The folder records the commit.</span>
                </li>
              )}
              {listing.data.files.map((file) => (
                <li className="folder-row" key={file.path}>
                  <span className="kind">{file.kind}</span>
                  <a href={folderFileUrl(algorithmId, investigationId, file.path)}>{file.name}</a>
                  <span className="origin">{file.origin}</span>
                </li>
              ))}
              {added.map((source) => (
                <li className="folder-row" key={source.id}>
                  <span className="kind">{source.kind}</span>
                  {source.kind === "link" && source.url ? (
                    <a href={source.url}>{source.name}</a>
                  ) : (
                    <span>{source.name}</span>
                  )}
                  <span className="origin">{source.origin ? `${source.origin} · Not saved` : "Not saved"}</span>
                </li>
              ))}
              {listing.data.runs.map((run) => {
                const open = Boolean(openRuns[run.number]);
                return (
                  <li className="folder-run" key={run.number}>
                    <div className="folder-row">
                      <button
                        type="button"
                        className="folder-toggle"
                        aria-expanded={open}
                        onClick={() => setOpenRuns((current) => ({ ...current, [run.number]: !open }))}
                      >
                        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
                        runs/{String(run.number).padStart(3, "0")}/
                      </button>
                      <Link to={`/algorithms/${algorithmId}/investigations/${investigationId}/runs/${run.number}`}>
                        Open run
                      </Link>
                      <span className="origin">{fileCount(run.files)}</span>
                    </div>
                    {open && (
                      <ul>
                        {run.files.map((file) => (
                          <li className="folder-row nested" key={file.path}>
                            <span className="kind">{file.kind}</span>
                            <a href={fileUrl(algorithmId, investigationId, run.number, file.path)}>{file.path}</a>
                            <span />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}

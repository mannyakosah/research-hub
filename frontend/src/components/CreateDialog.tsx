import { useEffect, useState } from "react";
import { createAlgorithm, createInvestigation } from "../api/client";

export type CreateRequest =
  | { kind: "algorithm" }
  | { kind: "investigation"; algorithmId: string; algorithmName: string };

export function CreateDialog({
  request,
  onClose,
  onCreated,
}: {
  request: CreateRequest | null;
  onClose: () => void;
  onCreated: (path: string) => void;
}) {
  const [name, setName] = useState("");
  const [repository, setRepository] = useState("");
  const [repositoryEdited, setRepositoryEdited] = useState(false);
  const [owner, setOwner] = useState("Researcher A");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setName("");
    setRepository("");
    setRepositoryEdited(false);
    setOwner("Researcher A");
    setError(null);
    setPending(false);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, onClose]);

  if (!request) return null;

  const investigation = request.kind === "investigation";
  const repositoryValue = repositoryEdited ? repository : slug(name);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || !request) return;
    setPending(true);
    setError(null);
    try {
      if (request.kind === "algorithm") {
        const repo = (repositoryEdited ? repository : slug(name)).trim();
        if (!repo) return;
        const created = await createAlgorithm(trimmed, repo);
        onCreated(`/algorithms/${created.id}`);
      } else {
        const created = await createInvestigation(request.algorithmId, trimmed, owner.trim() || "Researcher A");
        onCreated(`/algorithms/${request.algorithmId}/investigations/${created.id}`);
      }
    } catch {
      setError("Could not create that record.");
      setPending(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">{investigation ? "Investigation" : "Algorithm"}</p>
        <h2 id="create-title">{investigation ? "New investigation" : "New algorithm"}</h2>
        <p>
          {investigation
            ? `A question on ${request.algorithmName}. It starts open, with no candidate.`
            : "One part of the rig, with its own repository. It starts with no investigations."}
        </p>
        <form
          className="source-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          </label>
          {investigation ? (
            <label>
              Owner
              <input value={owner} onChange={(event) => setOwner(event.target.value)} />
            </label>
          ) : (
            <label>
              Repository
              <input
                value={repositoryValue}
                onChange={(event) => {
                  setRepositoryEdited(true);
                  setRepository(event.target.value);
                }}
              />
            </label>
          )}
          <p className="muted">Saved for this server session.</p>
          {error && <p className="error">{error}</p>}
          <div className="confirm-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={pending || !name.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

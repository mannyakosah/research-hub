import { useState } from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CreateDialog, type CreateRequest } from "./components/CreateDialog";
import { PinBar } from "./components/PinBar";
import { useAlgorithm } from "./hooks/useAlgorithm";
import { useCatalog } from "./hooks/useCatalog";
import { glossary } from "./lib/glossary";
import { AlgorithmPage } from "./pages/AlgorithmPage";
import { InvestigationPage } from "./pages/InvestigationPage";
import { RunPage } from "./pages/RunPage";

export type HubContextValue = {
  algorithm: ReturnType<typeof useAlgorithm>;
  openNewInvestigation: (algorithmId: string, algorithmName: string) => void;
};

function AppShell() {
  const { pathname } = useLocation();
  const algorithmId = pathname.match(/^\/algorithms\/([^/]+)/)?.[1] ?? "wheel-balance";
  const algorithm = useAlgorithm(algorithmId);
  const catalog = useCatalog();
  const navigate = useNavigate();
  const [createRequest, setCreateRequest] = useState<CreateRequest | null>(null);
  const pins = algorithm.data?.pins;

  function openNewInvestigation(id: string, name: string) {
    setCreateRequest({ kind: "investigation", algorithmId: id, algorithmName: name });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand">Research Hub</p>
          <p className="brand-sentence">{glossary.hub}</p>
        </div>
        <nav className="rail" aria-label="Pages">
          <button type="button" className="new-algorithm" onClick={() => setCreateRequest({ kind: "algorithm" })}>
            + New algorithm
          </button>
          <p className="rail-label">Algorithms</p>
          {catalog.loading && <p className="rail-note">Loading…</p>}
          {catalog.error && <p className="error">Request failed ({catalog.error})</p>}
          {catalog.data?.map((item) => (
            <div className="rail-group" key={item.id}>
              <div className="rail-algorithm">
                <NavLink to={`/algorithms/${item.id}`} end>
                  <span>Algorithm</span>
                  {item.name}
                </NavLink>
                <button
                  type="button"
                  className="rail-add"
                  aria-label={`New investigation in ${item.name}`}
                  onClick={() => openNewInvestigation(item.id, item.name)}
                >
                  +
                </button>
              </div>
              {item.investigations.map((investigation) => (
                <NavLink
                  className="rail-sub"
                  key={investigation.id}
                  to={`/algorithms/${item.id}/investigations/${investigation.id}`}
                >
                  <span>{investigation.status}</span>
                  {investigation.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-pins">
          {pins && <PinBar dev={pins.dev} prod={pins.prod} />}
          {algorithm.error && <p className="error">Request failed ({algorithm.error})</p>}
        </div>
      </aside>
      <main>
        <Outlet context={{ algorithm, openNewInvestigation } satisfies HubContextValue} />
      </main>
      <CreateDialog
        request={createRequest}
        onClose={() => setCreateRequest(null)}
        onCreated={(path) => {
          setCreateRequest(null);
          void catalog.reload();
          algorithm.reload();
          navigate(path);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/algorithms/wheel-balance" replace />} />
        <Route path="/algorithms/:algorithmId" element={<AlgorithmPage />} />
        <Route path="/algorithms/:algorithmId/investigations/:investigationId" element={<InvestigationPage />} />
        <Route
          path="/algorithms/:algorithmId/investigations/:investigationId/runs/:number"
          element={<RunPage />}
        />
        <Route path="*" element={<Navigate to="/algorithms/wheel-balance" replace />} />
      </Route>
    </Routes>
  );
}

import type { CheckResult } from "../api/types";
import { checkLabel } from "../lib/format";

export function CheckList({ checks }: { checks: CheckResult[] }) {
  return (
    <ul className="check-list">
      {checks.map((check) => (
        <li key={check.name} className={check.passed ? "pass" : "fail"}>
          <span>{check.passed ? "Pass" : "Fail"}</span>
          <strong>{checkLabel(check.name)}</strong>
          <span>{check.detail}</span>
        </li>
      ))}
    </ul>
  );
}

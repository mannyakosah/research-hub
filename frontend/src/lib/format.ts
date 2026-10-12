import type { Tested } from "../api/types";

export const SAMPLE: {
  radial_force: number;
  lateral_force: number;
  wheel_angle: number;
  wheel_speed: number;
} = {
  radial_force: 12.4,
  lateral_force: 3.1,
  wheel_angle: 27.2,
  wheel_speed: 8.3,
};

export const INPUTS = ["radial_force", "lateral_force", "wheel_angle", "wheel_speed"] as const;

export function testedLabel(tested: Tested): string {
  if (tested.kind === "candidate") return `candidate ${tested.commit ?? ""}`.trim();
  return tested.number ?? "version";
}

export function checkLabel(name: string): string {
  return name.replaceAll("_", " ");
}

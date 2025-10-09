import path from 'path';
import { describe, it, expect } from "vitest";
import { loadYaml, parseWorkflow, renderText, renderMermaid } from '../index.js';


describe("Github Actions Workflow Parser", () => {
  test("lädt YAML und parst Jobs/Needs/Steps korrekt", () => {
  const doc = loadYaml(path.join(__dirname, "..", ".github", "workflows", "ci.yml"));
  const model = parseWorkflow(doc);
  const jobNames = model.items.map(j => j.name);
  expect(jobNames).toEqual(["build","test","lint","diagram"]);
  const testJob = model.items.find(j => j.name === "test");
  expect(testJob.needs).toEqual(["build"]);
  expect(testJob.stepSummaries.some(s => /run\s+npm test/.test(s))).toBe(true);
  });
});

describe("Snapshot der Textausgabe", () => {
  const doc = loadYaml(path.join(__dirname, "..",  ".github", "workflows", "ci.yml"));
  const model = parseWorkflow(doc);
  const text = renderText(model);
  expect(text).toMatchSnapshot();
});

describe("Mermaid enthält Kanten", () => {
  const doc = loadYaml(path.join(__dirname, "..",  ".github", "workflows", "ci.yml"));
  const model = parseWorkflow(doc);
  const mmd = renderMermaid(model);
  expect(mmd).toMatch(/build\s*-->\s*test/);
});

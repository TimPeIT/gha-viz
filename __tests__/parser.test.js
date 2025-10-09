import { fileURLToPath } from 'url';
import path from 'path';
import { describe, it, expect } from "vitest";
import { loadYaml, parseWorkflow, renderText, renderMermaid } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const yamlPath = path.join(__dirname, "..", "samples", "ci.yml");

describe("Github Actions Workflow Parser", () => {
  it("lädt YAML und parst Jobs/Needs/Steps korrekt", () => {
  const doc = loadYaml(yamlPath);
  const model = parseWorkflow(doc);
  const jobNames = model.items.map(j => j.name);
  expect(jobNames).toEqual(["build","test","lint"]);
  const testJob = model.items.find(j => j.name === "test");
  expect(testJob.needs).toEqual(["build"]);
  expect(testJob.stepSummaries.some(s => /run\s+npm test/.test(s))).toBe(true);
  });
});

describe("Snapshot der Textausgabe", () => {
  it("erstellt Snapshot", () => {
  const doc = loadYaml(yamlPath);
  const model = parseWorkflow(doc);
  const text = renderText(model);
  expect(text).toMatchSnapshot();
  });
});

describe("Mermaid enthält Kanten", () => {
  it("zeigt Build -> test", () => {
  const doc = loadYaml(yamlPath);
  const model = parseWorkflow(doc);
  const mmd = renderMermaid(model);
  expect(mmd).toMatch(/build\s*-->\s*test/);
  });
});

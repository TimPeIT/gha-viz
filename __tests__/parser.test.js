const path = require("path");
const { loadYaml, parseWorkflow, renderText, renderMermaid } = require("../index");

test("lädt YAML und parst Jobs/Needs/Steps korrekt", () => {
  const doc = loadYaml(path.join(__dirname, "..", "samples", "ci.yml"));
  const model = parseWorkflow(doc);
  const jobNames = model.items.map(j => j.name);
  expect(jobNames).toEqual(["build","test","lint"]);
  const testJob = model.items.find(j => j.name === "test");
  expect(testJob.needs).toEqual(["build"]);
  expect(testJob.stepSummaries[0]).toMatch(/run\s+npm test/);
});

test("Snapshot der Textausgabe", () => {
  const doc = loadYaml(path.join(__dirname, "..", "samples", "ci.yml"));
  const model = parseWorkflow(doc);
  const text = renderText(model);
  expect(text).toMatchSnapshot();
});

test("Mermaid enthält Kanten", () => {
  const doc = loadYaml(path.join(__dirname, "..", "samples", "ci.yml"));
  const model = parseWorkflow(doc);
  const mmd = renderMermaid(model);
  expect(mmd).toMatch(/build\s*-->\s*test/);
});

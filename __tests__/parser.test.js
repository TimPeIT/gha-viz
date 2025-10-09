import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { describe, it, expect } from "vitest";
import { loadYaml, parseWorkflow, renderText, renderMermaid, renderHTML, main } from '../index.js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, '..', 'index.js');

const yamlPath = path.join(__dirname, "..", "samples", "ci.yml");

describe("Github Actions Workflow Parser", () => {
    it("lädt YAML und parst Jobs/Needs/Steps korrekt", () => {
        const doc = loadYaml(yamlPath);
        const model = parseWorkflow(doc);
        const jobNames = model.items.map(j => j.name);
        expect(jobNames).toEqual(["build", "test", "lint"]);
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

describe("Warnung bei unbekannten Keys", () => {
    it("zeigt Hinweistext bei unbekannten Top-Level-Keys", () => {
        const fakeDoc = {
            on: "push",
            jobs: {
                dummy: { steps: [] }
            },
            custom: "foo"
        };
        const model = parseWorkflow(fakeDoc);
        const text = renderText(model);
        expect(text).toMatch(/Unbekannte Top-Level-Keys: custom/);
    });
});

describe("Mermaid-Fallback bei fehlenden Abhängigkeiten", () => {
    it("zeigt Platzhalter wenn keine Edges vorhanden sind", () => {
        const model = {
            items: [
                { name: "one", needs: [], stepSummaries: [] },
                { name: "two", needs: [], stepSummaries: [] }
            ],
            triggers: [],
            unknownKeys: []
        };
        const mermaid = renderMermaid(model);
        expect(mermaid).toMatch(/A\[No Dependencies\]/);
    });
});

describe('CLI Tests', () => {
    it('gibt Text aus mit "text"-Befehl', () => {
        const out = execSync(`node ${indexPath} text ${yamlPath}`, { encoding: 'utf-8' });
        expect(out).toMatch(/== Jobs ==/);
    });

    it('schreibt Diagramm HTML-Datei', () => {
        const outputPath = path.join(__dirname, '..', 'output', 'diagram.html');
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        execSync(`node ${indexPath} diagram ${yamlPath}`);
        expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('zeigt Hilfe bei fehlenden Argumenten', () => {
        try {
            execSync(`node ${indexPath}`, { encoding: 'utf-8', stdio: 'pipe' });
        } catch (err) {
            expect(err.stdout).toMatch(/Nutzung:/);
            return;
        }
        throw new Error('CLI hat keinen Fehler geworfen, obwohl Argumente fehlen');
    });
});

describe("renderHTML", () => {
  it("erstellt HTML-Output passend zum Snapshot", () => {
    const model = {
      triggers: ["push", "pull_request"],
      unknownKeys: [],
      items: [
        {
          name: "build",
          needs: [],
          stepSummaries: ["#1 run npm ci"]
        },
        {
          name: "test",
          needs: ["build"],
          stepSummaries: ["#1 run npm test"]
        }
      ]
    };

    const html = renderHTML(model);
    expect(html).toMatchSnapshot();
  });
});
#!/usr/bin/env node

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import http from "node:http";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.AUTOREFLEX_PORT || 8090);
const HOST = process.env.AUTOREFLEX_HOST || "127.0.0.1";
const AUTOREFLEX_URL = `http://${HOST}:${PORT}`;
const OLLAMA_URL = process.env.AUTOREFLEX_OLLAMA_URL || "http://127.0.0.1:11434";
const EMBED_MODEL = process.env.AUTOREFLEX_EMBED_MODEL || "nomic-embed-text";
const AUTO_START_OLLAMA = /^(1|true|yes)$/i.test(String(process.env.AUTOREFLEX_START_OLLAMA || ""));
const STORAGE_DIR = path.join(ROOT, ".autoreflex");
const NOTES_DIR = path.join(STORAGE_DIR, "notes");
const INDEX_FILE = path.join(STORAGE_DIR, "index.json");
const MAX_CHUNK_CHARS = Number(process.env.AUTOREFLEX_CHUNK_CHARS || 2400);
const CHUNK_OVERLAP = Number(process.env.AUTOREFLEX_CHUNK_OVERLAP || 240);
const SOURCE_ROOTS = ["skills", "docs"];
const SOURCE_FILES = [
  "agents.md",
  "agente.md",
  "CLAUDE.md",
  "HANDOFF.md",
  "README.md",
  "docs/reference/PERSISTENCE.md",
  "docs/reference/THEME_SYSTEM.md",
  "docs/reference/PROFILE_MENU_SETUP.md",
  "docs/archive/status/STATUS.md",
  "docs/operations/deployment/WORKFLOW_STAGES.md",
  "docs/operations/testing/README_TESTES.md",
  "docs/operations/deployment/DEPLOY.md",
  "docs/operations/deployment/DEPLOY_AUTOMATION.md",
  "docs/operations/testing/TESTING_GUIDE.md",
  "docs/operations/testing/TESTING_REPORT.md",
];
const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  ".autoreflex",
  "node_modules",
  "coverage",
  "dist",
  "build",
  "out",
  "test-results",
]);
const SOURCE_EXTENSIONS = new Set([".md", ".mdx"]);

const state = {
  ready: false,
  backend: "fallback",
  modelReady: false,
  documents: [],
  indexUpdatedAt: null,
  buildPromise: null,
  buildError: null,
};

const command = (process.argv[2] || "serve").toLowerCase();

main().catch((error) => {
  console.error("[autoreflex] fatal:", error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

async function main() {
  await ensureStorage();

  if (command === "index") {
    await bootstrap();
    console.log(
      JSON.stringify(
        {
          ok: true,
          backend: state.backend,
          modelReady: state.modelReady,
          documents: state.documents.length,
          indexUpdatedAt: state.indexUpdatedAt,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === "health") {
    const ok = await probeHttp(`${AUTOREFLEX_URL}/health`, 2000);
    process.exit(ok ? 0 : 1);
    return;
  }

  if (command === "note") {
    const title = process.argv[3];
    const body = process.argv.slice(4).join(" ").trim();
    if (!title || !body) {
      console.error("Uso: node scripts/autoreflex-local.mjs note \"titulo\" \"corpo\"");
      process.exit(1);
    }
    const notePath = await recordNote({
      title,
      body,
      source: "manual",
      tags: ["error", "lesson"],
    });
    console.log(notePath);
    return;
  }

  await bootstrap();
  await startServer();
}

async function ensureStorage() {
  await mkdir(STORAGE_DIR, { recursive: true });
  await mkdir(NOTES_DIR, { recursive: true });
}

async function bootstrap() {
  if (state.buildPromise) {
    return state.buildPromise;
  }

  state.buildPromise = (async () => {
    try {
      await ensureOllamaReady();
      const modelAvailable = await ensureEmbeddingModelReady();
      state.modelReady = modelAvailable;
      state.backend = modelAvailable ? "ollama" : "fallback";
    } catch (error) {
      state.backend = "fallback";
      state.modelReady = false;
      console.warn(`[autoreflex] Ollama indisponível, seguindo em fallback lexical: ${messageOf(error)}`);
    }

    try {
      const documents = await collectDocuments();
      state.documents = await buildIndex(documents, state.modelReady);
      state.indexUpdatedAt = new Date().toISOString();
      await writeState();
      state.ready = true;
      state.buildError = null;
      console.log(
        `[autoreflex] index pronto: ${state.documents.length} documentos, backend=${state.backend}, modelo=${state.modelReady ? EMBED_MODEL : "lexical"}`,
      );
    } catch (error) {
      state.buildError = messageOf(error);
      state.ready = true;
      console.warn(`[autoreflex] falha parcial ao indexar: ${state.buildError}`);
      if (!state.documents.length) {
        state.documents = [];
      }
    }

    if (!state.modelReady) {
      void warmEmbeddingModelInBackground();
    }

    return state;
  })();

  return state.buildPromise;
}

async function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", AUTOREFLEX_URL);
      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, {
          status: "ok",
          ready: state.ready,
          backend: state.backend,
          modelReady: state.modelReady,
          documents: state.documents.length,
          indexUpdatedAt: state.indexUpdatedAt,
        });
      }

      if (req.method === "POST" && url.pathname === "/agent/skills/search") {
        const body = await readJson(req);
        const query = String(body.query || "").trim();
        const limit = clampInt(body.limit, 5, 1, 25);
        const results = await searchDocuments(query, limit);
        return sendJson(res, 200, { results });
      }

      if (req.method === "POST" && url.pathname === "/agent/skills/get") {
        const body = await readJson(req);
        const skillPath = String(body.skill_path || "").trim();
        if (!skillPath) {
          return sendJson(res, 400, { error: "skill_path is required" });
        }
        const document = await getDocument(skillPath);
        if (!document) {
          return sendJson(res, 404, { error: "Documento não encontrado" });
        }
        return sendJson(res, 200, document);
      }

      if (req.method === "POST" && url.pathname === "/agent/skills/index") {
        const body = await readJson(req);
        const skillPath = String(body.skill_path || "").trim();
        let documents;

        if (skillPath) {
          const single = await collectDocuments([skillPath]);
          documents = single;
        } else {
          documents = await collectDocuments();
        }

        state.documents = await buildIndex(documents, state.modelReady);
        state.indexUpdatedAt = new Date().toISOString();
        await writeState();

        return sendJson(res, 200, {
          indexed_files: state.documents.map((doc) => doc.path),
          indexed_chunks: state.documents.reduce((sum, doc) => sum + doc.chunks.length, 0),
        });
      }

      if (req.method === "POST" && url.pathname === "/agent/knowledge/record") {
        const body = await readJson(req);
        const title = String(body.title || "").trim();
        const text = String(body.text || body.body || "").trim();
        const source = String(body.source || "manual").trim() || "manual";
        const tags = normalizeTags(body.tags);

        if (!title || !text) {
          return sendJson(res, 400, { error: "title and text are required" });
        }

        const notePath = await recordNote({ title, body: text, source, tags });
        const documents = await collectDocuments([path.relative(ROOT, notePath)]);
        const updated = await buildIndex(documents, state.modelReady);
        state.documents = mergeDocuments(state.documents, updated);
        state.indexUpdatedAt = new Date().toISOString();
        await writeState();

        return sendJson(res, 200, {
          ok: true,
          note_path: path.relative(ROOT, notePath).replace(/\\/g, "/"),
        });
      }

      sendJson(res, 404, { error: "not found" });
    } catch (error) {
      console.error("[autoreflex] request failed:", error);
      sendJson(res, 500, { error: messageOf(error) });
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`[autoreflex] escutando em ${AUTOREFLEX_URL}`);
  });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

async function probeHttp(url, timeoutMs = 2000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureOllamaReady() {
  const ok = await probeHttp(`${OLLAMA_URL}/api/tags`, 2000);
  if (ok) {
    return true;
  }

  if (!AUTO_START_OLLAMA) {
    throw new Error("Ollama não está respondendo e AUTOREFLEX_START_OLLAMA está desativado");
  }

  console.log("[autoreflex] iniciando Ollama local...");
  const child = spawn("ollama", ["serve"], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();

  for (let i = 0; i < 20; i += 1) {
    if (await probeHttp(`${OLLAMA_URL}/api/tags`, 2000)) {
      console.log("[autoreflex] Ollama pronto");
      return true;
    }
    await sleep(1000);
  }

  throw new Error("Ollama não respondeu em 20s");
}

async function ensureEmbeddingModelReady() {
  try {
    const tags = await fetchJson(`${OLLAMA_URL}/api/tags`);
    const models = Array.isArray(tags?.models) ? tags.models : [];
    const installed = models.some((model) => {
      const name = String(model?.name || model?.model || model?.model_name || "");
      return name === EMBED_MODEL || name.startsWith(`${EMBED_MODEL}:`);
    });

    if (installed) {
      return true;
    }
  } catch (error) {
    console.warn(`[autoreflex] não consegui ler modelos do Ollama: ${messageOf(error)}`);
    return false;
  }

  console.log(`[autoreflex] modelo de embeddings ausente, baixando ${EMBED_MODEL}...`);

  try {
    await pullEmbeddingModel();
    return true;
  } catch (error) {
    console.warn(`[autoreflex] pull do modelo falhou: ${messageOf(error)}`);
    return false;
  }
}

async function pullEmbeddingModel() {
  await new Promise((resolve, reject) => {
    const child = spawn("ollama", ["pull", EMBED_MODEL], {
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`ollama pull saiu com code ${code}`));
    });
  });
}

async function warmEmbeddingModelInBackground() {
  if (state.modelReady) {
    return;
  }

  try {
    const installed = await ensureEmbeddingModelReady();
    if (!installed) {
      return;
    }

    state.modelReady = true;
    state.backend = "ollama";
    const documents = await collectDocuments();
    state.documents = await buildIndex(documents, true);
    state.indexUpdatedAt = new Date().toISOString();
    await writeState();
    console.log("[autoreflex] embeddings ativados e índice recompilado");
  } catch (error) {
    console.warn(`[autoreflex] warmup de embeddings ignorado: ${messageOf(error)}`);
  }
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 5000);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function collectDocuments(explicitPaths = null) {
  const paths = explicitPaths ? explicitPaths.map(normalizeRepoPath).filter(Boolean) : await discoverSourceFiles();
  const documents = [];
  for (const repoPath of paths) {
    const absolutePath = path.join(ROOT, repoPath);
    try {
      const stats = await stat(absolutePath);
      if (!stats.isFile()) {
        continue;
      }

      const raw = await readFile(absolutePath, "utf8");
      const parsed = parseDocument(repoPath, raw, stats.mtimeMs);
      documents.push(parsed);
    } catch (error) {
      console.warn(`[autoreflex] ignorando ${repoPath}: ${messageOf(error)}`);
    }
  }
  return documents;
}

async function discoverSourceFiles() {
  const found = new Set();

  for (const root of SOURCE_ROOTS) {
    await walk(root, found);
  }

  for (const file of SOURCE_FILES) {
    const absolute = path.join(ROOT, file);
    try {
      const stats = await stat(absolute);
      if (stats.isFile()) {
        found.add(file.replace(/\\/g, "/"));
      }
    } catch {
      // ignore missing optional docs
    }
  }

  return [...found].sort();
}

async function walk(relativeDir, found) {
  const absolute = path.join(ROOT, relativeDir);
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      if (entry.isDirectory() && !["skills", "docs"].includes(entry.name)) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      await walk(path.join(relativeDir, entry.name), found);
      continue;
    }

    const repoPath = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.add(repoPath);
    }
  }
}

function normalizeRepoPath(input) {
  return String(input || "")
    .trim()
    .replace(/^c:[/\\]/i, "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");
}

function parseDocument(repoPath, raw, mtimeMs) {
  const ext = path.extname(repoPath).toLowerCase();
  const baseName = path.basename(repoPath, ext);
  const meta = readFrontmatter(raw);
  const body = meta.body || raw;
  const title = meta.title || extractFirstHeading(body) || prettifyName(baseName);
  const summary = meta.summary || extractSummary(body);
  const tags = normalizeTags(meta.tags);
  const kind = repoPath.startsWith("skills/")
    ? "skill"
    : repoPath.startsWith(".autoreflex/notes/")
      ? "note"
      : "doc";
  const hash = crypto.createHash("sha1").update(raw).digest("hex");

  return {
    path: repoPath,
    absolutePath: path.join(ROOT, repoPath),
    title,
    summary,
    tags,
    kind,
    hash,
    mtimeMs,
    body,
    source: meta.source || null,
  };
}

function readFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { body: raw };
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { body: raw };
  }

  const frontmatter = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, "");
  const data = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    if (key === "tags") {
      data.tags = value
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    data[key] = value.replace(/^["']|["']$/g, "");
  }

  return { ...data, body };
}

function extractFirstHeading(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractSummary(text) {
  const cleaned = text
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/^#.+$/m, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return cleaned[0] ? cleaned[0].slice(0, 240) : "";
}

function prettifyName(name) {
  return String(name)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

async function buildIndex(documents, useEmbeddings) {
  const indexed = [];

  for (const doc of documents) {
    const chunks = chunkDocument(doc.body || "", doc.title);
    const enrichedChunks = [];

    for (const chunk of chunks) {
      const embedding = useEmbeddings ? await embedText(chunk.text) : null;
      enrichedChunks.push({
        id: chunk.id,
        order: chunk.order,
        text: chunk.text,
        embedding,
      });
    }

    indexed.push({
      path: doc.path,
      absolutePath: doc.absolutePath,
      title: doc.title,
      summary: doc.summary,
      tags: doc.tags,
      kind: doc.kind,
      hash: doc.hash,
      mtimeMs: doc.mtimeMs,
      source: doc.source,
      chunks: enrichedChunks,
    });
  }

  return indexed;
}

function chunkDocument(body, title) {
  const text = body.trim();
  if (!text) {
    return [
      {
        id: `${slugify(title || "doc")}-0`,
        order: 0,
        text: title || "",
      },
    ];
  }

  const chunks = [];
  let cursor = 0;
  let order = 0;

  while (cursor < text.length) {
    const end = Math.min(text.length, cursor + MAX_CHUNK_CHARS);
    let slice = text.slice(cursor, end);
    if (end < text.length) {
      const cut = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf("\n#"), slice.lastIndexOf(". "));
      if (cut > MAX_CHUNK_CHARS * 0.45) {
        slice = slice.slice(0, cut + 1).trim();
      }
    }

    chunks.push({
      id: `${slugify(title || "doc")}-${order}`,
      order,
      text: `${title}\n\n${slice}`.trim(),
    });

    if (cursor + slice.length >= text.length) {
      break;
    }

    cursor += Math.max(1, slice.length - CHUNK_OVERLAP);
    order += 1;
  }

  return chunks;
}

function slugify(value) {
  return String(value || "doc")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "doc";
}

async function embedText(text) {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload.embedding)) {
      throw new Error("embedding ausente");
    }

    return payload.embedding;
  } catch (error) {
    if (state.modelReady) {
      console.warn(`[autoreflex] embedding falhou, usando fallback lexical: ${messageOf(error)}`);
    }
    state.modelReady = false;
    state.backend = "fallback";
    return null;
  }
}

async function searchDocuments(query, limit) {
  if (!query || query === "*") {
    return state.documents
      .slice()
      .sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0))
      .slice(0, limit)
      .map((doc) => toSearchResult(doc, 1));
  }

  const tokens = tokenize(query);
  const queryEmbedding = state.modelReady ? await embedText(query) : null;

  const scored = state.documents.map((doc) => {
    const lexicalScore = lexicalMatchScore(doc, tokens);
    const semanticScore = queryEmbedding ? documentSemanticScore(doc, queryEmbedding) : 0;
    const score = queryEmbedding ? Math.max(semanticScore, lexicalScore) + lexicalScore * 0.18 : lexicalScore;

    return {
      doc,
      score,
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => toSearchResult(doc, score));
}

function lexicalMatchScore(doc, tokens) {
  if (tokens.length === 0) {
    return 0;
  }

  const haystack = tokenize([doc.title, doc.summary, ...(doc.tags || [])].join(" "));
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 2.5;
    }
    if ((doc.path || "").toLowerCase().includes(token)) {
      score += 1.2;
    }
  }

  return score / tokens.length;
}

function documentSemanticScore(doc, queryEmbedding) {
  let best = 0;
  for (const chunk of doc.chunks || []) {
    if (!Array.isArray(chunk.embedding)) {
      continue;
    }
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (score > best) {
      best = score;
    }
  }
  return best;
}

function toSearchResult(doc, score) {
  return {
    score: Number(score.toFixed(4)),
    skill_path: doc.path,
    skill_name: doc.title,
    summary: doc.summary,
    kind: doc.kind,
  };
}

async function getDocument(skillPath) {
  const repoPath = normalizeRepoPath(skillPath);
  const absolutePath = path.join(ROOT, repoPath);
  const meta = await getSkillMeta(repoPath);

  try {
    const raw = await readFile(absolutePath, "utf8");
    return {
      skill_path: repoPath,
      skill_name: meta.title || extractFirstHeading(raw) || prettifyName(path.basename(repoPath, path.extname(repoPath))),
      summary: meta.summary || extractSummary(raw),
      content: raw,
      tags: meta.tags || [],
    };
  } catch {
    return null;
  }
}

async function getSkillMeta(repoPath) {
  if (!repoPath.startsWith("skills/") || !repoPath.endsWith(".md")) {
    return {};
  }

  const metaPath = repoPath.replace(/\.md$/, ".meta.json");
  try {
    const raw = await readFile(path.join(ROOT, metaPath), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }

  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i += 1) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    magA += x * x;
    magB += y * y;
  }

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function recordNote({ title, body, source, tags }) {
  await ensureStorage();

  const stamp = new Date().toISOString();
  const noteFile = `${stamp.replace(/[:.]/g, "-")}-${slugify(title)}.md`;
  const notePath = path.join(NOTES_DIR, noteFile);
  const content = [
    "---",
    `title: ${title}`,
    `source: ${source}`,
    `tags: ${tags.join(",")}`,
    `created_at: ${stamp}`,
    "---",
    "",
    body.trim(),
    "",
  ].join("\n");

  await writeFile(notePath, content, "utf8");
  return notePath;
}

async function writeState() {
  const payload = {
    version: 1,
    updatedAt: state.indexUpdatedAt,
    backend: state.backend,
    modelReady: state.modelReady,
    documents: state.documents,
  };
  await writeFile(INDEX_FILE, JSON.stringify(payload, null, 2), "utf8");
}

function mergeDocuments(current, updates) {
  const map = new Map(current.map((doc) => [doc.path, doc]));
  for (const doc of updates) {
    map.set(doc.path, doc);
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

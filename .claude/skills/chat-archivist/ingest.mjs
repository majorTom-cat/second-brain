#!/usr/bin/env node
// chat-archivist 인제스트 엔진 — /archive <project> 의 [tier: bulk] 부분.
//
// 하는 일 (순수 기계작업, 판단 없음):
//   1. rails/archive-sources.yaml 에서 project 의 세션 폴더들을 찾는다.
//   2. 각 ~/.claude/projects/<folder>/*.jsonl → archive/<project>/chats/raw/ 로 복사.
//   3. 각 트랜스크립트를 파싱해 chats/INDEX.md (날짜·작업맥락·주제·원본경로) 생성.
//   4. 비밀 스캔 → chats/SECRETS.md (실제 비밀은 마스킹해서만 기록).
//   5. <project>/README.md 재생성(통계) + knowledge.md/ideas.md 없으면 템플릿으로 스캐폴드.
//   6. archive/INDEX.md 에 프로젝트 한 줄 갱신.
//
// knowledge.md / ideas.md 의 '내용 distill'은 판단(judgment)이라 사람/Claude가 채운다(스캐폴드만).
//
// 사용:  node .claude/skills/chat-archivist/ingest.mjs <project>
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dir, '..', '..', '..');            // .claude/skills/chat-archivist → repo root
const HOME = process.env.USERPROFILE || process.env.HOME;
const PROJECTS_BASE = path.join(HOME, '.claude', 'projects');

const project = process.argv[2];
if (!project) { console.error('usage: ingest.mjs <project>'); process.exit(2); }

// ---- rails/archive-sources.yaml 최소 파서 (이 파일 구조 전용) ----
function parseSources(text) {
  const out = {}; let cur = null; let mode = null;
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue;
    const line = rawLine.replace(/\s+#.*$/, '');               // 인라인 주석(' #...') 제거
    let m;
    if ((m = line.match(/^([A-Za-z0-9._-]+):\s*$/))) { cur = m[1]; out[cur] = { sessions: [] }; mode = null; }
    else if (cur && (m = line.match(/^\s+repo:\s*(.+)$/))) out[cur].repo = m[1].trim();
    else if (cur && /^\s+sessions:\s*$/.test(line)) mode = 'sessions';
    else if (cur && (m = line.match(/^\s+sensitivity:\s*(.+)$/))) { out[cur].sensitivity = m[1].trim(); mode = null; }
    else if (cur && mode === 'sessions' && (m = line.match(/^\s+-\s*(\S+)/))) out[cur].sessions.push(m[1]);
  }
  return out;
}

const sources = parseSources(fs.readFileSync(path.join(REPO, 'rails', 'archive-sources.yaml'), 'utf8'));
const cfg = sources[project];
if (!cfg) { console.error(`unknown project "${project}". known: ${Object.keys(sources).join(', ')}`); process.exit(2); }

const baseEnc = (cfg.repo || '').replace(/[:\\/]+/g, '-');     // E:\agora → E--agora
const outDir = path.join(REPO, 'archive', project);
const rawDir = path.join(outDir, 'chats', 'raw');
fs.mkdirSync(rawDir, { recursive: true });

// ---- 비밀 스캔 패턴 (고신호 위주) ----
const SECRET_PATTERNS = [
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['Anthropic key', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI-style key', /sk-[A-Za-z0-9]{20,}/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['GitHub PAT', /github_pat_[A-Za-z0-9_]{50,}/],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Bearer token', /Bearer\s+[A-Za-z0-9._-]{24,}/],
  ['Known secret env', /(ANTHROPIC_API_KEY|GEMINI_API_KEY|OPENAI_API_KEY|GITLAB_TOKEN)\s*[=:]\s*["']?[A-Za-z0-9._/+-]{12,}/],
  ['Generic secret assign', /(?:^|[^A-Za-z])(?:api[_-]?key|secret|passwd|password|access[_-]?token)["']?\s*[=:]\s*["'][A-Za-z0-9._/+\-]{12,}["']/i],
];
function mask(s) {
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length <= 10) return s[0] + '…';
  return s.slice(0, 4) + '…'.repeat(3) + s.slice(-2);
}

// ---- 마스킹 규칙 (아카이브 사본에 적용; 원본 ~/.claude/projects 은 불변) ----
// 토큰형은 통째로, 할당형(KEY=값)은 값만 가려 JSON 유효성을 보존한다.
const REDACT = '[REDACTED-SECRET]';
const REDACT_RULES = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/g, REDACT],
  [/AKIA[0-9A-Z]{16}/g, REDACT],
  [/AIza[0-9A-Za-z_-]{35}/g, REDACT],
  [/gh[pousr]_[A-Za-z0-9]{30,}/g, REDACT],
  [/github_pat_[A-Za-z0-9_]{50,}/g, REDACT],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/g, REDACT],
  [/sk-[A-Za-z0-9]{20,}/g, REDACT],                                          // sk-ant 처리 후
  [/((?:ANTHROPIC_API_KEY|GEMINI_API_KEY|OPENAI_API_KEY|GITLAB_TOKEN|api[_-]?key|secret|passwd|password|access[_-]?token)["']?\s*[=:]\s*["']?)[A-Za-z0-9._/+\-]{12,}/gi, `$1${REDACT}`],
  [/(Bearer\s+)[A-Za-z0-9._-]{24,}/g, `$1${REDACT}`],
];
function redactFile(p) {
  let text = fs.readFileSync(p, 'utf8'); let count = 0;
  for (const [re, rep] of REDACT_RULES) {
    const hits = text.match(re); if (hits) { count += hits.length; text = text.replace(re, rep); }
  }
  if (count) fs.writeFileSync(p, text);
  return count;
}

// ---- 한 트랜스크립트 파싱 ----
async function parseTranscript(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let first = null, last = null, summary = null, topic = null, lineNo = 0;
  const hits = [];
  for await (const line of rl) {
    lineNo++;
    if (!line.trim()) continue;
    // 비밀 스캔 (원시 라인 대상)
    for (const [name, re] of SECRET_PATTERNS) {
      const mm = line.match(re);
      if (mm) hits.push({ name, line: lineNo, preview: mask(mm[0]) });
    }
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    if (ev.timestamp) { if (!first) first = ev.timestamp; last = ev.timestamp; }
    if (!summary && ev.type === 'summary' && typeof ev.summary === 'string') summary = ev.summary;
    if (!topic && ev.type === 'user' && ev.message) {
      const c = ev.message.content;
      let txt = '';
      if (typeof c === 'string') txt = c;
      else if (Array.isArray(c)) txt = c.filter(p => p && p.type === 'text').map(p => p.text).join(' ');
      txt = (txt || '').replace(/\s+/g, ' ').trim();
      if (txt && !txt.startsWith('<') && !txt.startsWith('Caveat:')) topic = txt;
    }
  }
  return { first, last, summary, topic, hits };
}

const fmt = (iso) => {
  if (!iso) return '?';
  const d = new Date(iso);
  if (isNaN(d)) return '?';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const trunc = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : (s || ''));

const rows = [];
const allHits = [];
let totalBytes = 0;
let redactedTotal = 0;

for (const folder of cfg.sessions) {
  const srcDir = path.join(PROJECTS_BASE, folder);
  if (!fs.existsSync(srcDir)) { console.error(`  (없음, 건너뜀) ${srcDir}`); continue; }
  const ctx = folder === baseEnc ? '루트' : folder.startsWith(baseEnc) ? folder.slice(baseEnc.length).replace(/^-+/, '') : folder;
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsonl'));
  for (const f of files) {
    const src = path.join(srcDir, f);
    const sid = f.replace(/\.jsonl$/, '');
    totalBytes += fs.statSync(src).size;
    const dest = path.join(rawDir, f);
    fs.copyFileSync(src, dest);
    redactedTotal += redactFile(dest);           // 사본을 마스킹(원본 불변), 그 뒤 잔여 스캔
    const info = await parseTranscript(dest);
    rows.push({ sid, folder, ctx, date: info.first, topic: trunc(info.summary || info.topic || '(주제 추출 실패)', 90) });
    for (const h of info.hits) allHits.push({ ...h, file: f });
    console.error(`  ✓ ${folder}/${f}  (${info.first ? fmt(info.first) : '?'})`);
  }
}

rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));

// ---- chats/INDEX.md ----
const human = (b) => b > 1 << 20 ? (b / (1 << 20)).toFixed(1) + 'M' : (b / 1024).toFixed(0) + 'K';
const idxRows = rows.map((r, i) =>
  `| ${i + 1} | ${fmt(r.date)} | ${r.ctx} | ${r.topic.replace(/\|/g, '\\|')} | [raw/${r.sid}.jsonl](raw/${r.sid}.jsonl) | \`~/.claude/projects/${r.folder}\` |`
).join('\n');
const first = rows[0]?.date ? fmt(rows[0].date) : '?';
const lastR = rows[rows.length - 1]?.date ? fmt(rows[rows.length - 1].date) : '?';
fs.writeFileSync(path.join(outDir, 'chats', 'INDEX.md'),
`# ${project} — 채팅 세션 색인

> \`/archive ${project}\` 가 트랜스크립트를 파싱해 생성. 원본은 \`raw/<세션ID>.jsonl\`.
> 날짜 = 세션 첫 이벤트 timestamp(로컬). 주제 = summary 또는 첫 사용자 메시지.

| # | 날짜 | 작업맥락 | 주제 | 세션 파일 | 원본 경로 |
| --- | --- | --- | --- | --- | --- |
${idxRows}

## 요약 통계

- 총 세션: ${rows.length} 개
- 기간: ${first} ~ ${lastR}
- 원본 용량: ${human(totalBytes)}
`);

// ---- chats/SECRETS.md ----
const seen = new Set();
const uniqHits = allHits.filter(h => { const k = h.name + h.file + h.preview; if (seen.has(k)) return false; seen.add(k); return true; });
const verdict = uniqHits.length ? '⚠️ 잔여 비밀 있음 — 확인 필요' : (redactedTotal ? '✅ 마스킹됨 (잔여 0)' : '✅ CLEAN');
const secretRows = uniqHits.length
  ? uniqHits.slice(0, 200).map(h => `| ${h.name} | \`${h.file}\` | ${h.line} | \`${h.preview}\` |`).join('\n')
  : '| — | — | — | 잔여 비밀 없음 |';
const company = (cfg.sensitivity === 'company-internal');
const rec = uniqHits.length
  ? `**잔여 ${uniqHits.length}건.** 패턴을 보강하거나 해당 라인을 직접 마스킹한 뒤 다시 스캔하세요.`
  : redactedTotal
    ? `발견된 키/비밀 **${redactedTotal}건을 사본에서 자동 마스킹**했습니다(원본 \`~/.claude/projects\` 는 불변). 키 노출 위험 제거됨.`
      + (company ? ' 단, 이 프로젝트는 **회사 데이터**라 실명·내부주소가 채팅 전반에 남아 있습니다 → 평문 raw 는 \`.gitignore\` 처리됨. 클라우드 백업은 `--encrypt` 로 `raw.tar.gpg` 만 올리세요.' : ' 평문 raw 를 커밋·푸시해도 키 노출 위험은 없습니다.')
    : '발견 없음. 키 노출 위험 없음' + (company ? ' (단 회사 실명/내부주소는 별도 판단 — 평문 raw 는 `.gitignore`).' : '.');
fs.writeFileSync(path.join(outDir, 'chats', 'SECRETS.md'),
`# ${project} — 비밀 스캔 리포트

> \`/archive ${project}\` 가 \`chats/raw/\` 사본을 마스킹·스캔한 결과. **푸시 전에 반드시 확인.**

| 상태 | 값 |
| --- | --- |
| 스캔 일시 | ${fmt(new Date().toISOString())} |
| 스캔 패턴 수 | ${SECRET_PATTERNS.length} |
| 자동 마스킹 | ${redactedTotal} 건 |
| 잔여 발견(중복 제거) | ${uniqHits.length} |
| 판정 | ${verdict} |

## 잔여 발견 항목 (있으면 직접 처리)

| 유형 | 파일 | 라인 | 미리보기 |
| --- | --- | --- | --- |
${secretRows}

## 권고

${rec}
`);

// ---- 회사 데이터: 평문 raw 커밋 차단(.gitignore), 암호화본(raw.tar.gpg)만 커밋 ----
if (company) {
  fs.writeFileSync(path.join(outDir, 'chats', '.gitignore'),
`# ${cfg.sensitivity}: 평문 원본은 커밋 금지(회사 실명·내부주소 포함). 암호화본만 커밋.
raw/
raw.tar
`);
}

// ---- README.md (재생성, 통계) ----
const chatsState = fs.existsSync(path.join(outDir, 'chats', 'raw.tar.gpg')) ? '🔒 암호화(chats/raw.tar.gpg)' : '평문(chats/raw/)';
fs.writeFileSync(path.join(outDir, 'README.md'),
`# ${project} — 아카이브

> 과거 프로젝트의 지식·아이디어·채팅 이력 보관소. \`/archive ${project}\` 가 생성/갱신한다.

| 항목 | 값 |
| --- | --- |
| 원본 repo | \`${cfg.repo}\` (읽기 전용 참조) |
| 민감도 | ${cfg.sensitivity || '?'} |
| 세션 수 | ${rows.length} 개 |
| 채팅 원본 | ${chatsState} |
| 원본 용량 | ${human(totalBytes)} |
| 마지막 인제스트 | ${fmt(new Date().toISOString())} |

## 이 폴더 안내

- [\`knowledge.md\`](knowledge.md) — distill된 노하우·핵심 결정·함정.
- [\`ideas.md\`](ideas.md) — 아이디어·백로그·미실현 스파크.
- [\`chats/INDEX.md\`](chats/INDEX.md) — 세션 색인(날짜·주제·원본 경로).
- [\`chats/SECRETS.md\`](chats/SECRETS.md) — 비밀 스캔 리포트.
- \`chats/raw/\` — 원본 트랜스크립트(JSONL). 암호화 시 \`chats/raw.tar.gpg\`.
`);

// ---- knowledge.md / ideas.md 스캐폴드(없을 때만; distill은 판단 단계) ----
const tpl = (name) => fs.readFileSync(path.join(REPO, 'rails', 'artifact-templates', 'archive', name), 'utf8')
  .replaceAll('{{PROJECT}}', project).replaceAll('{{REPO_PATH}}', cfg.repo || '');
for (const [out, t] of [['knowledge.md', 'knowledge.template.md'], ['ideas.md', 'ideas.template.md']]) {
  const p = path.join(outDir, out);
  if (!fs.existsSync(p)) fs.writeFileSync(p, tpl(t));
}

// ---- archive/INDEX.md 갱신 ----
const idxPath = path.join(REPO, 'archive', 'INDEX.md');
const pointer = `- [${project}](${project}/README.md) — ${cfg.sensitivity}, ${rows.length}세션 ${human(totalBytes)} · [지식](${project}/knowledge.md) · [채팅](${project}/chats/INDEX.md)`;
let idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';
if (!idx) idx = `# archive 색인\n\n> \`/archive <project>\` 가 갱신. 프로젝트별 보관소 한 줄 포인터.\n\n`;
const lines = idx.split(/\r?\n/);
const li = lines.findIndex(l => l.startsWith(`- [${project}](`));
if (li >= 0) lines[li] = pointer; else lines.push(pointer);
fs.writeFileSync(idxPath, lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');

console.error(`\n[ingest] ${project}: ${rows.length}세션, ${human(totalBytes)}, 비밀 ${uniqHits.length}건. → archive/${project}/`);
console.log(JSON.stringify({ project, sessions: rows.length, bytes: totalBytes, secrets: uniqHits.length, verdict }));

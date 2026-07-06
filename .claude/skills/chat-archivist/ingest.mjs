#!/usr/bin/env node
// chat-archivist 인제스트 엔진 — /archive 의 [tier: bulk] 부분 (순수 기계작업, 무료/로컬).
//
// 하는 일: ~/.claude/projects/<folder>/*.jsonl → archive/<project>/chats/raw/ 복사 →
//   chats/INDEX.md(날짜·맥락·주제) + chats/SECRETS.md(비밀 자동 마스킹) + README.md(통계) + archive/INDEX.md 갱신.
//   knowledge.md/ideas.md 는 '내용 distill'이 판단(judgment)이라 없을 때만 스캐폴드(사람/Claude가 채움).
//
// 사용:
//   node ingest.mjs <project>   한 프로젝트
//   node ingest.mjs all         archive-sources.yaml 의 모든 프로젝트
//   node ingest.mjs auto        auto_push: true 인 프로젝트만 (스케줄 새로고침용 — 회사 데이터 제외)
// 마지막 stdout 줄에 머신가독 JSON 요약을 한 줄 출력(refresh.ps1 이 파싱).
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dir, '..', '..', '..');            // .claude/skills/chat-archivist → repo root
const HOME = process.env.USERPROFILE || process.env.HOME;
const PROJECTS_BASE = path.join(HOME, '.claude', 'projects');

// ---- rails/archive-sources.yaml 최소 파서 (이 파일 구조 전용) ----
function parseSources(text) {
  const out = {}; let cur = null; let mode = null;
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue;
    const line = rawLine.replace(/\s+#.*$/, '');               // 인라인 주석(' #...') 제거
    let m;
    if ((m = line.match(/^([A-Za-z0-9._-]+):\s*$/))) { cur = m[1]; out[cur] = { sessions: [] }; mode = null; }
    else if (cur && /^\s+sessions:\s*$/.test(line)) mode = 'sessions';
    else if (cur && mode === 'sessions' && (m = line.match(/^\s+-\s*(\S+)/))) out[cur].sessions.push(m[1]);
    else if (cur && (m = line.match(/^\s+([A-Za-z0-9_]+):\s*(.+)$/))) { out[cur][m[1]] = m[2].trim(); mode = null; }
  }
  for (const k of Object.keys(out)) {                          // 문자열 → 불리언 (기본 false)
    out[k].auto_push = /^true$/i.test(String(out[k].auto_push ?? ''));
    out[k].allow_internal = /^true$/i.test(String(out[k].allow_internal ?? ''));
  }
  return out;
}

const sources = parseSources(fs.readFileSync(path.join(REPO, 'rails', 'archive-sources.yaml'), 'utf8'));

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

// ---- 사내정보 감지기 (마스킹 대상 아님 — '평문 raw 를 클라우드에 올려도 되나'를 판정) ----
// STRONG 마커가 잡히면 회사 데이터로 보고, personal 이라도 안전 기본값으로 평문 raw 를 커밋에서 격리한다.
// 명시적으로 `allow_internal: true` 를 준 프로젝트만 평문 유지(사용자가 검토했다는 뜻).
//
// ★ 회사 식별 문자열(도메인·네임스페이스 등)은 커밋되는 코드/리포트에 박지 않는다.
//   실제 마커는 gitignore 된 rails/internal-markers.local 에 두고(한 줄 1개, 리터럴), 라벨은 일반화한다.
//   파일이 없으면 사설 IP(RFC1918) 만으로 약하게 감지한다.
const LABEL_LOCAL = '사내 마커(로컬규칙)';
const LABEL_IP = '사설IP(RFC1918)';
function loadInternalPatterns() {
  const pats = [{ label: LABEL_IP, re: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g }];
  const localFile = path.join(REPO, 'rails', 'internal-markers.local');
  if (fs.existsSync(localFile)) {
    for (const ln of fs.readFileSync(localFile, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'))) {
      pats.push({ label: LABEL_LOCAL, re: new RegExp(ln.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') });
    }
  }
  return pats;
}
const INTERNAL_PATTERNS = loadInternalPatterns();

// [P-T1 2026-07-06] 커밋되는 산출물(INDEX 세션 제목 등)에 사내 마커가 평문으로 실리는 재유출 방지.
// 마스킹은 raw 사본(redactFile=비밀)만 다뤘고 *세션 제목*은 사용자가 친 프롬프트 원문이라 도메인·네임스페이스가
// 그대로 노출됐다(수동 정제는 재생성 때마다 되살아남 — 실증 2회). 라벨은 일반화, 원본 raw 정책은 불변.
function sanitizeInternal(txt) {
  let out = String(txt || '');
  for (const { label, re } of INTERNAL_PATTERNS) {
    out = out.replace(re, label === LABEL_IP ? '<사설IP>' : '<사내마커>');
  }
  return out;
}

async function parseTranscript(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let first = null, last = null, summary = null, topic = null, lineNo = 0;
  const hits = []; const internal = {};
  for await (const line of rl) {
    lineNo++;
    if (!line.trim()) continue;
    for (const [name, re] of SECRET_PATTERNS) { const mm = line.match(re); if (mm) hits.push({ name, line: lineNo, preview: mask(mm[0]) }); }
    for (const { label, re } of INTERNAL_PATTERNS) { const c = (line.match(re) || []).length; if (c) internal[label] = (internal[label] || 0) + c; }
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    if (ev.timestamp) { if (!first) first = ev.timestamp; last = ev.timestamp; }
    if (!summary && ev.type === 'summary' && typeof ev.summary === 'string') summary = ev.summary;
    if (!topic && ev.type === 'user' && ev.message) {
      const c = ev.message.content;
      let txt = typeof c === 'string' ? c : Array.isArray(c) ? c.filter(p => p && p.type === 'text').map(p => p.text).join(' ') : '';
      txt = (txt || '').replace(/\s+/g, ' ').trim();
      if (txt && !txt.startsWith('<') && !txt.startsWith('Caveat:')) topic = txt;
    }
  }
  return { first, last, summary, topic, hits, internal };
}

const fmt = (iso) => {
  if (!iso) return '?';
  const d = new Date(iso); if (isNaN(d)) return '?';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const trunc = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : (s || ''));
const human = (b) => b > 1 << 20 ? (b / (1 << 20)).toFixed(1) + 'M' : (b / 1024).toFixed(0) + 'K';

// [P-B1] 타임스탬프만 바뀐 무변경 재생성 churn 방지: ts 라벨 라인을 뺀 본문이 같으면 기존 파일을 유지(diff 0).
function writeStable(filePath, content, tsLabels = []) {
  if (tsLabels.length && fs.existsSync(filePath)) {
    const strip = (s) => s.split(/\r?\n/).filter(l => !tsLabels.some(lbl => l.includes(lbl))).join('\n');
    if (strip(fs.readFileSync(filePath, 'utf8')) === strip(content)) return;   // ts 외 동일 → 기존 유지
  }
  fs.writeFileSync(filePath, content);
}
const NOW = Date.now();
const ACTIVE_GRACE_MS = 180_000;   // [P-B2] 최근 3분 내 갱신된 세션 = 진행 중(라이브)로 보고 '새 세션' 카운트에서 제외

// ====== 한 프로젝트 인제스트 ======
async function ingestProject(project, cfg) {
  const baseEnc = (cfg.repo || '').replace(/[:\\/]+/g, '-');     // E:\agora → E--agora
  const outDir = path.join(REPO, 'archive', project);
  const rawDir = path.join(outDir, 'chats', 'raw');
  fs.mkdirSync(rawDir, { recursive: true });
  const company = (cfg.sensitivity === 'company-internal');

  // knowledge.md 의 마지막 distill 시각(없으면 0 → 전부 '새 세션')
  const kPath = path.join(outDir, 'knowledge.md');
  const kMtime = fs.existsSync(kPath) ? fs.statSync(kPath).mtimeMs : 0;

  const rows = []; const allHits = []; let totalBytes = 0; let redactedTotal = 0; const internalTotals = {};
  for (const folder of cfg.sessions) {
    const srcDir = path.join(PROJECTS_BASE, folder);
    if (!fs.existsSync(srcDir)) { console.error(`  (없음, 건너뜀) ${srcDir}`); continue; }
    const ctx = folder === baseEnc ? '루트' : folder.startsWith(baseEnc) ? folder.slice(baseEnc.length).replace(/^-+/, '') : folder;
    for (const f of fs.readdirSync(srcDir).filter(f => f.endsWith('.jsonl'))) {
      const src = path.join(srcDir, f);
      const sid = f.replace(/\.jsonl$/, '');
      const srcMtime = fs.statSync(src).mtimeMs;
      totalBytes += fs.statSync(src).size;
      const dest = path.join(rawDir, f);
      fs.copyFileSync(src, dest);
      redactedTotal += redactFile(dest);
      const info = await parseTranscript(dest);
      rows.push({ sid, folder, ctx, date: info.first, mtime: srcMtime, topic: trunc(sanitizeInternal(info.summary || info.topic || '(주제 추출 실패)'), 90) });
      for (const h of info.hits) allHits.push({ ...h, file: f });
      for (const [k, v] of Object.entries(info.internal || {})) internalTotals[k] = (internalTotals[k] || 0) + v;
    }
  }
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const newSinceDistill = rows.filter(r => r.mtime > kMtime && (NOW - r.mtime) > ACTIVE_GRACE_MS).length;   // [P-B2] 활성(라이브) 세션 제외

  // 사내정보 판정: 로컬규칙 마커 1건 이상 또는 사설 IP 다수면 회사 데이터로 본다.
  // personal 이라도 격리(.gitignore)가 안전 기본값(allow_internal 로만 해제).
  const localHits = internalTotals[LABEL_LOCAL] || 0;
  const ipHits = internalTotals[LABEL_IP] || 0;
  const internalStrong = localHits > 0 || ipHits >= 10;
  const internalCount = Object.values(internalTotals).reduce((a, b) => a + b, 0);
  const allowInternal = !!cfg.allow_internal;                 // 사용자가 검토하고 평문 유지 허용
  const segregate = internalStrong && !company && !allowInternal;   // 평문 raw 를 커밋에서 격리할지

  // chats/INDEX.md
  const idxRows = rows.map((r, i) =>
    `| ${i + 1} | ${fmt(r.date)} | ${r.ctx} | ${r.topic.replace(/\|/g, '\\|')} | [raw/${r.sid}.jsonl](raw/${r.sid}.jsonl) | \`~/.claude/projects/${r.folder}\` |`).join('\n');
  fs.writeFileSync(path.join(outDir, 'chats', 'INDEX.md'),
`# ${project} — 채팅 세션 색인

> \`/archive ${project}\` 가 트랜스크립트를 파싱해 생성. 원본은 \`raw/<세션ID>.jsonl\`.
> 날짜 = 세션 첫 이벤트 timestamp(로컬). 주제 = summary 또는 첫 사용자 메시지.

| # | 날짜 | 작업맥락 | 주제 | 세션 파일 | 원본 경로 |
| --- | --- | --- | --- | --- | --- |
${idxRows}

## 요약 통계

- 총 세션: ${rows.length} 개
- 기간: ${rows[0]?.date ? fmt(rows[0].date) : '?'} ~ ${rows[rows.length - 1]?.date ? fmt(rows[rows.length - 1].date) : '?'}
- 원본 용량: ${human(totalBytes)}
`);

  // chats/SECRETS.md
  const seen = new Set();
  const uniqHits = allHits.filter(h => { const k = h.name + h.file + h.preview; if (seen.has(k)) return false; seen.add(k); return true; });
  const verdict = uniqHits.length ? 'REVIEW' : 'CLEAN';
  const verdictTxt = uniqHits.length ? '⚠️ 잔여 비밀 있음 — 확인 필요' : (redactedTotal ? '✅ 마스킹됨 (잔여 0)' : '✅ CLEAN');
  const secretRows = uniqHits.length
    ? uniqHits.slice(0, 200).map(h => `| ${h.name} | \`${h.file}\` | ${h.line} | \`${h.preview}\` |`).join('\n')
    : '| — | — | — | 잔여 비밀 없음 |';
  const rec = uniqHits.length
    ? `**잔여 ${uniqHits.length}건.** 패턴을 보강하거나 해당 라인을 직접 마스킹한 뒤 다시 스캔하세요. (자동 푸시는 보류됨)`
    : redactedTotal
      ? `발견된 키/비밀 **${redactedTotal}건을 사본에서 자동 마스킹**했습니다(원본 \`~/.claude/projects\` 는 불변).`
        + (company ? ' 회사 데이터라 평문 raw 는 `.gitignore` 처리됨. 클라우드 백업은 `encrypt.sh` 로 `raw.tar.gpg` 만.' : ' 평문 raw 커밋해도 키 노출 위험 없음.')
      : '발견 없음.' + (company ? ' (회사 실명/내부주소는 별도 판단 — 평문 raw 는 `.gitignore`).' : '');
  writeStable(path.join(outDir, 'chats', 'SECRETS.md'),
`# ${project} — 비밀 스캔 리포트

> \`/archive ${project}\` 가 \`chats/raw/\` 사본을 마스킹·스캔한 결과. **푸시 전에 반드시 확인.**

| 상태 | 값 |
| --- | --- |
| 스캔 일시 | ${fmt(new Date().toISOString())} |
| 스캔 패턴 수 | ${SECRET_PATTERNS.length} |
| 자동 마스킹 | ${redactedTotal} 건 |
| 잔여 발견(중복 제거) | ${uniqHits.length} |
| 판정 | ${verdictTxt} |

## 잔여 발견 항목 (있으면 직접 처리)

| 유형 | 파일 | 라인 | 미리보기 |
| --- | --- | --- | --- |
${secretRows}

## 권고

${rec}
`, ['스캔 일시']);

  // ---- chats/SENSITIVE.md (사내정보 감지 리포트) ----
  const intRows = Object.keys(internalTotals).length
    ? Object.entries(internalTotals).map(([k, v]) => `| ${k} | ${v} |`).join('\n')
    : '| — | 0 |';
  const intStatus = company ? '회사 데이터(company-internal) — 평문 raw 는 이미 `.gitignore`.'
    : segregate ? '⛔ 사내 마커 감지 + personal → 평문 raw **자동 격리(.gitignore)**. 안전하다고 판단하면 yaml 에 `allow_internal: true` 추가.'
    : (internalStrong && allowInternal) ? '⚠️ 사내 마커 있으나 `allow_internal: true` 로 평문 유지(사용자가 검토함).'
    : '사내 STRONG 마커 없음 — 평문 안전.';
  fs.writeFileSync(path.join(outDir, 'chats', 'SENSITIVE.md'),
`# ${project} — 사내정보 감지 리포트

> \`/archive ${project}\` 가 채팅에서 회사 식별 마커(사내 도메인·네임스페이스·사설 IP)를 센 결과.
> 비밀키와 달리 마스킹 대상이 아니라, **평문 raw 를 클라우드에 올려도 되는지**를 판정한다.

| 마커 | 발견 수 |
| --- | --- |
${intRows}

- 총 ${internalCount} 건, STRONG(확실 사내) ${internalStrong ? '**있음**' : '없음'}.
- 판정: ${intStatus}
`);

  // 평문 raw 커밋 차단: 회사 데이터이거나, 사내정보가 감지된 personal(allow_internal 아님)
  if (company || segregate) fs.writeFileSync(path.join(outDir, 'chats', '.gitignore'),
`# ${company ? cfg.sensitivity : '사내정보 자동격리(personal+STRONG마커)'}: 평문 원본 커밋 금지(회사 식별정보 포함). 암호화본(raw.tar.gpg)만 커밋.
raw/
raw.tar
`);

  // README.md (재생성)
  const chatsState = fs.existsSync(path.join(outDir, 'chats', 'raw.tar.gpg')) ? '🔒 암호화(chats/raw.tar.gpg)' : ((company || segregate) ? '평문 raw(로컬 전용 — .gitignore)' : '평문(chats/raw/)');
  writeStable(path.join(outDir, 'README.md'),
`# ${project} — 아카이브

> 과거 프로젝트의 지식·아이디어·채팅 이력 보관소. \`/archive ${project}\` 가 생성/갱신한다.

| 항목 | 값 |
| --- | --- |
| 원본 repo | \`${cfg.repo}\` (읽기 전용 참조) |
| 민감도 | ${cfg.sensitivity || '?'} |
| 자동 푸시 | ${cfg.auto_push ? '예(개인 데이터)' : '아니오(수동 검토 후)'} |
| 세션 수 | ${rows.length} 개 |
| 채팅 원본 | ${chatsState} |
| 원본 용량 | ${human(totalBytes)} |
| 사내정보 | ${internalCount}건${internalStrong ? ' (STRONG)' : ''}${segregate ? ' → 평문 raw 자동격리' : (internalStrong && allowInternal ? ' → allow_internal 평문유지' : '')} ([SENSITIVE.md](chats/SENSITIVE.md)) |
| 마지막 인제스트 | ${fmt(new Date().toISOString())} |
| distill 후 새 세션 | ${newSinceDistill} 개${newSinceDistill ? ' — knowledge.md 재정리 권장' : ''} |

## 이 폴더 안내

- [\`knowledge.md\`](knowledge.md) — distill된 노하우·핵심 결정·함정.
- [\`ideas.md\`](ideas.md) — 아이디어·백로그·미실현 스파크.
- [\`chats/INDEX.md\`](chats/INDEX.md) — 세션 색인(날짜·주제·원본 경로).
- [\`chats/SECRETS.md\`](chats/SECRETS.md) — 비밀 스캔 리포트.
- \`chats/raw/\` — 원본 트랜스크립트(JSONL). 암호화 시 \`chats/raw.tar.gpg\`.
`, ['마지막 인제스트']);

  // knowledge.md / ideas.md 스캐폴드(없을 때만)
  const tpl = (name) => fs.readFileSync(path.join(REPO, 'rails', 'artifact-templates', 'archive', name), 'utf8')
    .replaceAll('{{PROJECT}}', project).replaceAll('{{REPO_PATH}}', cfg.repo || '');
  for (const [out, t] of [['knowledge.md', 'knowledge.template.md'], ['ideas.md', 'ideas.template.md']]) {
    const p = path.join(outDir, out);
    if (!fs.existsSync(p)) fs.writeFileSync(p, tpl(t));
  }

  // archive/INDEX.md 갱신
  const idxPath = path.join(REPO, 'archive', 'INDEX.md');
  const pointer = `- [${project}](${project}/README.md) — ${cfg.sensitivity}${cfg.auto_push ? '·자동푸시' : ''}, ${rows.length}세션 ${human(totalBytes)}${newSinceDistill ? ` · ⚠️새 세션 ${newSinceDistill}` : ''} · [지식](${project}/knowledge.md) · [채팅](${project}/chats/INDEX.md)`;
  let idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';
  if (!idx) idx = `# archive 색인\n\n> \`/archive <project>\` 가 갱신. 프로젝트별 보관소 한 줄 포인터.\n\n`;
  const lines = idx.split(/\r?\n/);
  const li = lines.findIndex(l => l.startsWith(`- [${project}](`));
  if (li >= 0) lines[li] = pointer; else lines.push(pointer);
  fs.writeFileSync(idxPath, lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');

  if (segregate) console.error(`  [⛔] ${project}: 사내 마커 ${internalCount}건 감지(personal) → 평문 raw 자동 격리됨. 안전하면 archive-sources.yaml 에 allow_internal: true.`);
  console.error(`  [✓] ${project}: ${rows.length}세션 ${human(totalBytes)}, 마스킹 ${redactedTotal}, 잔여 ${uniqHits.length}, 새세션 ${newSinceDistill}, 사내 ${internalCount}${cfg.auto_push ? '' : ' (수동)'}`);
  return { project, sessions: rows.length, bytes: totalBytes, redacted: redactedTotal, secrets: uniqHits.length, verdict, newSinceDistill, autoPush: !!cfg.auto_push, sensitivity: cfg.sensitivity, internalCount, internalDetected: internalStrong, segregated: segregate, allowInternal };
}

// ====== 미등록 트랜스크립트 폴더 탐지 ======
// [P-B3] 임시/일시 폴더(Temp 등)는 프로젝트가 아니므로 등록 후보에서 제외.
const TRANSIENT_FOLDERS = [/AppData-Local-Temp/i, /-Local-Temp\b/i, /-Temp$/i, /Windows-Temp/i, /-Temp-/i];
function findUnregistered() {
  const registered = new Set(Object.values(sources).flatMap(c => c.sessions));
  const out = [];
  if (!fs.existsSync(PROJECTS_BASE)) return out;
  for (const folder of fs.readdirSync(PROJECTS_BASE)) {
    if (registered.has(folder)) continue;
    if (TRANSIENT_FOLDERS.some(re => re.test(folder))) continue;   // 임시 폴더 제외
    const d = path.join(PROJECTS_BASE, folder);
    if (!fs.statSync(d).isDirectory()) continue;
    const n = fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).length;
    if (n > 0) out.push({ folder, jsonl: n });
  }
  return out;
}

// ====== 메인 ======
const arg = process.argv[2];
if (!arg) { console.error('usage: ingest.mjs <project|all|auto>'); process.exit(2); }
let targets;
if (arg === 'all') targets = Object.keys(sources);
else if (arg === 'auto') targets = Object.keys(sources).filter(k => sources[k].auto_push);
else if (sources[arg]) targets = [arg];
else { console.error(`unknown "${arg}". known: ${Object.keys(sources).join(', ')} (또는 all/auto)`); process.exit(2); }

const summaries = [];
for (const p of targets) summaries.push(await ingestProject(p, sources[p]));
const unregistered = findUnregistered();

if (unregistered.length) {
  console.error(`\n[미등록] 아직 archive-sources.yaml 에 없는 트랜스크립트 폴더:`);
  for (const u of unregistered) console.error(`  - ${u.folder} (${u.jsonl} jsonl)  ← 포함하려면 yaml 에 등록`);
}
const staleProjects = summaries.filter(s => s.newSinceDistill > 0).map(s => s.project);
const segregated = summaries.filter(s => s.segregated).map(s => s.project);
if (segregated.length) console.error(`\n[⛔ 사내정보 자동격리] ${segregated.join(', ')} — 평문 raw 가 커밋에서 빠짐(.gitignore). 검토 후 안전하면 archive-sources.yaml 에 allow_internal: true.`);
console.error(`\n[ingest:${arg}] ${summaries.length}개 처리. ${staleProjects.length ? `재distill 권장: ${staleProjects.join(', ')}` : '모든 지식 최신'}.`);
console.log(JSON.stringify({ mode: arg, projects: summaries, unregistered, anyResidualSecret: summaries.some(s => s.secrets > 0), anySegregated: segregated.length > 0 }));

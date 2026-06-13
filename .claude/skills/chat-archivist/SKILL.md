---
name: chat-archivist
description: 아카이브 모듈 내부 절차. 한 프로젝트의 Claude Code 채팅 트랜스크립트를 archive/<project>/ 로 수집·색인·비밀스캔하고, 원본 repo 문서에서 지식/아이디어를 distill한다. 선택적으로 원본을 gpg 암호화한다. /archive 가 사용.
---

# chat-archivist — 과거 프로젝트 집대성

과거에 에이전트로 진행한 프로젝트의 **채팅 이력·노하우·아이디어**를 `archive/<project>/` 한곳에 모은다.
기계작업(복사·색인·스캔)은 엔진 스크립트가, **판단(지식 distill)**은 사람/Claude가 한다.

## 입력
- `rails/archive-sources.yaml` 의 한 프로젝트 슬러그(예: `agora`, `llm-wiki`).
- 원본 트랜스크립트: `~/.claude/projects/<인코딩폴더>/*.jsonl` (소스맵에 명시).
- 원본 repo: `E:\<project>` (읽기 전용 — 그 안에 파일 만들지 않는다).

## 절차

### 1) 기계 인제스트  `[tier: bulk]`
```
node .claude/skills/chat-archivist/ingest.mjs <project>   # 한 프로젝트
node .claude/skills/chat-archivist/ingest.mjs all          # 모든 프로젝트
node .claude/skills/chat-archivist/ingest.mjs auto         # auto_push:true(개인)만 — 스케줄러용
```
엔진이 하는 일: 트랜스크립트 복사(`chats/raw/`) → 비밀 **자동 마스킹**(사본만, 원본 불변) →
`chats/INDEX.md`(날짜·작업맥락·주제) → `chats/SECRETS.md` → `README.md`(통계+`newSinceDistill`) →
`knowledge.md`/`ideas.md` 스캐폴드(없을 때만) → `archive/INDEX.md` 갱신.
마지막 stdout 줄 JSON: `{mode, projects:[{project,secrets,newSinceDistill,autoPush,...}], unregistered, anyResidualSecret}`.
`unregistered` = `~/.claude/projects` 에 있지만 `archive-sources.yaml` 에 없는 폴더(등록 후보).

### 2) 비밀 게이트  `[tier: judgment]`
`chats/SECRETS.md` 판정을 확인한다.
- `CLEAN` → 다음 단계.
- `REVIEW NEEDED` → 발견 항목이 진짜 비밀인지 본다. 진짜면 **푸시 전** (a) 해당 라인 마스킹 또는
  (b) 4)의 `--encrypt` 로 raw 암호화. 사용자에게 알린다.

### 3) 지식 distill  `[tier: judgment]`
`E:\<project>` 의 HANDOFF/README/docs(읽기 전용)와 `chats/INDEX.md` 의 주제들을 읽고
`knowledge.md`(무엇·스택·핵심결정·노하우·함정·미해결)와 `ideas.md`(백로그·스파크·개선)를 **실제 내용으로 채운다**.
- 민감 프로젝트(`sensitivity: company-internal`)는 이 레이어에서 **실명·내부주소·비밀키를 일반화**한다(원본은 raw 에만).
- 출처 경로를 인용한다. 추측 금지 — 불명확하면 표시.

### 4) (선택) 원본 암호화  `[tier: bulk]`  — `--encrypt` 일 때만
비밀 정보를 클라우드에서 잠그려면:
```
cd archive/<project>/chats
tar -cf - raw | gpg --symmetric --cipher-algo AES256 -o raw.tar.gpg   # 암호 입력
rm -rf raw                                                            # 평문 제거(.gitignore 가 막아도)
```
복호: `gpg -d raw.tar.gpg | tar -xf -`. 암호는 비밀번호 관리자에 보관(잃으면 복구 불가).
`.gitignore` 에 `archive/**/chats/raw/` 가 있어 평문 raw 는 커밋되지 않는다.

### 5) (선택) 주기적 자동 새로고침  `[tier: bulk]`
무료로 개인 프로젝트만 자동 최신화:
- `schedule-setup.ps1` — `refresh.ps1` 을 Windows 예약작업으로 등록(기본 매주 일 21:00). `-Schedule DAILY` / `-Remove` 지원.
- `refresh.ps1 [-DryRun]` — `ingest auto` 실행 → **잔여 비밀 있으면 푸시 중단** → `auto_push` 프로젝트 경로 + `archive/INDEX.md`
  만 스테이징 → 변경 있으면 커밋·푸시. 로그: `archive/.refresh.log`(gitignore). distill 은 안 함(유료 → "재distill 권장"만 로그).
- 회사 데이터(`auto_push: false`)는 자동에서 제외 — 수동 `/archive <p>` + 검토 후에만.
- PS 스크립트는 **ASCII 전용**(PowerShell 5.1 이 BOM 없는 UTF-8 한글을 오독하므로). 한글은 node 출력/.md 에만.

### 6) 전역 명령 (어느 프로젝트에서든 `/archive`)
원본은 repo 안에 백업됨: `archive.global.md`. 전역 위치에 설치하면 cwd 무관하게 쓸 수 있다(엔진이 절대경로로 second-brain 을 찾음).
```
cp E:/second-brain/.claude/skills/chat-archivist/archive.global.md ~/.claude/commands/archive.md   # 재설치/복구
```
- second-brain 안에서는 프로젝트판 명령(상대경로), 그 외에서는 전역판(절대경로)이 쓰인다. 데이터는 늘 `E:/second-brain/archive/` 로 모인다.
- 전역 파일(`~/.claude/commands/`)은 repo 밖이라 클라우드 백업 안 됨 → 포맷 시 위 `cp` 한 줄로 복구.

## 출력
`archive/<project>/` = README + knowledge + ideas + chats(INDEX·SECRETS·raw 또는 raw.tar.gpg) + 갱신된 `archive/INDEX.md`.

## 원칙 (CLAUDE.md 정합)
- 원본 repo(`E:\agora`·`E:\llm-wiki`)에는 **아무 파일도 만들지 않는다**(읽기 전용 참조).
- **푸시는 사용자가 명시 지시할 때만.** 자동 푸시 금지.
- 비밀 스캔을 통과(또는 암호화)하기 전에는 푸시를 권하지 않는다.
- knowledge/ideas 재실행 시 기존 내용을 덮지 않는다(엔진은 없을 때만 스캐폴드). 갱신은 사람이.

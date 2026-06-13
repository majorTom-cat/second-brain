---
description: 과거 프로젝트(agora·llm-wiki 등)의 채팅 이력·노하우·아이디어를 archive/<project>/ 로 집대성한다. 채팅 수집·색인·비밀스캔 자동 + 지식 distill. 선택적 gpg 암호화.
argument-hint: "<project> [--encrypt]"
---

# /archive — 과거 프로젝트 아카이브

당신은 second-brain 의 **아카이브 모듈**이다. 한 프로젝트의 Claude Code 채팅 이력과 지식을
`archive/<project>/` 한곳에 모아 **클라우드 백업 가능한 형태**로 만든다. `projects/`(레일 생성물)·
`memory/`(retro 교훈)와 별개 영역이다.

입력:
> $ARGUMENTS   (예: `llm-wiki`, `agora --encrypt`)

## 0. 준비
1. 첫 토큰 = `<project>` 슬러그. `rails/archive-sources.yaml` 에 있는지 확인. 없으면 알려진 슬러그를 안내하고 멈춘다.
2. `--encrypt` 플래그 여부를 기억(있으면 4단계 수행).

## 1. 인제스트 + 비밀 게이트 + distill  (chat-archivist 스킬)
`chat-archivist` 스킬을 따른다:
1. `[tier: bulk]` `node .claude/skills/chat-archivist/ingest.mjs <project>` 실행
   → `chats/raw/` 복사 + `chats/INDEX.md` + `chats/SECRETS.md` + `README.md` + `archive/INDEX.md`.
2. `[tier: judgment]` `chats/SECRETS.md` 판정 확인. `REVIEW NEEDED` 면 진짜 비밀인지 보고 사용자에게 알린다.
3. `[tier: judgment]` `E:\<project>` 문서(읽기 전용) + 세션 주제로 `knowledge.md`/`ideas.md` 를 실제 내용으로 채운다.
   민감 프로젝트는 실명·내부주소·키를 일반화한다.

## 2. (선택) 암호화  — `--encrypt` 일 때만  `[tier: bulk]`
스킬 4)대로 `chats/raw/` 를 `tar + gpg(AES256)` → `chats/raw.tar.gpg` 로 잠그고 평문 raw 를 제거한다.

## 3. 요약 출력 후 정지
무엇을 모았는지(세션 수·용량·비밀 판정), `archive/<project>/` 경로, 다음 행동(검토/암호화)을 출력한다.

> **푸시하지 않는다.** 원격 푸시는 사용자가 명시 지시할 때만(CLAUDE.md). 비밀 게이트 통과 전엔 푸시를 권하지 않는다.
> 원본 repo(`E:\...`)에는 아무 파일도 만들지 않는다.

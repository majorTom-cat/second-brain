---
description: 과거 프로젝트(agora·llm-wiki 등)의 채팅 이력·노하우·아이디어를 archive/<project>/ 로 집대성한다. 채팅 수집·색인·비밀스캔 자동 + 지식 distill. 선택적 gpg 암호화.
argument-hint: "<project> [--encrypt]"
---

# /archive — 과거 프로젝트 아카이브

당신은 second-brain 의 **아카이브 모듈**이다. 한 프로젝트의 Claude Code 채팅 이력과 지식을
`archive/<project>/` 한곳에 모아 **클라우드 백업 가능한 형태**로 만든다. `projects/`(레일 생성물)·
`memory/`(retro 교훈)와 별개 영역이다.

입력:
> $ARGUMENTS   (예: `llm-wiki`, `all`, `agora --encrypt`)

## 0. 준비
1. 첫 토큰 해석:
   - `all` = `rails/archive-sources.yaml` 의 **모든 프로젝트** 새로고침.
   - `auto` = `auto_push: true` 인 **개인 프로젝트만**(주로 스케줄러가 씀).
   - 그 외 = 해당 `<project>` 하나. yaml 에 없으면 알려진 슬러그를 안내하고 멈춘다.
2. `--encrypt` 플래그 여부를 기억(있으면 4단계 수행, 단일 프로젝트에만).

## 1. 인제스트 + 비밀 게이트 + distill  (chat-archivist 스킬)
`chat-archivist` 스킬을 따른다:
1. `[tier: bulk]` `node .claude/skills/chat-archivist/ingest.mjs <project|all|auto>` 실행
   → 채팅 복사 + 비밀 **자동 마스킹** + `chats/INDEX.md`·`SECRETS.md` + `README.md` + `archive/INDEX.md`.
   마지막 stdout JSON 에 프로젝트별 `secrets`(잔여)·`newSinceDistill`·`autoPush` 와 `unregistered` 목록이 담긴다.
2. `[tier: judgment]` 각 `chats/SECRETS.md` 판정 확인. 잔여 비밀이 있으면 진짜인지 보고 사용자에게 알린다.
   엔진 출력의 **미등록 폴더**가 있으면 "이 프로젝트도 추가할까요?"라고 안내(yaml 에 3줄 등록).
3. `[tier: judgment]` `newSinceDistill > 0` 인 프로젝트만 — `E:\<project>` 문서(읽기 전용) + 세션 주제로
   `knowledge.md`/`ideas.md` 를 갱신한다(이 단계는 유료라 새 세션이 있을 때만). 민감 프로젝트는 실명·내부주소·키를 일반화.

## 2. (선택) 암호화  — `--encrypt` 일 때만  `[tier: bulk]`
스킬 4)대로 `chats/raw/` 를 `tar + gpg(AES256)` → `chats/raw.tar.gpg` 로 잠그고 평문 raw 를 제거한다.

## 3. 요약 출력 후 정지
무엇을 모았는지(세션 수·용량·비밀 판정), `archive/<project>/` 경로, 다음 행동(검토/암호화)을 출력한다.

> **푸시하지 않는다.** 원격 푸시는 사용자가 명시 지시할 때만(CLAUDE.md). 비밀 게이트 통과 전엔 푸시를 권하지 않는다.
> 원본 repo(`E:\...`)에는 아무 파일도 만들지 않는다.

## 주기적 자동 새로고침 (선택)
무료(로컬 node+git)로 개인 프로젝트만 자동 최신화하려면 Windows 예약작업을 쓴다:
- 등록: `schedule-setup.ps1` (기본 매주 일 21:00) → `refresh.ps1` 이 `ingest auto` + 커밋 + 푸시.
- `refresh.ps1` 은 **개인 프로젝트(`auto_push: true`)만** 다루고, 잔여 비밀이 있으면 **푸시를 중단**한다.
  회사 데이터(`auto_push: false`)는 자동 푸시에서 제외 — 항상 수동 `/archive <p>` + 검토 후에만.
- 지식 distill 은 자동화하지 않는다(유료). `refresh.ps1` 은 "재distill 권장" 만 로그에 남긴다.

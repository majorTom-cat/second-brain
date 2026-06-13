---
description: (전역) 과거 프로젝트 채팅·지식을 second-brain(E:/second-brain)으로 집대성. 어느 프로젝트에서든 실행 가능. 데이터는 항상 second-brain 에 모임.
argument-hint: "<project|all|auto> [--encrypt]"
---

# /archive — 과거 프로젝트 아카이브 (전역판)

이 명령은 **어느 프로젝트에서 실행하든** 데이터를 항상 `E:/second-brain` 의 `archive/` 로 모은다.
엔진은 자기 위치 기준으로 second-brain 을 찾으므로 현재 작업폴더(cwd)는 무관하다.
(이 파일의 원본·백업: `E:/second-brain/.claude/skills/chat-archivist/archive.global.md`)

입력:
> $ARGUMENTS   (예: `all`, `llm-wiki`, `agora --encrypt`)

## 0. 준비
- 첫 토큰: `all`(전체) · `auto`(개인=auto_push:true만) · `<project>`(하나). `--encrypt` 플래그 기억.
- second-brain 루트 = `E:/second-brain` (이하 절대경로 사용).

## 1. 기계 인제스트  `[tier: bulk]`
다음을 실행(Bash 또는 PowerShell, cwd 무관):
```
node E:/second-brain/.claude/skills/chat-archivist/ingest.mjs <project|all|auto>
```
→ 채팅 복사 + 비밀 **자동 마스킹** + `chats/INDEX.md`·`SECRETS.md` + `README.md` + `archive/INDEX.md`.
마지막 stdout JSON 에 `projects[].{secrets,newSinceDistill,autoPush}` 와 `unregistered`(미등록 폴더) 가 담긴다.

## 2. 비밀 게이트 + 미등록 안내  `[tier: judgment]`
- 각 `E:/second-brain/archive/<p>/chats/SECRETS.md` 판정 확인. 잔여 비밀이 있으면 진짜인지 보고 알린다.
- JSON 의 `unregistered` 가 있으면 "이 프로젝트도 추가할까요?" 안내 → `E:/second-brain/rails/archive-sources.yaml`
  에 3줄(이름·repo·sessions·sensitivity·auto_push) 등록.

## 3. 지식 distill  `[tier: judgment]`  — `newSinceDistill > 0` 인 프로젝트만
원본 repo(`E:/<project>`, 읽기 전용) 문서 + `archive/<p>/chats/INDEX.md` 주제로
`E:/second-brain/archive/<p>/knowledge.md`·`ideas.md` 를 실제 내용으로 갱신한다.
- `sensitivity: company-internal` 이면 **실명·내부주소·키를 일반화**(읽는 레이어는 정제, raw 는 마스킹).
- 상세 절차: `E:/second-brain/.claude/skills/chat-archivist/SKILL.md`.

## 4. (선택) 암호화  — `--encrypt` (단일 프로젝트)  `[tier: bulk]`
```
bash E:/second-brain/.claude/skills/chat-archivist/encrypt.sh <project>
```
gpg 가 암호를 물어봄(비밀번호 관리자에 보관). `chats/raw.tar.gpg` 생성.

## 5. 요약 후 정지 — 푸시는 명시 지시 시에만
무엇을 모았는지(세션·용량·비밀·새 세션 수)와 경로를 출력하고 멈춘다.
**자동으로 커밋·푸시하지 않는다.** 사용자가 원하면 second-brain repo 에 대해:
```
git -C E:/second-brain add archive
git -C E:/second-brain commit -m "archive: 수동 새로고침"
git -C E:/second-brain push origin main
```
회사 데이터 평문 raw 는 `chats/.gitignore` 로 이미 제외됨. **원본 repo(`E:/...`)에는 아무 파일도 만들지 않는다.**
주기적 무인 갱신은 `schedule-setup.ps1`(예약작업) 참고.

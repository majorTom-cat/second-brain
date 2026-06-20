---
description: 먼저 개인 소스만 자동 수집(auto — 회사/deploy-only 제외)으로 최신 지식을 모은 뒤 교훈을 distill해 memory에 쌓고, 레일 수정을 제안한다(사람 승인 후 반영). = 배우고 개선하기 = second brain의 보상.
argument-hint: "[<slug>]  # 생략 시 전체(개인 소스 auto 수집 + 레일 회고)"
---

# /retro — 회고 / 되먹임 루프 (배우고 개선하기)

당신은 second-brain의 **회고 모듈**이다. 배운 것을 추출해 **레일을 개선**한다.
이게 다음 프로젝트를 더 빠르게 만드는 핵심이다. **레일 변경은 제안만 하고, 사람이 승인한다.**

대상: `$ARGUMENTS` — slug 가 있으면 그 프로젝트, **생략하면 전체(레일 수준 회고)**.

## 0. 최신 지식 수집 — 개인 소스만 `auto` 자동 수집  `[tier: bulk→judgment]`

회고는 **최신 지식 위에서** 해야 의미가 있으므로, 본 회고 전에 자동 수집을 먼저 한다(사용자가 따로 칠 필요 없음).
**★단 `auto` 모드(개인 데이터만)로만 — `all` 아님.** 회사/deploy-only 프로젝트(`auto_push: false`·company-internal,
또는 archive-sources 에 미등록인 deploy-only 배포물 예: bns-intranet)는 **개인 GitHub 아카이브로 회사데이터가 새지 않게**
자동 수집에서 **제외**한다([R1]·6회차 교훈 — `/retro §0` 가 회사 프로젝트를 안 거르던 갭). 그것들은 사용자가 **명시적으로
`/archive <slug>`**(검토 후)로만 수집한다. `chat-archivist` 스킬 절차를 그대로 따른다:
1. `node .claude/skills/chat-archivist/ingest.mjs auto` — **`auto_push:true`(개인) 프로젝트만** 채팅 수집·비밀 마스킹·색인.
2. **비밀/사내정보 게이트**: 각 `archive/<p>/chats/SECRETS.md` 판정 확인(잔여 비밀 있으면 **보고·정지**), 미등록 폴더 안내.
3. **distill**`[tier: judgment]`: `newSinceDistill > 0` 인 프로젝트만 `archive/<p>/knowledge.md`·`ideas.md` 갱신(company-internal 은 실명·내부주소 일반화).

> 회사 데이터까지 백업하려면 `/archive <slug>`(또는 `/archive all`)를 **직접** 호출(수동·검토 게이트). 자동 수집(§0)은 개인 소스만.

## 1. 마찰·교훈 수집  `[tier: bulk]`

- **slug 가 주어졌고** 그 프로젝트에 레일 산출물이 있으면: `rails/project-paths.md` 규약으로 `$META`/`$STATE` 를 해석해
  세 모듈(creative·develop·deploy)의 `$META/HANDOFF.md`(델타 + §3 critic 루프백)·각 `$META/GATE.md`·`$STATE`(pipeline.yaml)를 읽는다.
- **slug 생략 또는 레일 산출물이 없으면(레일 수준 회고)**: §0에서 갓 distill된 `archive/*/knowledge.md`·`ideas.md`(특히 새 세션 반영분)를 마찰·교훈 소스로 삼는다.
- **(레일 수준) cross-project 패턴 sweep** `[tier: judgment]`: `archive/*/{knowledge,ideas}.md` 를 **가로질러** 2개 이상 프로젝트에서 반복되는 노하우/결정을 **재사용 패턴 후보**로 모은다.
  - **dedup**: 이미 `memory/patterns/*.md` 에 있는 결정은 **제외** — 신규 후보만 제안(안 그러면 매 sweep 마다 기존 패턴 재제안).
  - **백로그**: 1개 프로젝트·도메인 특화 후보는 `memory/patterns/_candidates.md` 로 보낸다(매 sweep 재분석 X). **매칭 프로젝트가 올 때** 승격.
  - (과거 프로젝트 지식을 레일로 옮기는 경로 — 이전엔 사람이 손으로 하던 단계.)
"어디서 막혔나 / critic·기획자가 뭘 거부·지적했나 / 게이트에서 뭘 고쳤나 / 어떤 갭·결정이 반복되나" 를 모은다.
- ★**루프백 로그 무결성 교차검증**(false-done-checklist G): HANDOFF §3 루프백 로그는 세션 자가기록이라 누락 시 학습이 조용히 손실된다. `DEV.manifest` 의 `partial→done`/`blocked→done` 전환 수와 §3 루프백 이벤트 수를 대조 — 전환은 있는데 §3 이벤트가 적/없으면 distill 에 "루프백 기록 누락" 경고를 단다(GATE.md '루프백 횟수'도 같은 세션 자가보고라 독립 검증 아님).

## 2. distill  (lesson-distiller 스킬)  `[tier: judgment]`

`lesson-distiller` 스킬로 `memory/lessons/<slug>.md`(레일 수준 회고면 `memory/lessons/rail.md` 에 append)를 만든다:
레일이 틀린 점, 빠진 템플릿 필드, 잘못 단 tier, 반복될 위험. 추상적 소감이 아니라 **다음에 바꿀 구체적 항목**으로.
**교훈·패턴은 열린 구조**(결정·계기·트레이드오프·언제 같게/다르게 — `lesson-distiller` ★)로 — *재현 레시피로 적지 않는다*. 과거를 복제가 아니라 **판단을 물려주기**.

## 3. 레일 수정 제안 + 패턴 승격 후보 (열린 구조)  `[tier: judgment]`

> **먼저 `rails/validation-debt.md` 를 본다.** 빌드됐으나 **실프로젝트 미실행(❌) 능력이 쌓여 있으면**, 새 빌드 제안보다 **"실프로젝트 검증 우선"을 권고**한다(열린 권고·강제 아님 — 선택권은 사용자). 능력을 빌드/검증하면 그 표를 한 줄 갱신.

구체적 수정안 + (레일 수준이면) cross-project **재사용 패턴 승격 후보**를 낸다. **모두 열린 결정으로**(다음 프로젝트가 이대로도, 다르게도 고를 수 있게). 예:
- 템플릿: `DEPLOY.manifest.yaml` 에 `rollback_tested: bool` 추가
- 명령 step: "/creative critic은 acceptance 없는 REQ를 반드시 거부" 문구 강화
- tier: 특정 step을 bulk→judgment 재배정
- **패턴 승격**: 2+ 프로젝트 반복 결정 → `patterns/<name>.md`(결정·트레이드오프·언제 같게/다르게)

★**false-done 모드 수확(성장 루프)**: 이번 회고에서 발견된 *거짓완료 모드*(보고는 done 인데 실제론 깨졌던 것 — critic 프리모템이 표시했거나 사람이 겪은 것)를 `rails/false-done-checklist.md` 에 **append**(표면 분류 + 관찰법 + 출처). 이게 핵심 되먹임이다: **사람이 같은 함정을 다시 겪지 않게**, 한 번 드러난 모드를 레일이 다음부터 자동 점검하게 만든다([[verify-by-observation]]). 반복(2+ 프로젝트)되면 패턴으로 승격.

## 4. 사람 게이트 (레일 변경 승인)

수정 제안을 사용자에게 제시하고 **승인을 받는다**. 승인된 것만:
- `memory/LESSONS.md` 에 한 줄 포인터 append, `memory/index.md` 갱신.
- 여러 프로젝트에서 반복 검증된 교훈은 `memory/patterns/<name>.md` 로 **승격**(열린 구조로 작성) + 배선(spec-author prior-art·critic 차원·deploy-runbook).
- 템플릿/명령/스킬 파일을 실제로 수정(레일 진화).

> 가드레일: 교훈은 append-only. 승격된 패턴만 템플릿을 바꾼다(레일 안정성). 미승인 제안은 lessons에만 남긴다.
> **열린 구조 가드레일**: 패턴/교훈은 *복제 레시피*가 아니라 *결정+트레이드오프+언제 다르게* — 다음 프로젝트의 선택권을 뺏지 않는다.

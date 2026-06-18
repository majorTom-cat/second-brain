---
name: spec-author
description: 창작 모듈 내부 절차. 두 입구 — (발산) 아이디어 한 줄을 N개 방향으로 발산·심사·병합하거나, (수렴/ingest) 기존 기획·변경 문서를 읽어 같은 산출물(번호 설계 문서 + REQ-ID 표 + SPEC.manifest)로 정규화한다. /creative 가 사용.
---

# spec-author — 발산 또는 수렴 → 합성

스펙을 합성하는 두 입구. **발산**: 해법 공간이 넓은 신규 아이디어를 여러 안으로 펼쳐 고른다(llm-wiki docs/01~09 arc 일반화).
**수렴(ingest)**: 시작점이 아이디어가 아니라 **문서**일 때 — 기획 문서가 먼저 온 프로젝트나 기존 프로젝트 변경 — 발산 대신 문서를 읽어 정규화한다.
어느 입구든 산출물은 동일: `01·02·03·08·09` 번호 문서 + `SPEC.manifest.yaml`. 호출자(/creative)가 모드를 지정한다.

## 입력
- **발산 모드**: `00-brief.md` (한 줄 정의·대상·방향·제약·비목표·deploy_profile)
- **수렴 모드(ingest)**: 기존 기획 문서(요구사항·화면기획·프로토타입) 또는 변경 문서 묶음 + (변경이면) 기존 프로젝트의 이전 REQ/스펙. **출처 경로를 인용**한다.

## 절차 (발산 모드)

### 1) 발산 — N=3 안 병렬 제안  `[tier: bulk]`
서로 **다른 축**으로 3개의 아키텍처/접근 방향을 만든다. 예: ①최소기능우선(MVP) ②확장성우선 ③사용자경험우선.
각 안은 {핵심 구조, 스택 제안, 가장 큰 장점 1, 가장 큰 위험 1} 만 짧게.

> 병렬로 돌릴 땐 각 안을 독립 서브에이전트로(워크플로/Agent) 생성하고, 인덱스로 라벨을 구분한다.

### 2) 심사 — 채점·병합  `[tier: judgment]`
목표(01)·제약(00)·리스크(09 후보) 기준으로 3안을 채점한다. 한 안을 고르되, 나머지 안의 **가장 좋은 아이디어를
이식**한다. 선택 근거를 1문단으로 남긴다(03-architecture 의 "근거" 칸에 들어간다).

### 3) 합성 — 번호 문서 + REQ 표  `[tier: bulk 본문 / judgment REQ 프레이밍]`
승자 기준으로 채운다:
- `01-concept-goals.md` : 개념·목표·성공기준·대표 시나리오
- `02-requirements.md` : **REQ-ID 표**. 각 P0/P1 REQ에 `acceptance`(given/when/then) 필수.
  `deploy_profile: intranet` 이면 OPS REQ(health, graceful shutdown) 자동 포함.
- `03-architecture.md` : 스택 결정(근거)·컴포넌트·데이터 스케치·배포 타깃
- `08-roadmap.md` : Phase별 scope + 검증 체크리스트 + 불변원칙
- `09-risks-security.md` : 리스크 표·보안·프라이버시 경계
- `SPEC.manifest.yaml` : 위 내용의 기계가독 사본(번호 문서와 일치)

## 절차 (수렴 모드 / ingest) — 발산 대신 문서에서 합성
호출자가 수렴 모드로 부르면 위 1)발산·2)심사를 **건너뛰고**, 기존 문서를 읽어 같은 산출물로 정규화한다.
**추측 금지** — 문서에 없는 핵심 결정은 발명하지 말고 게이트의 "열린 결정"으로 올린다(필요하면 AskUserQuestion).

### A) greenfield-ingest — 신규지만 기획 문서가 먼저 (예: intra)
입력: 요구사항 문서·화면기획·프로토타입. 출처 경로 인용.
- `01-concept-goals.md`: 문서가 밝힌 목표·대상·성공기준을 정리(새로 발명하지 않음).
- `02-requirements.md`: 문서에서 **REQ-ID 표를 추출**, 각 P0/P1에 `acceptance`(given/when/then).
  **화면 1개 = `REQ-SCR-NNN`**, 각 화면에 `menu_visible`(상위 메뉴 노출 여부 — 흐름내/개발용은 `false`).
- `03-architecture.md`: 스택은 **최종 목표 기준**(러프가 실제 앱으로 자라게). 프로토타입이 쓴 임시 스택에 끌려가지 말 것.
- `08·09`: 문서 범위에서 채우고 없으면 빈칸 + 표시.

### B) change-ingest — 기존 프로젝트에 변경/리디자인 (예: agora CR-001)
입력: 변경 문서 묶음(PRD·프로토타입·수용기준·전달노트) + 기존 프로젝트의 이전 REQ/스펙.
- **설계 거리부터 판정**(`memory/patterns/ingest-convergence.md`): 점진 델타면 인플레이스, **전면 리디자인이면 그린필드 권고**(기존 코드 관성 경고 — agora→intra 사례).
- 변경 문서를 `$DOCS/changes/CR-NNN-*.md` 로 정규화(원본=리소스, 정본·추적=docs).
- **REQ 크로스워크**: 구 REQ-ID ↔ 신 REQ-ID 대응표(조용한 누락 방지).
- **불변식 상속**: 핵심 불변(익명성·단방향 해시 등)을 신 REQ에 반드시 계승 — critic 차원으로 검증.

→ 산출은 발산 모드와 동일(번호 문서 + `SPEC.manifest.yaml`). 이후 critic·게이트도 동일.

## 출력
채워진 `creative/` 문서 묶음 + `SPEC.manifest.yaml`. 이후 호출자(/creative)가 adversarial-review로 검증한다.

## 원칙
- 추측 금지: 핵심 결정이 불명확하면 합성을 멈추고 사용자에게 묻는다.
- acceptance 없는 REQ를 만들지 않는다(critic이 거부할 것).
- 한 줄 정의/비목표를 벗어나지 않는다.

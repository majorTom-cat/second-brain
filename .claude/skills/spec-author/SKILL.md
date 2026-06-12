---
name: spec-author
description: 창작 모듈 내부 절차. 아이디어를 서로 다른 N개 아키텍처 방향으로 발산한 뒤 심사·병합하고, 승자 기준으로 번호 설계 문서와 REQ-ID 표를 합성한다. /creative 가 사용.
---

# spec-author — 발산 → 심사 → 합성

해법 공간이 넓은 설계 단계에서 한 방에 쓰지 않고 **여러 안을 만들어 고른다**. (llm-wiki docs/01~09 arc 일반화)

## 입력
- `00-brief.md` (한 줄 정의·대상·방향·제약·비목표·deploy_profile)

## 절차

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

## 출력
채워진 `creative/` 문서 묶음 + `SPEC.manifest.yaml`. 이후 호출자(/creative)가 adversarial-review로 검증한다.

## 원칙
- 추측 금지: 핵심 결정이 불명확하면 합성을 멈추고 사용자에게 묻는다.
- acceptance 없는 REQ를 만들지 않는다(critic이 거부할 것).
- 한 줄 정의/비목표를 벗어나지 않는다.

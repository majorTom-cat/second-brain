# 패턴 — 수렴(ingest) 모드: 발산이 아니라 문서→스펙

> 승격: 2026-06-16 (`/retro` rail). 2개 프로젝트(intra·agora)에서 반복 확인 → 패턴.
> 근거: [lessons/rail.md](../lessons/rail.md). ⚠️ company-internal 일반화.

## 문제
`/creative` 는 **아이디어 한 문단을 N방향으로 발산**한다고 가정한다. 그러나 실무 프로젝트는
**기획 문서가 먼저** 온다(요구사항·화면기획·프로토타입, 또는 기존 시스템의 변경 요청). 발산할 게 아니라
이미 있는 문서를 **수렴**해 번호 docs + REQ표로 정규화해야 한다.

## 두 변종
- **(a) greenfield-ingest** — 신규지만 기획 문서가 선행. 기획 문서 → 번호 docs + REQ표, **화면 1개 = `REQ-SCR-NNN`**.
  근거: intra(33화면 러프, `docs/screens.md` REQ-SCR 인벤토리). _(`archive/second-brain/knowledge.md` "레일 첫 실사용 — intra")_
- **(b) change-ingest** — 기존 운영 프로젝트에 **델타**가 들어옴. 변경 문서 묶음(PRD·프로토타입·acceptance·dev노트)을
  `<repo>/resource/changes/` → `docs/changes/CR-NNN` 규약으로 받고, **REQ crosswalk(구REQ→신REQ) 표를 강제**,
  핵심 **불변식(익명성·단방향 해시 등)의 상속을 critic 차원으로 검증**한다.
  근거: agora v3.0→v4.1(CR-001), REQ 패밀리 재편 + 불변식 상속. _(`archive/agora/knowledge.md` "개선 라운드 v3.0→v4.1")_

## ★결정의 첫 분기 — 수정(인플레이스) vs 그린필드 (설계 거리)
change-ingest 라고 무조건 "기존 수정"이 아니다. **변경의 설계 거리**를 먼저 잰다:
- **점진 델타**(필드 추가·정책·백엔드·부분 화면) → 인플레이스 수정. 재사용 이득이 큼.
- **전면 리디자인**(새 디자인/프로토타입으로 비주얼·IA가 바뀜) → **그린필드**(또는 셸·IA를 새 디자인에서 처음부터). 이유 = **기존 코드 관성(gravity)**: 익숙한 컴포넌트·레이아웃을 재사용하는 손이 새 디자인보다 **옛 패턴을 자동 재생산**해, 결과가 받은 디자인과 어긋나고 결국 폐기된다. "기존 수정이 빠르다"는 디폴트를 리디자인엔 적용 금지(절감 < 관성 비용).
- **인플레이스를 택했다면 가드**: ① 디자인-퍼스트(새 토큰·레이아웃에서 시작, "기존 컴포넌트 맞추기" 반사 금지), ② 화면별로 **옛 화면이 아니라 받은 디자인과 대조**, ③ 깊이 들어가기 전 "이게 새 디자인처럼 보이나?"를 조기 게이트로.
- **실증(반례)**: agora — 새 디자인+프로토타입을 받고 "기존 수정"을 택해 v3.0 코드에서 진행 → 계속 옛 UI로 회귀 → 폐기 → `intra` 그린필드 재시작. (`archive/agora/knowledge.md` 함정 "기존 코드 관성")

## 레일에 적용할 때 (빌드는 backlog)
- `/creative` 명령 + `spec-author` 스킬에 모드 분기(greenfield-ingest / change-ingest) 추가.
- change-ingest 에는 **변경 인입 게이트**(CR-NNN 등록 → crosswalk 작성 → 불변식 상속 critic 통과) 신설.
- 외부 repo 가 대상이면 [external-project-layout](external-project-layout.md) 의 경로해석에 의존.

## 신호 (이 패턴을 써야 할 때)
"아이디어"가 아니라 **문서가 먼저 있다** / "새로 만들자"가 아니라 **기존 걸 고치자** → 발산 금지, 수렴.

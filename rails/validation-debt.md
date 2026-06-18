# validation-debt.md — 빌드됐으나 실프로젝트 미실행 (검증 부채)

> 레일 능력의 **실제 검증 상태**. `/status` 가 표시, `/retro` 가 "빌드보다 검증 권고" 판단에 쓴다.
> 원칙(열린 권고·강제 아님): **미검증(❌) 능력이 쌓이면 새 빌드보다 실프로젝트 검증을 우선**한다. 선택권은 사용자.
> 갱신: 능력을 빌드/검증할 때 사람이 한 줄 고친다. (2026-06-18 기준)

| 능력 | 상태 | 검증 |
| --- | --- | --- |
| 게이트 모델(creative→develop→deploy) | ✅ 검증 | todo-toy 1바퀴 |
| REQ-ID 척추 + acceptance→테스트→smoke | ✅ 검증 | todo-toy |
| P2-b **full 모드** | ✅ 검증 | todo-toy |
| 진입점 기동 smoke (T1) | ✅ 검증 | todo-toy(실버그 잡음) |
| deploy **local** 프로파일 | ✅ 검증 | todo-toy(실 Docker) |
| R4a 비용 라우팅(bulk→서브에이전트) | ✅ 검증 | todo-toy + 패턴 작성 |
| `/archive`·`/retro` 체이닝 | ✅ 검증 | 반복 사용 |
| cross-project sweep | 🟡 1회 실행 | 3회차 회고(실프로젝트 소비 아님) |
| P1 **external** 타깃(projects.yaml) | ❌ 미실행 | toy는 internal만 |
| P2-a **수렴/ingest** 모드(greenfield+change) | ❌ 미실행 | intra 대기 |
| P2-b **rough 모드** | ❌ 미실행 | — |
| P3 핸드백 템플릿·menu_visible | ❌ 미실행 | — |
| deploy **intranet** 프로파일(k8s) | ❌ 미실행 | intra 대기 |
| 패턴 라이브러리(10개) | ❌ 미소비 | 아직 어떤 프로젝트도 안 씀 |
| R4b(로컬 $0) | ⛔ 미빌드 | 옵션 |

## 현재 요약
- **❌ 미실행 6 + ⛔ 미빌드 1.** 능력은 폭증했는데 **실프로젝트 검증은 toy 1개(diverge→full→local)뿐.**
- **첫 실검증 대상 = intra**(디자이너 화면 디자인 파일 대기). 도착 시 `/creative ingest intra` → 한 바퀴로 external·ingest·rough·intranet·패턴이 **한꺼번에** 시험된다.
- ⇒ 권고: 디자인 파일 오기 전엔 **새 레일 능력 추가를 자제**하고, 오면 **검증을 최우선**.

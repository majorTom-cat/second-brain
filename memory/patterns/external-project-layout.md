# 패턴 — 산출물을 어디에 둘까: 레일 repo 안 vs 외부 프로젝트 repo

> 승격: 2026-06-18 (`/retro`). 근거: `archive/second-brain/knowledge.md`(intra 실사용), `memory/lessons/rail.md`(P1). ⚠️ company-internal 일반화.

## 결정 (fork) — 무슨 갈림길인가
레일 명령(`/creative`·`/develop`·`/deploy`)의 **산출물을 어디에 쓸까**:
- **internal** — 레일 repo 안 `projects/<slug>/{creative,develop,deploy}/` + `.state/`.
- **external** — 프로젝트 **자체 repo** `<root>` 에: 설계문서 `<root>/docs/` + 코드 `<root>/` + 레일 메타 `<root>/.rail/`.

## 계기·증거 — 어느 프로젝트에서 무엇이 실패·통했나
- intra·agora·llm-wiki 는 **자체 repo·CI·배포**를 가진 외부 프로젝트인데, 레일이 경로를 `projects/<slug>/` 로 **하드코딩**해서 못 다뤘다 → 레지스트리(`rails/projects.yaml`) + 경로해석 규약(`rails/project-paths.md`)으로 품(P1).
- `todo-toy`(검증 토이)는 **internal** 로 돌려, 미등록 slug=기존 동작(하위호환)도 확인됨.

## 선택지와 트레이드오프
| | internal (`projects/<slug>/`) | external (`<root>` repo) |
|---|---|---|
| 단순함 | 높음 — 레일 안에 다 모임, 등록 불필요 | 낮음 — `projects.yaml` 등록 + 경로해석 + `.rail/` 메타 |
| 산출 위치 | 레일 repo 안에 갇힘 | 실제 프로젝트 repo에 직접 산출 |
| 자체 CI/배포 연계 | 약함 | 강함 — 그 repo의 파이프라인과 맞물림 |
| git 이력 | 레일 repo에 섞임 | 프로젝트 repo에 깔끔 분리 |

## 언제 이대로 · 언제 다르게
- **internal** 할 신호: 레일이 처음부터 만드는 **신규·작은·throwaway** 프로젝트(예: toy 검증). 미등록 slug = 자동 internal(하위호환).
- **external** 할 신호: 이미 **자체 repo/CI/배포**가 있거나 산출물을 별도 위치(사내 배포 등)에 둬야 하는 프로젝트(intra·agora 계열).
- 규율: external repo 에는 레일 메타를 **`<root>/.rail/` 에만** 두고(코드와 안 섞임), 읽기전용 prior-art repo 엔 아무것도 쓰지 않는다.

## 레일 적용 (빌드됨)
- `rails/projects.yaml`(slug→root·layout·deploy_profile) + `rails/project-paths.md`(경로해석). 5개 명령이 이를 통해 `$DOCS/$META/$STATE/$CODE` 해석.

관련: [[ingest-convergence]]

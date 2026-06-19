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
| P2-a **수렴/ingest** 모드(greenfield) | ✅ 검증 | intra-toy(실 intra docs→REQ-SCR 스펙) 2026-06-18 |
| P2-b **rough 모드** | ✅ 검증 | intra-toy(셸+아키타입 스캐폴드·HANDBACK) |
| P3 핸드백 템플릿·menu_visible | ✅ 검증 | intra-toy(GNB 4+admin, 33 전체 아님) |
| 패턴 라이브러리 소비 | ✅ 검증 | intra-toy(design-ready-skin·constraints-as-truth 코드 반영) |
| P1 **external** 타깃(projects.yaml) | ❌ 미실행 | intra-toy는 internal — external 경로 미검증 |
| P2-a **change-ingest**(변경 인입) | ❌ 미실행 | 변경 문서 오는 프로젝트 필요 |
| deploy **intranet** 프로파일(k8s) — 레일 `/deploy` 명령 | ❌ 미실행 | bns-intranet은 레일 파이프라인 아닌 **수동 deploy-only**였음 |
| `intranet-deploy` **패턴**(지식) | ✅ 실검증·정정 | **bns-intranet 실배포(2026-06-19)** — 함정6·스키마전략3 발견→패턴 보강 |
| R4b(로컬 $0) | ⛔ 미빌드 | 옵션 |

## 현재 요약 (2026-06-18 — intra-toy 검증 후)
- **✅ 새로 검증 4**(수렴/ingest·rough·핸드백/menu_visible·패턴 소비) — **intra-toy 스탠드인**으로(실 `E:\intra` 읽기전용 입력, 미푸시, 검증 후 삭제 예정).
- **남은 ❌ 3 + ⛔ 1**: P1 external 경로 · change-ingest · intranet 배포(full 필요) · R4b.
- 남은 것의 첫 실검증 대상 = **실 intra**(디자인 파일 후 `full`+intranet). external·change-ingest는 그때 또는 별도 toy로.
- ⇒ 권고: 큰 ❌(ingest·rough·패턴)는 해소됨. 새 빌드보다 남은 검증/실 intra 우선.

## 추가 (2026-06-19 — bns-intranet 실배포 후)
- **`intranet-deploy` 패턴(지식)은 실배포로 검증·정정됨**(deploy-only): 클러스터 함정 6 + 스키마 전략 3(자동 포함) 발견→패턴 보강.
- 단 **레일 `/deploy intranet` *명령/skill* 은 여전히 미실행**(bns는 수동) — 명령 검증은 실 intra(full)가 와야.
- 새 제안 [R1](§0 deploy-only 제외)·[R2](runbook intranet 체크리스트)는 **미빌드**(rail.md 6회차) — 승인 대기.

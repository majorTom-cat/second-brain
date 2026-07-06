<!-- 게이트 — 사람이 읽고 승인/반복을 결정하는 5분 검수 지점. -->

# GATE — chaebo / creative

## ✅ 무엇이 만들어졌나 (요약)

- **REQ 28개** (P0 10 · P1 12 · P2 6) + 스파이크 3개(SP-1 CPU 실측 게이트 포함)
- 스택 결정: Python/FastAPI + SQLite + ZFTurbo MSST(BS/Mel-RoFormer) + 스템당 `<audio>`(SyncPlayer 교체 가능)
- 로드맵 4단계: Phase 0 스파이크 → 1 MVP(넣으면 연습된다) → 2 연습 심화 → 3 선택(데스크톱 포장 등)
- 화면 4개(라이브러리·곡 추가·연습·설정), deploy_profile=local
- 산출물: `00-brief` `01-concept-goals` `02-requirements` `03-architecture` `08-roadmap` `09-risks-security` `SPEC.manifest.yaml`

## 📋 REQ별 done 근거 — (a)/(b)/(c) 분리

> **스펙 단계** — (a)=acceptance 가 작성되고 falsifiable 한가, (b)=critic 통과, (c)=구현이 없으므로 전부 N/A(관찰 smoke 는 /develop·/deploy 의 몫).

| REQ 그룹 | (a) acceptance | (b) critic(루프백) | (c) 관찰 smoke | done?(스펙 기준) |
|---|---|---|---|---|
| ING-001·002 / SEP-002 / PLAY-001·002·003 / LIB-001 / OPS-001·002 (P0 9) | pass — 전부 given/when/then·관찰 가능 | pass | N/A(스펙 단계) | ✅ |
| REQ-SEP-001 (P0) | pass — 단 guitar 스템은 SP-1 가용성 실측 조건부 | **루프백 1회**(④ 체크포인트 가용성 의존 명시) | N/A | ✅(조건 명시) |
| REQ-ING-003 | pass | **루프백 1회**(③ 한도·다운로드 불가 사유 강화) | N/A | ✅ |
| REQ-OPS-005 | pass | **critic 이 신설**(② G4 무배선 발견) | N/A | ✅ |
| 나머지 P1 9개·P2 6개 | pass | pass | N/A | ✅ |

## ⚠️ 열린 결정 / 사람이 확인할 것

1. **UI 형태 — 로컬 웹앱 시작으로 확정?** 사용자가 "본 건 앱이었다"고 했으나 조사·비용 근거로 웹앱 시작
   + Phase 3 pywebview 포장 경로를 채택함. 이 로드맵이 괜찮은지. (지금 앱부터 원하면 /creative 반복)
2. **CPU 분리 대기시간 수용** — 주 PC(무GPU)에서 곡당 수 분~수십 분(SP-1 실측 전 미확정). 이 대기를
   라이브러리 재사용으로 상쇄하는 설계인데, 수용 가능한지.
3. **guitar 스템 조건부** — 5스템 체크포인트가 없으면 4스템(guitar→other)으로 조정됨(REQ-SEP-001).
4. **곡 길이 한도 기본 20분** — 라이브 영상 통째 연습이 필요하면 한도 상향 필요(설정 가능이긴 함).
- [ ] **열린 결정 검토 완료** (사람이 체크 — 미체크 approved 면 다음 §0 이 가시화)

## 🔁 critic 결과 (의역 금지 — 그대로 전사)

adversarial-review(8차원 + false-done 체크리스트 + 생성형 프리모템): **blocker 0 · warn 5 → 전부 루프백 수정 완료**

| 차원 | 심각도 | 위치 | 발견 → 고친 방법 |
|---|---|---|---|
| 1 정확성 | warn | 02 하단 | 우선순위 카운트 오기(9/10/7) → 실측 10/12/6 으로 정정 |
| 2 추적성 | warn | 01 G4↔02 | G4(터미널 비노출) 달성 REQ 부재 → REQ-OPS-005(더블클릭 실행) 신설 |
| 프리모템 | warn | REQ-ING-003 | 유효-but-다운로드불가(연령제한)·크기/길이 무한도(긴 영상=CPU 수시간+디스크 폭발) → acceptance 에 200MB/20분 한도·사유 표시 추가 |
| 프리모템 | warn | REQ-SEP-001 | 5스템 고정이 guitar 체크포인트 가용성 미확인에 의존 → SP-1 확인 항목 추가+4스템 조정 여지 명시 |
| 1 일관성 | warn | 09↔02 | 09 "크기 검증(ING-003)" 언급 vs ING-003 에 크기 없음 → 위 ③ 수정으로 해소 |

- 시크릿/내부호스트 스캔(체크리스트 G-스펙누수): **누수 0**.
- HANDOFF §3 과 일치 확인.

## ▶ 다음 행동

1. `projects/chaebo/creative/` 산출물 검토 — 특히 위 ⚠️ 열린 결정 4개.
2. 만족하면 → `projects/chaebo/.state/pipeline.yaml` 의 `gate:` 를 `approved` 로 바꾼다(+`approved_by`/`approved_at`).
   **승인은 사람의 몫** — 산출 세션 자가승인 금지.
3. 고치려면 → `/creative chaebo ...` 재실행(반복 모드 — 지적 부분만 보강).

> `/develop chaebo` 는 이 게이트가 `approved` 가 아니면 하드 거부된다. 승인 후에도 **Phase 0 스파이크(SP-1) 통과가 개발 착수 조건**.

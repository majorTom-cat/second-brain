<!-- 창작 모듈 HANDOFF — 대화 맥락 0으로 재개 가능하게. -->

# HANDOFF — chaebo / creative

## 0. 최신 상태 (델타 로그 — 최신이 위)

- [2026-07-06] /creative 발산 모드 1회 완주: 조사 인제스트 → 브리프 → 3안 발산(Sonnet 병렬) → 심사·병합
  → 번호문서 5종+manifest → critic(blocker 0·warn 5) → 루프백 수정 → 게이트 pending.
  REQ 28개(P0 10·P1 12·P2 6), Phase 0(스파이크 3)~3.

## 1. 이 모듈의 입력

- 입력 아티팩트: `projects/chaebo/inputs/research-market-tech.md`
  (deep-research 103 에이전트·3표 검증 + 보완 검색 — 시장 A축은 직접 검색으로 보강, 미검증 4건 명시)
- 프레이밍 답변(사용자, 2026-07-06): 용도=악기 연습(주력 베이스, 전 악기 지원 희망) ·
  라이브러리 관리=포함 · UI=로컬 웹앱 추천 수용(단 "본 건 앱이었다" — 열린 결정) ·
  GPU=혼재(주 PC Intel Iris Xe 실측 무GPU, GPU PC 별도 존재).
- 게이트 상태: pending

## 2. 확정된 결정 (이 모듈에서 잠긴 것)

| 결정 | 근거 | 비고 |
| --- | --- | --- |
| 이름 = chaebo (채보) | 충돌 검사(동명 음악 도구 없음·madi=MADI 표준 충돌로 강등·garak=NVIDIA 스캐너 충돌로 탈락) | 사용자 확정 |
| 분리 = ZFTurbo MSST(MIT) + BS/Mel-RoFormer | 조사 3표 검증 SOTA. Demucs 금지(2025-01 아카이브) | 03·invariants |
| 스택 = Python/FastAPI + SQLite + Jinja2/바닐라JS | 언어 수 1(torch 가 이미 py) — C안 심사 논리 | 03 |
| 재생 = 스템당 `<audio>`+`preservesPitch`, SyncPlayer 교체 가능 인터페이스 | A안 채택 + B안 승격 대비(엔진 교체 국소화) | 03 핵심 결정 1 |
| 로드맵 = Phase 0 스파이크(SP-1~3) → 1 MVP(P0) → 2 심화(P1) → 3 선택(P2+데스크톱 포장) | 3안이 "A 먼저"로 수렴 | 08 |
| 개발 착수 조건 = SP-1(CPU 실측) 통과 | 전 프로젝트 최대 리스크(3안 공통 지목) | 08 Phase 0 gate |

## 3. critic 루프백 이벤트 (회고용 — /retro 가 읽음)

- [2026-07-06] critic(adversarial-review, 8차원+false-done+프리모템) blocker 0·warn 5 → 즉시 루프백 수정:
  ① 02 우선순위 카운트 오기(9/10/7→10/12/6) 정정
  ② G4(터미널 비노출) 무배선 발견 → REQ-OPS-005(run.bat 더블클릭 실행) 신설
  ③ ING-003 프리모템 강화 — 다운로드 불가(연령제한)·크기/길이 한도(200MB/20분) 추가
    (긴 영상→CPU 수 시간+디스크 폭발 모드)
  ④ SEP-001 5스템 고정이 체크포인트 가용성 미확인 의존 → SP-1 에 guitar 스템 가용 확인 추가+4스템 조정 여지 명시
  ⑤ 09↔02 크기 검증 불일치 → ③에서 해소
- 시크릿/내부호스트 스캔(체크리스트 G): 누수 0.

## 4. 미해결/다음 모듈에 넘기는 주의

- **개발은 SP-1 통과 전 시작 금지**(08 Phase 0). SP-1 실패 시 게이트 복귀(경량 모델 대체 판단).
- 조사 미검증 4건이 09 리스크로 승계됨: yt-dlp 법적 범위(개인 한정으로 구조 완화)·RoFormer CPU 실측·
  체크포인트 라이선스(SP-2)·Moises 유튜브 임포트 여부(참고용).
- 열린 결정(게이트 검토 대상): ①UI=웹앱 vs 앱(사용자 앱 선호 이력 — Phase 3 pywebview 로 수렴 가능)
  ②스템 저장 포맷 wav(곡당 ~200MB+) vs 압축(flac/opus) — /develop 에서 결정, 디스크 사용량 영향.
- 3안 발산 원문은 이 세션 트랜스크립트에만 있음(요약은 01 심사 기록) — 필요 시 재발산이 더 쌈.

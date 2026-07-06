<!-- 아키텍처·스택 — 2026-07-06 3안 병합(A 척추 + B/C 승격 경로). [tier: judgment] -->

# 03 — 아키텍처: chaebo (채보)

## 스택 결정 (근거 포함)

| 영역 | 선택 | 근거 |
| --- | --- | --- |
| 언어/런타임 | Python 3.11+ | 분리 엔진(torch)이 이미 파이썬 — 언어 수 1로 통일(C안 심사 확정 논리) |
| 웹 프레임워크 | FastAPI + Uvicorn | REST + SSE(진행률). 로컬 단일 사용자 |
| 분리 엔진 | **ZFTurbo MSST**(MIT) + BS/Mel-RoFormer 체크포인트 | 조사 3표 검증 SOTA. **Demucs 채택 금지**(2025-01 아카이브 죽은 라인 — CPU 속도 참고치로만) |
| 수집 | yt-dlp + ffmpeg | 개인 연습·비공유 한정(09-risks) |
| 데이터 | SQLite + 파일시스템 | 곡 메타·잡 상태만 DB, 오디오 실체는 디스크 |
| 큐/워커 | asyncio + ProcessPoolExecutor(단일 워커) | Redis/Celery 는 1인 로컬에 과설계 |
| 프런트엔드 | Jinja2 + 바닐라 JS(번들러 없음) | 화면 4개 — SPA 는 과설계(A안). Phase 2 파형 등도 canvas 직접 렌더로 수용 가능 |
| 재생 | 스템당 `HTMLMediaElement`(`<audio>`) + `preservesPitch` | 피치유지 배속이 브라우저 네이티브 공짜(조사 검증). **컨트롤러는 교체 가능 모듈**(후일 B 승격 대비) |
| 코드 감지(P2) | madmom DeepChroma+CRF | 장·단조 한정 고지. autochord 는 Windows 미지원으로 배제 |
| 인증 | none | 개인용 로컬(127.0.0.1 바인딩이 경계 — REQ-SEC-001) |

## 컴포넌트 구성

```
[브라우저 (Chrome/Edge 한정)]
  ├─ 라이브러리/추가/연습/설정 화면 (Jinja2 + 바닐라 JS)
  └─ SyncPlayer 모듈 (교체 가능 재생 컨트롤러)
       스템당 <audio> × N · preservesPitch 배속 · 솔로/뮤트=volume
       동기: 마스터(drums) 기준 250ms 폴링, 편차>20ms 시 하드 스냅
        │ HTTP/SSE (127.0.0.1 전용)
[FastAPI 서버]
  ├─ /api/songs (라이브러리 CRUD) ──────────── SQLite (songs·jobs·practice_state)
  ├─ /api/ingest (URL/파일 접수 → job 생성)
  ├─ /api/jobs/{id}/events (SSE 진행률)
  ├─ /api/health · SIGTERM graceful · HOST/PORT 설정 가능
  └─ 정적 스템 서빙 (data/stems/<song>/*.wav)
        │ enqueue
[Job Worker (ProcessPoolExecutor, 1 프로세스)]
  ├─ Ingest: yt-dlp/ffmpeg → data/raw/
  ├─ Separate: MSST 어댑터 — torch.cuda 감지 → GPU/CPU → 스템 5개 + peak JSON
  └─ (P2) Chord: madmom → chords.json
```

## 데이터 모델 스케치

- `songs`: id·title·source(url|file)·status(downloading|separating|ready|error)·duration·created_at
- `stems`: song_id·name(vocals|drums|bass|guitar|other)·path·model_used
- `jobs`: id·song_id·kind(ingest|separate|chord)·progress(0-100)·stage·error·started/finished
- `practice_state`(P1): song_id·last_position·loop_a/b·stem_volumes(JSON)·speed

## 핵심 설계 결정

1. **재생 컨트롤러 = 교체 가능 모듈(SyncPlayer 인터페이스)**: `load(stems)/play/pause/seek(t)/setRate(r)/setStemVolume`.
   Phase 1 구현 = `<audio>` 기반. 실사용에서 동기 드리프트가 체감되면 구현체만 Web Audio(B안)로 교체 —
   화면·API 는 불변. (B안의 "중간 다운그레이드 어려움" 리스크를 인터페이스 분리로 상쇄)
2. **동기 허용선**: 연습 도구 기준 스템 간 편차 임계 20ms, 보정 주기 250ms, 배속 변경·seek 직후 즉시 보정 1회.
   acceptance 는 "조작 반복 후 편차 50ms 이내"(REQ-PLAY-003)로 측정 가능하게.
3. **분리는 잡, UI 는 즉시**: 모든 무거운 작업은 job 테이블 + 워커로. UI 는 SSE 진행률만 구독.
4. **peak JSON 사전 계산**(B안 승격): 분리 완료 시 스템별 min/max 파형 데이터를 사이드카로 저장 —
   Phase 2 파형 표시가 클라 디코드 없이 즉시 렌더.
5. **타깃 브라우저 1종(Chromium 계열)**: 개인 도구 — `preservesPitch` 구현 편차 변수 제거.

## 배포 타깃

- **profile**: `local`. Phase 1 = `python run.py`(venv) + 브라우저. Docker 는 선택(torch 이미지가 무거워
  로컬 venv 우선, `docker-compose` 는 배포 단계에서 판단).
- 필수(레일 규율): `/api/health` · SIGTERM graceful shutdown · HOST/PORT 환경변수(기본 127.0.0.1).
- Phase 3(선택): pywebview 셸 + PyInstaller(런처만 동결, torch 는 첫 실행 다운로드) — C안 설계 보존.

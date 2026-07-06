# chaebo(채보) — 사전 조사 보고서 (시장·기술)

> 2026-07-06, deep-research 워크플로우(103 에이전트, 주장별 3표 적대적 검증) + 보완 직접 검색.
> 이 파일은 `/creative`(spec-author)의 prior-art 입력이다. 검증 통과 사실과 미검증 항목을 구분해 적음.

## 프로젝트 한 줄

유튜브 링크 또는 음악 파일을 넣으면 악기별 스템 분리(베이스·드럼·건반·보컬·기타), 특정 악기
솔로/뮤트, 피치 유지 배속, (가능하면) 코드 감지로 **악기 카피(귀 채보) 연습**을 돕는 개인용 도구.

- 이름: **chaebo** (채보 — 귀로 곡을 따는 실제 음악 용어. 충돌 검사 완료: 동명 음악 도구 없음)
- 용도 확정: **악기 연습용** (사용자 답변). 공개 서비스 아님, 개인용.

## A. 기존 제품 지형 (직접 검색 — 3표 검증 아님, 방향 판단용)

| 제품 | 가격 | 연습 기능 | 비고 |
|---|---|---|---|
| Moises | 무료(월 2~5곡 수준 제한)/Premium ~$40/yr/Pro ~$95/yr | 배속+피치·코드감지·메트로놈 = 거의 전부 | 건반·기타 스템은 Pro 전용. **연습 도구 시장 1위** |
| LALAL.AI | 크레딧제 $10~100 | 없음(분리만) | 악기 종류 많음(피아노·신스) |
| RipX DAW | $60 일회성 | 없음(편집용) | 학습곡선 가파름 |
| UVR5 | 완전 무료 오픈소스·로컬 | 없음(분리만) | CPU 곡당 5~15분 |
| 연습 특화(분리 없음) | Transcribe!·Capo·Anytune·Amazing Slow Downer·Chordify 등 | 배속·구간반복·코드 | 분리와 결합 안 됨 |

**포지셔닝 결론**: "분리+연습"을 다 갖춘 건 사실상 Moises 하나(유료). chaebo 의 자리 =
**무료·로컬·무제한 + 오픈소스 SOTA 분리 품질**. Moises 복제가 아니라 개인 소유 도구.

## B. 기술 스택 (✅ = 3표 적대적 검증 통과)

- ✅ **분리 SOTA = BS-RoFormer 계열**: MVSep 리더보드 상위 20위 독점, HTDemucs4 대비 vocals ~2.7dB 우위.
- ✅ **채택 프레임워크 = ZFTurbo/Music-Source-Separation-Training**: MIT, 2026-04에도 활발,
  BS/Mel-RoFormer·MDX23C·SCNet 등 사전학습 체크포인트 제공.
- ✅ **Demucs 는 죽은 라인**: facebookresearch/demucs 2025-01-01 아카이브(읽기 전용). 위에 새로 짓지 말 것.
  단 CPU 폴백 참고치로는 유효(htdemucs CPU ≈ 곡 길이의 1.5배).
- ✅ **건반/신스가 최약점**: 최상위 앙상블도 'Other' 스템 SDR 9.0(스템 중 최저). Demucs 6스템 piano 는
  공식 README 가 "심한 블리딩·아티팩트" 인정. → 건반 카피 기대치 조절 또는 전용 피아노 모델 별도 평가.
- ✅ **하드웨어**: Demucs 기준 GPU VRAM ~7GB(세그먼트 축소 시 3GB), CPU 폴백 가능. RoFormer 실측은 미검증(아래).
- ✅ **재생엔진(핵심 발견)**: Web Audio `AudioBufferSourceNode.playbackRate` 는 피치보정 없음(스펙 이슈
  #2487 미해결). 반면 **HTMLMediaElement 는 `preservesPitch` 기본 true** → **스템당 `<audio>` 엘리먼트**
  아키텍처가 피치유지 배속을 공짜로 얻는 최저비용 경로(단 멀티트랙 동기 드리프트는 엔지니어링 필요).
- ✅ **정밀 재생 대안**: Signalsmith Stretch(WASM AudioWorklet, MIT, npm signalsmith-stretch) — 단
  타임스트레치 품질은 0.75~1.5x 최적, 그 밖(0.5x 감속 연습)은 열화. SoundTouchJS 워크릿은 구 repo
  아카이브됨 → 모노레포(@soundtouchjs/audio-worklet, MPL-2.0)를 써야 함.
- ✅ **코드 감지**: madmom DeepChroma+CRF(사전학습 CLI 포함)가 현실 대안. 단 **장·단조 트라이어드 한정**
  (7th·텐션·전위 불가). autochord 는 Windows 미지원+정확도 67%라 부적합. → 코드는 "가능하면" 기능이 적정.

## 미검증 (스펙 단계에서 확정 필요)

1. **yt-dlp 유튜브 추출의 법적 범위**(한국 저작권법 사적복제) — 개인용·비공유 전제로 설계하되 확인.
2. **BS-RoFormer 의 소비자 GPU/CPU 실측 속도·VRAM** — 스파이크로 실측 필요(사용자 PC GPU 유무도 미확인).
3. **커뮤니티 체크포인트 라이선스** — 프레임워크는 MIT 지만 개별 가중치에 비상업 조건 존재 가능. 채택 전 개별 확인.
4. Moises 의 YouTube 직접 임포트 여부 — 공식 확인 안 됨(차별화 포인트 판단에만 영향).

## 주요 출처

- https://mvsep.com/quality_checker/multisong_leaderboard (리더보드 실측)
- https://github.com/ZFTurbo/Music-Source-Separation-Training (MIT 프레임워크)
- https://arxiv.org/abs/2309.02612 (BS-RoFormer 논문, SDX23 1위)
- https://github.com/facebookresearch/demucs (아카이브 확인·CPU/VRAM 수치)
- https://github.com/WebAudio/web-audio-api/issues/2487 (playbackRate 피치보정 부재)
- https://signalsmith-audio.co.uk/code/stretch/web-audio/ (WASM 스트레치)
- https://madmom.readthedocs.io/en/v0.16/modules/features/chords.html (코드 감지)
- https://www.chartlex.com/blog/marketing/ai-stem-separation-tools-2026 (완제품 비교)
- https://moises.ai/ · https://www.lalal.ai/pricing/ · https://github.com/Anjok07/ultimatevocalremovergui

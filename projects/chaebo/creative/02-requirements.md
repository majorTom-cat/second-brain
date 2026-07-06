<!-- 요구사항 — REQ-ID 척추. 2026-07-06 3안 병합. [tier: judgment]
     규율: 모든 P0/P1 REQ 는 given/when/then acceptance 필수(critic 거부 대상). -->

# 02 — 요구사항: chaebo (채보)

## REQ-ID 규약

- 형식: `REQ-{CAT}-{NNN}`. 카테고리: `ING`(수집) `SEP`(분리) `PLAY`(재생/연습) `LIB`(라이브러리)
  `OPS`(운영 — 장기 실행 로컬 서비스라 health·graceful·bind 자동 포함) `SEC`(보안/법적 고지) `CHORD`(코드 감지).
- 시안(design-input)은 없음 — 화면 acceptance 는 컴포넌트 존재+인터랙션 동작으로 검증(죽은 컨트롤 금지).
- NFR 은 REQ-SEP-005(CPU 처리시간)·REQ-PLAY-003(동기 편차)에 관찰 가능 then 으로 포함.

## 요구사항 표

| REQ-ID | 요구 | acceptance (given/when/then) | 우선순위 |
| --- | --- | --- | --- |
| REQ-ING-001 | 유튜브 링크로 곡 추가 | given 서버 실행 when 유효한 YouTube URL 제출 then 오디오가 data/raw 에 저장되고 라이브러리에 새 곡이 status 와 함께 나타난다 | P0 |
| REQ-ING-002 | 로컬 파일로 곡 추가 | given 서버 실행 when mp3/wav/flac/m4a 업로드 then 라이브러리에 새 곡이 나타난다 | P0 |
| REQ-ING-003 | 잘못된/한도 초과 입력 거부 | given 서버 실행 when ①무효 URL·미지원 확장자 ②크기/길이 한도 초과(기본 파일 200MB·길이 20분, 설정 가능) ③유효하나 다운로드 불가 영상(연령제한 등) then 각각 이해 가능한 한국어 사유가 표시되고 잡이 생성되지 않거나 실패 사유와 함께 종료된다 | P1 |
| REQ-SEP-001 | 5스템 분리 | given 추가된 곡 when 분리 완료 then vocals/drums/bass/guitar/other 5개 스템 파일이 생성되고 곡 status=ready *(guitar 스템은 SP-1 체크포인트 가용성 실측에 따라 4스템[guitar→other 흡수]으로 조정 가능 — 조정 시 본 표·manifest 동시 갱신)* | P0 |
| REQ-SEP-002 | GPU 자동감지+CPU 폴백 | given NVIDIA GPU 없는 PC when 분리 실행 then 에러 없이 CPU 로 완료되고 UI 에 "CPU 모드(느림)" 표시 · given GPU PC when 실행 then GPU 사용 표시 | P0 |
| REQ-SEP-003 | 건반/신스 품질 정직 고지 | given other(건반·신스 포함) 스템 when 연습 화면 표시 then "이 악기는 분리 품질이 낮을 수 있어요" 안내가 항상 보인다 | P1 |
| REQ-SEP-004 | 분리 모델 선택 | given 설정 화면 when 품질/속도 모델 선택 후 재분리 then 선택된 체크포인트로 분리된다 | P2 |
| REQ-SEP-005 | CPU 처리시간 상한(NFR) | given GPU 없는 주 PC·4분 곡 when CPU 분리 then 30분 이내 완료(스파이크 실측으로 임계 보정, 초과 시 경량 모델 대체 판단) | P1 |
| REQ-PLAY-001 | 스템 솔로/뮤트 | given ready 곡의 연습 화면 when 스템의 솔로/뮤트 클릭 then 해당 스템만 들리거나/빠지고 재생 위치는 유지된다 | P0 |
| REQ-PLAY-002 | 피치 유지 배속 | given 재생 중 when 배속을 0.5x~1.5x 조절 then 모든 스템이 동일 배속·음정 불변으로 재생된다 | P0 |
| REQ-PLAY-003 | 멀티트랙 동기(NFR) | given 재생 중 when 배속 변경·seek·일시정지/재생을 각 5회 반복 then 임의 시점 스템 간 currentTime 편차가 50ms 이내다(자동 측정 가능) | P0 |
| REQ-PLAY-004 | A-B 구간반복 | given 재생 화면 when A·B 지점 지정 then 전 스템이 그 구간만 반복하고 경계에서 멈춤 없이 이어진다 | P1 |
| REQ-PLAY-005 | 스템별 볼륨 | given 연습 화면 when 스템 볼륨 슬라이더 조절 then 그 스템 음량만 즉시 변한다 | P1 |
| REQ-PLAY-006 | 극단 배속 품질 경고 | given 배속 컨트롤 when 0.6x 미만 선택 then "이 배속에서는 음질이 떨어질 수 있어요" 안내가 표시된다 | P2 |
| REQ-PLAY-007 | 파형 표시 | given ready 곡 when 연습 화면 진입 then 사전 계산된 peak 데이터로 파형이 렌더되고 클릭으로 seek 된다 | P2 |
| REQ-PLAY-008 | 키보드 단축키 | given 연습 화면 when 스페이스바 then 재생/일시정지 토글 | P2 |
| REQ-LIB-001 | 분리 결과 재사용 | given 분리 완료 이력이 있는 곡 when 서버 재시작 후 라이브러리에서 곡 클릭 then 재분리 없이 3초 내 연습 화면 진입 | P0 |
| REQ-LIB-002 | 곡 삭제 | given 라이브러리 when 곡 삭제 확인 then DB 레코드와 원본·스템 파일이 디스크에서 함께 삭제된다 | P1 |
| REQ-LIB-003 | 연습 상태 저장 | given 연습 중(위치·루프·스템볼륨·배속 변경) when 화면 이탈 후 재진입 then 마지막 상태가 복원된다 | P1 |
| REQ-LIB-004 | 검색 | given 곡 여러 개 when 제목 검색 then 일치 곡만 목록에 남는다 | P2 |
| REQ-OPS-001 | 비동기 진행률 | given 분리 작업 중 when 라이브러리 화면 표시 then 진행률(%·단계)이 갱신되고 다른 조작(곡 추가 등)이 가능하다(UI 블로킹 없음) | P0 |
| REQ-OPS-002 | health 엔드포인트 | given 앱 실행 when GET /api/health then 200 + {status:ok} | P0 |
| REQ-OPS-003 | 실패 표시+재시도 | given 다운로드/분리 실패 when 라이브러리 표시 then 곡에 에러 상태·이유가 보이고 재시도 버튼으로 같은 잡을 다시 실행할 수 있다 | P1 |
| REQ-OPS-004 | graceful shutdown + bind 설정 | given 분리 작업 중 when SIGTERM/Ctrl-C then 잡 상태가 저장되고(고아 잡 없음, 재시작 시 error 또는 재개 가능 상태) 프로세스가 정상 종료 · given HOST/PORT 환경변수 when 기동 then 해당 주소에 바인딩(기본 127.0.0.1) | P1 |
| REQ-OPS-005 | 더블클릭 실행(G4 배선) | given Windows 탐색기 when run.bat(또는 바탕화면 바로가기) 더블클릭 then venv 활성화·서버 기동·기본 브라우저 자동 오픈까지 완료되고 사용자가 터미널 명령을 직접 입력하지 않는다 | P1 |
| REQ-SEC-001 | 로컬 전용 바인딩 | given 기본 설정 기동 when 다른 기기에서 접속 시도 then 접속 불가(127.0.0.1 바인딩) | P1 |
| REQ-SEC-002 | 개인용 고지 | given 유튜브 입력 UI when 렌더 then "개인 연습용 — 다운로드 결과를 공유·재배포하지 마세요" 문구가 상시 보인다 | P1 |
| REQ-CHORD-001 | 코드 감지(장/단조) | given ready 곡 when 코드 감지 실행 then 시간축 코드(트라이어드) 목록이 표시되고 "7th·텐션 미지원" 고지가 함께 보인다 | P2 |

> 우선순위: P0(없으면 제품이 아님) 10개 · P1 12개 · P2 6개 = 총 28개.
> `depends_on` 은 SPEC.manifest.yaml 에 기계가독으로 기록.

## 개발 착수 전 스파이크 (REQ 아님 — 08-roadmap Phase 0)

1. **SP-1 MSST 설치+실측**: 주 PC(CPU)에서 ZFTurbo MSST + BS/Mel-RoFormer 로 실제 4분 곡 1개 분리 —
   설치 성공 여부·처리 시간·메모리를 실측(전 프로젝트 최대 리스크 — A안 §6). REQ-SEP-005 임계 보정.
   **+ 가용 스템 구성 확인**: guitar 분리 지원(5스템+) 체크포인트가 실제로 있는지 — 없으면 REQ-SEP-001 을 4스템으로 조정.
2. **SP-2 체크포인트 라이선스 확인**: 채택 후보 가중치 각각의 라이선스 명시 확인(비상업 조건 여부) →
   `docs/model-licenses.md` 기록. (조사 미검증 항목)
3. **SP-3 `<audio>` 동기 실측**: 스템 5개 동시 재생 + 배속·seek 반복 시 드리프트 측정 — 50ms 임계 달성
   가능성 확인. 실패 시 Phase 1 에서 SyncPlayer 구현체를 Web Audio 로 조기 전환 판단.

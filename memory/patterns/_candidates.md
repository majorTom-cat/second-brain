# 패턴 후보 백로그 (_candidates) — 아직 승격 안 함

> `/retro` cross-project sweep 이 찾았지만 **1개 프로젝트·도메인 특화**라 정식 패턴(`patterns/<name>.md`)으로 승격하지 않은 것들.
> **매 sweep 마다 재분석하지 말 것** — 여기 모아두고, **매칭되는 프로젝트가 올 때** 그때 열린 구조로 승격한다.
> (broad=2+ 프로젝트 반복은 이미 정식 승격됨. 이 파일은 "언제 쓸지 모르지만 버리긴 아까운" 씨앗.)

| 후보 | 씨앗(무엇) | 출처 | 승격 신호(언제) |
| --- | --- | --- | --- |
| 심층방어 익명성 모듈 | 핸들러(신원 미독취)·저장(컬럼 부재)·로깅(프록시+앱+감사 침묵)을 한 묶음 | `archive/agora/ideas.md` | 제보·신고·익명 게시 프로젝트 |
| 메타데이터 기반 동적 게시판 엔진 | 단일 posts + `author_shape` CHECK 로 익명/실명 겸용, 코드수정 없이 보드 생성 | `archive/agora/ideas.md` | 폼빌더·동적 설문·CMS 류 |
| 다중 포맷 추출 레지스트리 | pdf/docx/xlsx/hwpx 등 결정적 파서 + 비전/LibreOffice 폴백, 원본 보존 | `archive/llm-wiki/ideas.md` | 문서 인제스트가 핵심인 프로젝트 |
| 자립형 핸드오프 브리프 합성기 | 흩어진 문서를 "다른 LLM에 붙여넣을" 단일 자기완결 md 로(맥락·내부ID 제거) | `archive/agora/ideas.md` | 외부 공유/export·아카이브 export 변형 |
| 프라이빗 기본 + 본인 승격 지식모델 | 개인 질의/노트 기본 비공개·옵트인 공용 승격(`visibility`+`userId`) | `archive/llm-wiki`(질의 PRIVATE) | 공유 지식베이스·협업 노트 |
| 라이브 LLM을 경로에서 빼기 | 느린/비싼 모델을 사용자 경로에서 제거, 비동기 큐레이션으로 품질 누적 | `archive/llm-wiki/ideas.md` | 저지연이 중요한 LLM 제품 |
| 무료등급 사용량 가시화 | 요청수/무료 한도 기준 게이지(토큰 상대치 막대는 오인) | `archive/llm-wiki/ideas.md` | 무료 LLM 운영 대시보드 |

> 승격 시: 위 씨앗을 `lesson-distiller` ★열린 구조(결정·계기·트레이드오프·언제 같게/다르게)로 풀어 `patterns/<name>.md` 생성.
| 저장형 XSS-안전 리치 본문 | 평문→HTML 본문 전환 시 sanitize-html 화이트리스트 + 업로드 이미지 sharp 재인코딩(raster/EXIF·스크립트 제거) + `<img src>` 내부 엔드포인트 한정 + 저장·렌더 양쪽 정제 | `intra` 2026-06-21 | 사용자 리치텍스트/이미지 본문 2번째 프로젝트(게시판·CMS·댓글) |
| 캘린더 그리드 드래그/클릭-생성 | 일간 드래그·월간 클릭으로 빈 슬롯→예약폼 URL 프리필(자원·시간 스냅); 오버레이 z-순서로 기존 막대 클릭 유지(`elementFromPoint` 진단·inline z-index) | `intra` 2026-06-21 | 일정/예약 캘린더 2번째 프로젝트 |

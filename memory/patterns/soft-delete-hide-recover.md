# 패턴 — 소프트삭제 = 지우지 말고 숨겨서 복구 가능 (읽기전용 scope 한 경로)

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/llm-wiki/knowledge.md`("아카이브 룸 복구")·`archive/llm-wiki/ideas.md`("소프트삭제 숨기고 복구"). ⚠️ company-internal 일반화.

## 문제
진짜 삭제는 복구 불가·실수 위험이 크다. 별도 휴지통 테이블은 스키마가 복잡해지고 동기화 문제가 생긴다.
"삭제" 버튼 하나에 영구 소실 위험을 거는 것은 UX·운영 양쪽에서 나쁜 기본값이다.

## 패턴
- **`archivedAt` 타임스탬프 하나**로 soft-delete — 별도 테이블 불필요, 스키마 변경 최소.
- 권한 계산처([[single-permission-point]])가 `archivedAt IS NOT NULL` 을 이미 막으면
  **편집·AI·승격 버튼이 자동으로 숨음** — 각 버튼마다 별도 조건문 불필요.
- **핵심 분기**: 쓰기 경로는 차단, **읽기 경로만** 통과 → 읽기전용 열람 + 소유자 복원 허용.
- UI: 사이드바 하단 접이식 '아카이브(N)' 섹션으로 재노출 — 메인 목록은 깔끔, 복구는 한 클릭.
- 복원 = `archivedAt = NULL` 업데이트만 — 데이터 이동 없음.

## 신호 (이 패턴을 써야 할 때)
멀티테넌트·ACL 앱의 컨테이너(룸·프로젝트·워크스페이스·채널) 삭제·복구 요구.
"실수로 지웠을 때 복구가 가능해야 해" 라는 말이 나오면 즉시 → 소프트삭제 + 읽기전용 경로.

## 레일 적용 (빌드는 backlog)
- `/creative` 03-architecture: 컨테이너형 리소스 삭제 정책을 REQ-DATA-NNN 으로 명시.
- `adversarial-review` critic 질문: "삭제가 하드삭제인가? 실수 복구 경로가 있나?"

관련: [[single-permission-point]], [[git-as-source-of-truth]], lessons.

# 패턴 — 제약으로 진실을 강제하라 (불변식은 앱 검증이 아니라 구조로)

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/agora/knowledge.md`("DB는 PostgreSQL 전용기능에 베팅")·`archive/agora/ideas.md`("DB가 진실을 강제한다"), `archive/llm-wiki/knowledge.md`("워커 단일 라이터"). ⚠️ company-internal 일반화.

## 문제
불변식(시간겹침 금지·동시쓰기 금지·익명성)을 **앱 로직으로 검사**하면 레이스 컨디션·누락으로 샌다.
SELECT 후 INSERT 사이에 다른 트랜잭션이 끼어들거나, 새 기능이 체크를 빠뜨리는 순간 불변식이 깨진다.
"항상 이걸 확인해야 해" 라는 주석이 달린 코드는 결국 언젠가 빠진다.

## 패턴
- **① DB 제약·생성컬럼** — DB가 직렬화하므로 SELECT-후-INSERT 동시성 레이스 제거.
  예: `EXCLUDE USING gist (resource_id WITH =, period WITH &&)` 로 시간겹침을 원천차단.
- **② 단일 라이터** — 동시쓰기 충돌을 구조적으로 제거.
  예: git-backed 워커 한 프로세스만 쓰기 → 락 없이도 충돌 불가.
- **③ 스키마 CHECK** — 정책을 컬럼 타입·CHECK 제약으로 표현.
  예: `author_shape CHECK (is_anonymous OR has_display_name)` 로 익명/실명 정책 강제.
- **④ 없는 필드는 새지 않는다** — IP·실명 등 민감 컬럼을 스키마에서 아예 제거 = 누수 경로 차단.
- 슬로건: "스키마는 표현이 아니라 **정책을 강제**한다."

## 신호 (이 패턴을 써야 할 때)
"앱에서 이걸 *항상* 검사해야 해" 라는 말이 나오면 → "애초에 불가능하게 못 만드나?" 를 먼저 물어라.
예약·자원선점·동시성·권한·익명성 도메인에서 특히 유효하다.

## 레일 적용 (빌드는 backlog)
- `/creative` 03-architecture 결정 단계: 불변식 목록을 도출하고 구조적 강제 여부를 명시.
- `adversarial-review` critic 차원 추가: "이 불변식이 구조적으로 강제되나, 아니면 앱 검증에 의존하나?"

관련: [[single-permission-point]], lessons.

# 패턴 — git을 진실의 원천으로 (AI/생성 산출물 = append-only git)

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/llm-wiki/knowledge.md`("git-backed 위키")·`archive/llm-wiki/ideas.md`("git을 진실의 원천"). ⚠️ company-internal 일반화.

## 문제
AI/생성 산출물의 버전·이력·되돌리기·출처추적이 필요한데, 전부 DB에 넣으면
version 테이블·diff 연산·revert API·blame 로직을 모두 직접 구현해야 한다.
구현 부담이 크고 결국 git 이 이미 해결한 문제를 재발명하는 꼴이 된다.

## 패턴
- **산출물 본문 = git-backed markdown, 메타만 DB.** version·blame·머지·revert·provenance 거의 공짜.
- LLM은 **JSON 편집셋(patch)만** 반환 → 코드가 git에 적용(단일 라이터와 결합하면 충돌 0).
- 커밋 trailer로 provenance 기록: `Source-SHA`, `Confidence`, `Model` 필드.
- **아카이브 = 점-디렉터리(`.archive/`) 이동만** → 검색·질의 필터 자동 제외(추가 코드 0).
- ★ second-brain 자신도 이 패턴을 사용: `memory/` append-only, lessons distill.

## 신호 (이 패턴을 써야 할 때)
AI 산출물·지식·문서를 **버전관리하며 누적**하는 시스템(위키·노트·지식베이스·제도 문서).
"이력 보기"·"이전 버전 복원"·"누가 이 내용을 넣었나" 요구가 나오면 → DB 버전 테이블보다 git 먼저.

## 레일 적용 (빌드는 backlog)
- `/creative` 03-architecture: 콘텐츠·지식 시스템 스택 결정 시 git-backed 여부 명시.
- `adversarial-review` critic 질문: "이력·출처를 DB로 직접 구현하려 하나? git으로 대체 가능한가?"

관련: [[soft-delete-hide-recover]], lessons.

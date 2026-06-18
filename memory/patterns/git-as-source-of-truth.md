# 패턴 — git을 진실의 원천으로 (git-as-source-of-truth)

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/llm-wiki/knowledge.md`("git-backed 위키")·`archive/llm-wiki/ideas.md`("git을 진실의 원천"). ⚠️ company-internal 일반화.

---

## 결정 (fork) — 무슨 갈림길인가

AI/생성 산출물의 본문을 **git-backed markdown 파일**로 저장할 것인가,
**DB에 직접** 저장할 것인가 (메타데이터는 양쪽 공통으로 DB에 둔다).

- git-backed: 본문 = 파일, 메타 = DB. 버전·이력·blame·revert는 git이 담당
- DB 저장: 본문도 DB 컬럼. 버전 테이블·diff 연산·revert API를 직접 구현

---

## 계기·증거 — 어느 프로젝트에서 무엇이 실패·통했나

**지식/위키 시스템(llm-wiki 계열)**: LLM이 생성한 위키 페이지 본문을 git-backed markdown으로 저장했다.
버전 이력·blame·merge·revert·출처 추적이 git 기본 기능으로 해결됐고,
LLM이 파일 단위 컨텍스트를 바로 읽을 수 있어 인제스트 파이프라인이 단순해졌다.

DB 버전 테이블을 쓰는 방식과 비교했을 때, 별도 diff 로직·revert API·blame 연산을 구현하지 않아도 됐다.

**second-brain 자체**: `memory/` 디렉터리를 append-only git-backed 구조로 운영 중.
교훈(lessons)은 파일로 추가되고, distill 결과도 같은 방식으로 누적된다.

---

## 선택지와 트레이드오프

### A. git-backed markdown (본문 = 파일, 메타 = DB)
- **득**: 버전·이력·diff·revert·blame·출처 추적 거의 공짜, LLM이 파일 단위 컨텍스트 직접 접근, 아카이브 = 점-디렉터리 이동만으로 검색 제외
- **실**: 동시쓰기 시 단일 라이터 필요(충돌 방지), 관계 쿼리 약함(JOIN 불가), 파일 수 증가 시 스케일 한계

### B. DB 저장 (본문도 DB 컬럼)
- **득**: 관계 쿼리·집계·동시성 강함, 트랜잭션으로 일관성 보장
- **실**: 버전/이력/provenance를 직접 구현해야 함(version 테이블·diff 연산·revert API), git이 이미 해결한 문제를 재발명

---

## 언제 이대로 · 언제 다르게

**git-backed를 택할 때**:
- 버전·이력·출처 추적이 핵심인 지식/문서/위키 시스템
- LLM이 직접 파일을 읽고 편집셋(JSON patch)을 반환하는 파이프라인
- 텍스트 산출물이 주이고 관계 쿼리 요구가 낮은 경우
- "이전 버전 복원"·"누가 이 내용을 넣었나" 요구가 있는 경우

**DB 저장(또는 혼합)을 택할 때**:
- 고빈도 쓰기가 발생해 단일 라이터 제약이 병목이 되는 경우
- 관계 쿼리·집계·전문 검색이 핵심 기능인 경우
- 구조화 데이터(테이블 관계)가 본문보다 중요한 도메인

> 참고: LLM은 JSON 편집셋만 반환하고 코드가 git에 적용(단일 라이터와 결합 시 충돌 0).
> 커밋 trailer로 provenance 기록: `Source-SHA`, `Confidence`, `Model` 필드.
> 아카이브 = 점-디렉터리(`.archive/`) 이동만으로 검색·질의 필터 자동 제외.

---

## 레일 적용 (빌드는 backlog)

- `/creative` 03-architecture: 콘텐츠·지식 시스템 스택 결정 시 git-backed 여부 명시.
- `adversarial-review` critic 질문: "이력·출처를 DB로 직접 구현하려 하나? git으로 대체 가능한가?"

관련: [[soft-delete-hide-recover]], lessons.

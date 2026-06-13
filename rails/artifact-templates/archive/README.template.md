# {{PROJECT}} — 아카이브

> 과거 프로젝트의 지식·아이디어·채팅 이력 보관소. `/archive {{PROJECT}}` 가 생성/갱신한다.

| 항목 | 값 |
| --- | --- |
| 원본 repo | `{{REPO_PATH}}` (읽기 전용 참조) |
| 민감도 | {{SENSITIVITY}} |
| 세션 수 | {{SESSION_COUNT}} 개 |
| 채팅 원본 | {{CHATS_STATE}}  <!-- 평문(chats/raw/) 또는 암호화(chats/raw.tar.gpg) --> |
| 마지막 인제스트 | {{INGEST_DATE}} |

## 한 문단 정체

{{ONE_PARAGRAPH}}

## 이 폴더 안내

- [`knowledge.md`](knowledge.md) — distill된 노하우·핵심 결정·함정.
- [`ideas.md`](ideas.md) — 아이디어·백로그·미실현 스파크.
- [`chats/INDEX.md`](chats/INDEX.md) — 세션 색인(날짜·주제·원본 경로).
- [`chats/SECRETS.md`](chats/SECRETS.md) — 비밀 스캔 리포트(있으면 푸시 전 처리).
- `chats/raw/` — 원본 트랜스크립트(JSONL). 암호화 시 `chats/raw.tar.gpg`.

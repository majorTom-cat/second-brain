# {{PROJECT}} — 채팅 세션 색인

> `/archive {{PROJECT}}` 가 트랜스크립트를 파싱해 생성. 원본은 `raw/<세션ID>.jsonl`.
> 날짜 = 세션 첫 이벤트 timestamp(로컬). 주제 = 첫 사용자 메시지 요약.

| # | 날짜 | 작업맥락 | 주제 | 세션 파일 | 원본 경로 |
| --- | --- | --- | --- | --- | --- |
| 1 | {{DATE}} | {{CONTEXT}} | {{TOPIC}} | [raw/{{SID}}.jsonl](raw/{{SID}}.jsonl) | `~/.claude/projects/{{SRC}}` |

<!-- 작업맥락 = 세션이 속한 인코딩 폴더(E--agora=루트, E--agora-claude=claude 하위 등). -->

## 요약 통계

- 총 세션: {{N}} 개
- 기간: {{FIRST}} ~ {{LAST}}
- 원본 용량: {{SIZE}}

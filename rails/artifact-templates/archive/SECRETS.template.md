# {{PROJECT}} — 비밀 스캔 리포트

> `/archive {{PROJECT}}` 가 `chats/raw/` 트랜스크립트를 스캔한 결과. **푸시 전에 반드시 확인.**
> 발견 = 평문으로 git 에 올라갈 위험. 처리: (a) 마스킹, (b) `/archive {{PROJECT}} --encrypt` 로 raw 암호화.

| 상태 | 값 |
| --- | --- |
| 스캔 일시 | {{SCAN_DATE}} |
| 스캔 패턴 수 | {{PATTERN_COUNT}} |
| 발견 건수 | {{HIT_COUNT}} |
| 판정 | {{VERDICT}}  <!-- CLEAN / REVIEW NEEDED --> |

## 발견 항목

| 유형 | 파일 | 라인 | 미리보기(마스킹) |
| --- | --- | --- | --- |
{{ROWS}}

<!-- 발견 0건이면 "발견 없음 — 평문 커밋 안전" 으로 표기. -->

## 권고

{{RECOMMENDATION}}

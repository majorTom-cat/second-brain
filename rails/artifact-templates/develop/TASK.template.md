<!-- 개발 작업 단위 — REQ당 1개. projects/<slug>/develop/tasks/REQ-*.md 로 생성. -->

# TASK — <REQ-ID>: <요구 요약>

## 출처
- SPEC.manifest.yaml 의 해당 REQ
- acceptance: <given/when/then — 그대로 옮긴다. 이게 통과해야 할 테스트의 명세다>
- depends_on: [<선행 REQ>]

## 구현 메모
- 영향 파일/모듈: <예상>
- 접근: <한두 줄>

## 완료 정의 (Definition of Done)
- [ ] acceptance 를 그대로 검증하는 테스트가 있다
- [ ] 그 테스트가 통과한다
- [ ] adversarial-review 6차원 PASS
- [ ] DEV.manifest.yaml 에 status: done + verification: pass 기록

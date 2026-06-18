# 교훈 — todo-toy (레일 첫 end-to-end 실행) · 2026-06-18

> P-A 검증: 레일(`/creative→/develop→/deploy`)을 **처음으로 실제 한 바퀴** 돌린 결과. throwaway 토이라 산출물이 아니라 **레일이 어디서 걸리나**가 결과물.
> 소스: `projects/todo-toy/{creative,develop,deploy}/HANDOFF.md`(§3)·`GATE.md`. 관련 [[rail]].

## 무엇이 잘 됐나
- **게이트 모델이 실제로 작동**: 각 단계 정지·승인, 하드거부(develop이 creative 승인 확인) 정상.
- **R4a 비용 라우팅이 돎**: bulk를 Haiku(creative 3안·develop 구현)·Sonnet(deploy 배포물)에 위임, judgment(심사·critic·smoke)는 Opus. 비용 라우팅이 처음으로 실집행됨.
- **critic이 진짜 결함을 잡음**(아래) — "끝에서만 검증"이 아니라 모듈 안에서.

## 어디서 마찰이 있었나 (근거: HANDOFF §3)
1. **★develop: 테스트 green인데 실행이 깨짐.** Haiku 구현이 단위+통합 **20/20 green** 이었으나, 실제 `node index.js` 는 **Windows ESM 메인가드 버그**(`import.meta.url === \`file://${argv[1]}\``)로 listen 안 함 → 즉시 종료. 통합테스트가 `createServer` 를 직접 import 해서 **진입점 기동 경로를 안 거쳤기** 때문. **라이브 기동 smoke를 돌린 critic만 잡음.** (`develop/HANDOFF.md` §3)
2. **deploy: 배포에서야 OPS 결함이 드러남.** develop 게이트 통과 코드인데 ① `127.0.0.1` 하드코딩(컨테이너 외부 미도달) ② graceful shutdown 부재 → 배포 단계에서 `HOST` 파라미터화·SIGTERM 핸들러를 **뒤늦게 보강**. (`deploy/HANDOFF.md` §3)
3. **creative: 검증 불가 acceptance.** REQ-UI-001 "클릭→DOM 갱신"이 dep-free(node:test) 제약상 단위테스트 불가 → critic이 거부, serve-check+smoke로 루프백(이건 creative critic이 제때 잡음 = 정상 작동).
4. **R4a 품질 관찰**: Haiku 산출은 숨은 버그를 남겼고(critic이 잡음), **Sonnet 산출(배포물)은 추론이 확연히 꼼꼼**. 사용자가 bulk를 Sonnet으로 상향.

## 레일 수정 제안 (diff 식, 우선순위)
- **[T1] (최우선) develop §5에 "진입점 기동 smoke" 강제** — `/develop` 명령 + `req-implementer`: 단위/통합 테스트 외에 **실제 진입점을 기동**(`node <entry>` 또는 `docker run`)하고 **health/기본 라우트 curl** 통과를 **필수 검증**으로. 이유: 단위/통합만으론 진입점·기동 경로(특히 크로스플랫폼 main-guard) 결함을 못 잡는다 — 이번 실버그의 직접 교훈.
- **[T2] creative: 배포가능 서비스는 OPS REQ 선반영** — `02-requirements` 템플릿 + `/creative`/`spec-author`: **장기 실행 서비스**면 deploy_profile 이 `local` 이어도 OPS REQ(health·graceful shutdown·**configurable bind**)를 자동 포함(현재는 `intranet` 에서만). 이유: local+Docker 도 graceful/bind 필요했다(deploy에서 뒤늦게 보강).
- **[T3] (경미) creative critic 문구**: "acceptance 는 **선택한 테스트 수단으로 검증 가능**해야 한다(브라우저 상호작용 등은 serve-check+smoke로 분해)" 명문화.

## 적용 결과 (2026-06-18 게이트 승인 = T1·T2·T3 전부)
- ✅ **T1**: `/develop` §5 → "통합 + 진입점 기동 smoke(필수)" 추가.
- ✅ **T2**: `/creative` §3 + `rails/artifact-templates/creative/02-requirements.md` + `spec-author` — 배포가능 서비스는 `local`+Docker 도 OPS REQ(health·graceful·configurable bind) 자동 포함.
- ✅ **T3**: `/creative` critic 문구 — "선택한 테스트 수단으로 검증 가능"(UI는 serve-check+smoke 분해).

## tier 메모
- bulk 기본 = **Sonnet**(2026-06-18 사용자 전환, `model-tiers.yaml`). 코드 생성 bulk엔 Sonnet 권장. critic은 모델 무관 필수 안전망.

## 승격 후보
- **[T1] 진입점 기동 smoke** 는 *모든 실행형 프로젝트에 반복*될 패턴 → 1프로젝트지만 일반성이 높아 `patterns/` 승격 후보(다음 프로젝트에서 재확인 시 승격).

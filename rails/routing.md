# routing.md — 비용 계층 라우팅 계약 (R4a)

레일 명령/스킬의 각 step에 붙은 `[tier: bulk|judgment]` 태그를 **실제 모델 선택**으로 바꾸는 규약.
이 레일은 Claude Code 안에서 실행되므로 "라우팅" = 그 step 을 **어느 모델로 돌릴지** 정하는 것.
정본 매핑은 [`rails/model-tiers.yaml`](model-tiers.yaml). 태그는 라우팅 계약이므로 **임의로 바꾸지 않는다**.

## 매핑
| tier | 누가 실행 | 무엇 |
| --- | --- | --- |
| `judgment` | **메인 모델(Opus)** 이 직접 | 아이디어 프레이밍·N안 심사·적대적 리뷰·통합·게이트 요약·distill 결론 |
| `bulk` | **더 싼 모델(Sonnet) 서브에이전트로 위임** | 초안·보일러플레이트 코드·문서 확장·화면 스캐폴드·smoke 생성 |

## 실행 방법 (R4a — 하네스 내, 설정 0)
- `[tier: bulk]` step 을 만나면: **`Agent`(또는 `Task`) 를 `model: sonnet` 으로 띄워 그 step 만 위임**하고, 결과를 받아 이어간다. (다이얼: `model-tiers.yaml` bulk.model — haiku=최저가/sonnet=현재/opus=절감0)
  - 대량 산출(N개 화면 스캐폴드, REQ별 초안 등)은 **병렬 Haiku 서브에이전트**로.
  - 위임 프롬프트엔 입력 산출물 경로(스펙·번호문서)를 명시 — 서브에이전트는 대화맥락이 없다(산출물=인터페이스 원칙).
- `[tier: judgment]` step 은 **메인(Opus)이 직접**. 위임하지 않는다.
- 경계가 애매하면 **judgment 로**(품질 안전). 틀리면 비싼 단계는 절대 bulk 로 내리지 않는다.

## ★위임 자가검증 (R4a 의 거짓완료 — false-done-checklist H4)
싼 모델 위임이 **조용히 품질을 떨어뜨려도** critic 이 못 보면 거짓완료가 된다. 두 비대칭을 막는다:
- **bulk 산출은 자가보고로 신뢰하지 않는다** — 호출자가 경계/관찰로 직접 검증([[verify-by-observation]]). 위임 에이전트의 "정상입니다"는 관찰이 아니다(intra: sonnet 위임 자가보고가 권한 누수를 "정상"이라 보고).
- **judgment step 이 실제로 메인(Opus)에서 돌았나** — 비용 절감 압박에 적대적 리뷰·심사·통합을 bulk 로 내리지 않았는지 확인(judgment 를 bulk 로 내리면 critic 품질 자체가 무너져 모든 거짓완료 탐지가 약해진다).

## 일 예산 (R4a = 소프트 가드)
- 유료 비용은 사실상 **judgment(메인 Opus)** 에만 든다 → **judgment step 을 적게 유지**하는 게 비용 통제의 본질.
- bulk 를 Haiku 로 내리면 그 부분 토큰단가가 크게 떨어진다(무료는 아님).
- 하드 미터(누적 토큰 차단)는 R4b(외부 API 경로)에서 `rails/.budget.json` 으로. R4a 는 "judgment 최소화" 원칙으로 충분.

## R4b (옵션·미구현) — 진짜 $0
- bulk 를 **로컬 qwen(Ollama) / Gemini 무료** 로 보내려면 `rails/route.mjs`(디스패처) + `.env`(`BULK_PROVIDER`·`GEMINI_API_KEY`·`OLLAMA_HOST`) 필요. llm-wiki `lib/anthropic.ts`·`cost.ts`·`fallback.ts` 패턴 일반화(공급자추상화 + 폴백 + 모델별 컨텍스트 예산).
- ⚠️ **작은 로컬 모델은 구조화 작업 실패율이 높다**(llm-wiki 실증) → 진짜 기계적 bulk 에만, critic·게이트가 오류를 잡는 전제에서만.
- **민감자료는 외부(Gemini) 금지** — company-internal 산출물은 외부 무료 공급자로 보내지 않는다.

> 관련: [`memory/lessons/rail.md`](../memory/lessons/rail.md)(R4 배경), [`CLAUDE.md` 비용 계층].

---
name: lesson-distiller
description: 회고 모듈 내부 절차. 한 프로젝트의 HANDOFF/GATE/critic 루프백을 읽어 구체적 교훈과 레일 수정 제안으로 distill한다. /retro 가 사용.
---

# lesson-distiller — 교훈 추출 + 레일 수정 제안

원칙: "느꼈다"가 아니라 **"다음에 무엇을 바꾼다"**. 모든 교훈은 레일의 특정 파일/필드/문구로 환원되어야 한다.

## 입력
- `projects/<slug>/{creative,develop,deploy}/HANDOFF.md`(특히 §3 critic 루프백), 각 `GATE.md`, `.state/pipeline.yaml`.

## 절차

### 1) 마찰 지점 추출  `[tier: judgment]`
다음을 찾는다:
- critic이 **반복해서** 거부한 종류(예: acceptance 누락 2회) → 템플릿/명령으로 예방 가능했나?
- 게이트에서 사람이 **매번 손본** 것 → 레일이 자동으로 채웠어야 할 필드?
- 잘못 분류된 tier(무료로 돌렸는데 품질이 모자라 다시 한 step) → tier 재배정?
- 배포 ops_gaps(백업·모니터링 등) 중 다음 프로젝트에도 반복될 것?

### 2) lessons 파일 작성
`memory/lessons/<slug>.md` 를:
```markdown
# 교훈 — <slug> (<날짜>)
## 무엇이 잘 됐나
- ...
## 어디서 마찰이 있었나 (근거: HANDOFF §3 / GATE)
- <마찰> → 원인 <레일의 어떤 부분>
## 레일 수정 제안 (diff 식, 우선순위)
- [ ] <파일>: <구체적 변경>
```

### 3) 승격 판단
같은 교훈이 **2개 이상 프로젝트**에서 반복되면 `memory/patterns/<name>.md` 승격 후보로 표시.

## 반환
호출자(/retro)에게 {lessons 경로, 레일 수정 제안 목록, 승격 후보}를 넘긴다. **레일 변경은 호출자가 사람 승인 후 적용.**

## 규칙
- 1프로젝트 1교훈 과잉금지: 가장 임팩트 큰 3개 이내로.
- 제안은 실행 가능해야 한다(어느 파일의 어느 줄을 어떻게).

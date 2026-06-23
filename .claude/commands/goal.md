---
description: intra 남은 작업(전체 재테스트·미완 개발·푸시)을 보여주고 이어서 진행한다.
---

# /goal — intra 남은 작업 재개

사용자가 `/goal` 을 쳤다. 대상 프로젝트 = **`E:\intra`**(이 세션 작업 디렉터리는 second-brain 이라 intra 문서는 자동 로드 안 됨 — 아래를 *명시적으로 Read* 하라). 순서대로 하라.

1. **읽기(절대경로)**: `E:\intra\docs\TODO.md` (정본) + `E:\intra\HANDOFF.md` 의 맨 위 ▶▶ 이어가기 블록 + `E:\intra\CLAUDE.md` 의 충실도 프로토콜.
2. **상태 점검**(읽기 전용, intra 에서):
   - `cd /e/intra && git rev-parse --abbrev-ref HEAD` · `git log origin/main..main --oneline`(미푸시) · `git status -s`
   - 환경: `curl -m3 -s -o /dev/null -w "%{http_code}" http://localhost:4210/login`(dev) · `docker ps --format "{{.Names}}: {{.Status}}" | grep intra`(DB/Mailpit). 안 떴으면 사용자에게 기동 안내(`npm run dev` / `docker start intra-pg intra-mail`).
3. **요약·제안**: TODO 를 A(재테스트·검증) → B(결정 대기) → C(미완 개발) → D(푸시) 순으로 *남은 것만* 간결히 보이고, 막 시작 가능한 것부터 추천.
4. **진행**: 사용자가 고르거나 "알아서 해/다 해줘" 하면 **자율 진행, 게이트에서만 확인**.
   - 화면·CSS·컴포넌트를 건드렸으면 "완료" 전 반드시 **`/inspect`**(또는 `node scripts/fidelity-audit.mjs all` 3뷰포트+chrome · `node scripts/responsive-audit.mjs`). "한 방법 0건=완료" 금지 — 검사 묶음 소진으로 보고.
   - `npm test` 후 데모 비번/익명암호 바뀜 → `npm run db:reset` + `npm run db:encrypt-anon` 복구.
   - **푸시(D)는 사용자가 명시 지시할 때만** — main push = CI 자동 LIVE 재배포. 배포 전 `sh scripts/preflight-deploy.sh`.
   - 검증 스크립트는 second-brain `.preview-shots/` 에 둬 intra 워킹트리 안 더럽힘(Playwright 는 intra node_modules 절대경로 import).
5. 완료한 TODO 는 `E:\intra\docs\TODO.md` 에서 체크/제거, 새 일은 추가(정본 최신 유지).

> 어기지 말 교훈: 검사는 "0건/완료" 단정 금지(층층이·전수) · 아이콘/문구는 고화질 스샷 아니라 소스 diff · 충실도 감사는 PC만 말고 전 뷰포트+chrome · 형제 네비/탭은 distinct 목적지(죽은 컨트롤 금지) · 모든 수정은 PC+모바일 동시.

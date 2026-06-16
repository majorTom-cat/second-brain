# 패턴 — 외부 repo를 레일 산출 타깃으로

> 승격: 2026-06-16 (`/retro` rail). intra(명시) + agora·llm-wiki(모두 외부) → 패턴.
> 근거: [lessons/rail.md](../lessons/rail.md). ⚠️ company-internal 일반화.

## 문제
레일 명령(`/creative`·`/develop`·`/deploy`)이 산출물 경로를 `projects/<slug>/...` 로 **하드코딩**한다.
하지만 실제 대상(intra·agora·llm-wiki)은 전부 **별도 repo**(`E:\<project>`)다. 레일은 *방법·지식* 제공자이고
산출물은 그 프로젝트 repo에 두어야 하는데, 경로 가정이 외부 타깃을 막는다.

## 패턴
- **레지스트리** `rails/projects.yaml`: `slug → {root, layout, deploy_profile}`.
  - `layout: internal` → 기존처럼 `projects/<slug>/` 아래.
  - `layout: external` → 산출물을 `<root>/docs/` + 루트 코드 + `<root>/.rail/`(상태·manifest) 로 매핑.
- **경로해석 규약** `rails/project-paths.md`: 명령이 직접 경로를 쓰지 않고 이 규약을 거쳐 슬러그→경로를 해석.
- **하위호환**: 미등록 slug 는 기존 `projects/<slug>/` 동작 그대로(레일 안정성).

## 원칙
- 레일은 외부 repo **안에 산출물을 쓰되**, 읽기전용 prior-art repo(예: 참조용 원본)에는 **아무 파일도 만들지 않는다**.
- `.rail/` 만 레일 메타(상태·manifest)를 두는 자리 — 프로젝트 코드와 섞지 않는다.

## 신호
대상이 `E:\second-brain\projects/` 밖에 있다 / 이미 자체 repo·CI·배포를 가진 프로젝트다 → external layout.

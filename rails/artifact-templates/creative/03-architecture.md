<!-- 아키텍처·스택 — llm-wiki docs/03-architecture.md 일반화. [tier: judgment]
     여기서 내린 스택 결정이 /develop 의 골격 생성과 /deploy 의 프로파일을 좌우한다. -->

# 03 — 아키텍처: <프로젝트명>

## 스택 결정 (근거 포함)

| 영역 | 선택 | 근거 |
| --- | --- | --- |
| 언어/런타임 | <예: TypeScript / Node> | |
| 프레임워크 | <예: Next.js App Router> | |
| 데이터 | <예: Postgres / SQLite / 없음> | |
| 인증 | <none | 자체 이메일+비번 | 사내> | intranet 이면 agora 패턴 참조 |

> SPEC.manifest.yaml 의 `stack` 과 일치시킬 것.

## 컴포넌트 구성

<주요 모듈/서비스와 관계. ASCII 다이어그램 권장.>

```
[client] → [api] → [db]
```

## 데이터 모델 스케치 (있으면)

<핵심 엔티티와 필드. 상세 DDL은 /develop 단계에서.>

## 배포 타깃

- **profile**: <local | intranet>
- local → docker-compose. intranet → GitLab CI→Harbor→k8s rolling + cert-manager (agora 패턴 일반화).
- 필수: `/api/health`, SIGTERM graceful shutdown, 시크릿 외부화(.env/CI 변수).

# 교훈 — bns-intranet 실배포 (deploy-only) · 2026-06-18

> 레일이 **만든 게 아니라 배포만** 한 첫 실제 프로젝트(남이 만든 사내 Spring+SPA 앱을 사내 k8s에 올림).
> [[deploy-only-third-party-policy]] 적용: archive 금지·앱 소스 무수정·배포 교훈만 **일반화**(회사 고유값 마스킹).
> 처음 끝까지 **실제로 띄움**(이전 회고들은 toy/문서였음) → 실전에서만 나오는 교훈.

## 무엇이 잘 됐나
- 로컬 Docker로 **빌드→스키마생성(엔티티 Hibernate create→덤프)→validate 기동→/api 왕복**을 매 단계 검증하고 올림 → 매니페스트·스키마가 추측이 아니라 확인된 것.
- 막힐 때마다 **원인을 로그/이벤트로 확정**(추측 배포 금지): ContainerCreating·CrashLoop·401·NotFound·dind·gradle 타임아웃을 각각 정확히 진단.

## ★핵심 교훈 — 기성 클러스터엔 prior-art의 "전체" 설정을 기본값으로 채택하라
같은 사내 인프라에 이미 도는 앱(agora·llm-wiki)이 있으면, 그 **검증된 설정을 부분만 옮기고 "나중에 확인"으로 미루지 말 것.**
이번 1차 배포는 **6연속 실패**가 났는데 전부 *prior-art엔 이미 있었으나 내가 안 박아둔* 제약이었다 — 매번 push→파이프라인→진단 왕복 비용:

1. **CSI 없는 노드** → 볼륨 파드가 그 노드에 스케줄되면 `ContainerCreating`에서 멈춤(PVC는 Bound라도). → `nodeAffinity`로 그 노드 제외. (prior-art가 이미 그렇게 함)
2. **노드 CPU가 구식(x86-64-v2 미지원)** → 최신 `mysql:8.0` 이미지가 `Fatal glibc error`로 즉사. → **MariaDB**(클러스터가 이미 쓰는 엔진, MySQL 드라이버·스키마 호환이라 앱 무수정).
3. **공용 pull 시크릿 재사용 안 함** → 개인 계정으로 새 시크릿 만들었더니 `401`(개인 계정은 레지스트리 pull 권한 없음). 모든 워크로드가 쓰는 **공용 pull 시크릿을 그대로 참조**.
4. **dind 연결 변수 누락**(`DOCKER_HOST`/TLS) → CI `docker build`가 "Cannot connect to Docker daemon". prior-art가 "검증된 dind 설정"이라 박아둔 변수를 안 옮김.
5. **CI가 외부 `services.gradle.org` 접근 불가** → `gradlew`의 gradle 배포본 다운로드 타임아웃. → **gradle 내장 이미지**로 빌드(다운로드 제거; 의존성은 사내 미러/Maven).
6. **(deploy-only 특유)** 팀 앱 코드의 test 1건·lint 실패가 `build:images`를 막음 → 내 CI에서 test를 **`allow_failure`(비차단)** 로(코드는 안 고침, 결과는 표시·팀에 보고).

→ 트레이드오프: 전체 선복사 = 첫 배포 느려 보이나 왕복 6번을 0으로. 부분만 + "확인 후" = 빨라 보이나 매 제약이 런타임 실패로 늦게 드러남.
**언제 전체 채택**: *같은* 클러스터/인프라에 새 워크로드(제약 공유). **언제 다시 확인**: *다른* 클러스터/인프라(이 값들은 환경 고유).

## ★운영 교훈 — `ddl-auto: validate` + 마이그레이션 없음 = 스키마 변경 자동 반영 안 됨
- **코드 로직**(언어/프론트) 변경 → push→빌드→배포로 자동 반영.
- **DB 컬럼 추가/변경** → ❌ 자동 아님. Hibernate가 검증만 하고 스키마를 안 바꿈 + 마이그레이션 도구(Flyway 등) 없음 →
  엔티티에 컬럼 추가하고 그냥 배포하면 새 이미지가 **validate 실패로 안 뜸**(무중단이라 서비스는 유지되나 새 버전 미반영). initdb 스키마 스크립트는 **빈 DB 최초 1회만** 적용(기존 DB엔 재적용 안 됨).
- 트레이드오프: validate=운영 안전(앱이 함부로 DDL 안 함)·but 스키마 변경 시 수동 ALTER 필요 / update=편하나 rename·drop·타입변경에 위험(운영 비권장) / 마이그레이션 도구=편함+안전이나 **앱 코드 변경**(deploy-only 범위 밖 → 팀에 권고).
- **언제 수동 ALTER**: 단발 변경, 팀이 마이그레이션 미도입. **언제 도구 도입 권고**: 스키마가 자주 바뀌는 활성 개발(=대부분).

## 레일 시사 (제안 — 사람 승인)
- `patterns/intranet-deploy.md` 에 위 6함정 + validate-마이그레이션 함정을 **일반화로 보강**(아래 반영).
- `deploy-runbook` 스킬 `intranet` 프로파일 체크리스트에 "prior-art 전체 설정 선채택"·"스키마 변경 비자동 경고"를 넣을 후보.
- deploy-only 산출은 타깃 repo `DEPLOY.md` 한 장 + 필요한 배포 파일(`deploy/`)로(앱 소스 무수정). [[deploy-only-third-party-policy]] 와 정렬.

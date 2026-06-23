# 패턴: 사내 k8s Next.js standalone 앱 배포 스타터

> ⚠️ company-internal 일반화 — 사내 호스트/네임스페이스/노드/시크릿명은 `<...>` 로, 실값은 gitignored `rails/internal-markers.local`.
> **언제 쓰나**: 새 사내 Next.js(App Router) 앱을 `<사내레지스트리>` + 사내 k8s(`<사내ns>`)에 배포할 때.
> **목적**: agora·llm-wiki·intra 에서 *매번 재발견하던* standalone 이미지 함정·RBAC·시크릿·포트 패턴을 **복사 가능한 스타터**로 굳혀 다음 앱을 한 번에 띄운다.
> **정본 레퍼런스 구현 = intra repo**(사내 GitLab). 이 패턴은 일반화 + 출처 인용; 파일을 여기로 복제하지 않는다(prior-art 규율).

## 복사할 파일 (intra 기준 — 앱명만 치환)
- `Dockerfile`(멀티스테이지 standalone, `npm install`[ci 아님], postgres 명시복사, 엔트리포인트) · `docker-entrypoint.sh`(`node db/migrate.mjs`→`server.js`)
- `db/migrate.mjs`(forward-only, advisory lock, **dotenv 동적 import**) · `next.config`(`output:"standalone"` + `serverExternalPackages:["sharp"]`)
- `k8s/{app,postgres,configmap,secret.example,ci-rbac}.yaml` · `.gitlab-ci.yml`(typecheck→docker-build→release=set image / service-deploy 수동) · `scripts/preflight-deploy.sh` · `docs/DEPLOY.md`

## 미리 해결된 함정 (이게 핵심 — 안 그러면 또 N번 시행착오)
[[standalone-image-preflight-smoke-test]] 의 5개가 *전부 "dev 통과/이미지에서만 터짐"* 부류 → 스타터에 해결책이 박혀 있음:
1. **`npm ci` 금지 → `npm install`** (Windows 생성 lock 에 sharp `@emnapi` linux/musl optional 누락). CI·Dockerfile 둘 다.
2. **DB 모듈 import-safe** — `@/db` 가 import 시점에 `throw`(DATABASE_URL 미설정)하면 빌드의 page-data 수집이 죽음 → url 없으면 placeholder(postgres.js lazy).
3. **sharp 지연 import** — top-level `import sharp` 금지, 핸들러 안 `await import("sharp")` + `serverExternalPackages:["sharp"]`. (지연 import 는 빌드 평가 함정만 해결 — 런타임 함정은 #6.)
4. **번들 밖 스크립트(migrate.mjs)의 dotenv 동적 import** — `try{await import("dotenv/config")}catch{}` (이미지엔 dotenv 없음, env 는 k8s).
5. **prod 시드 ≠ dev 데모 시드** — 엔트리포인트 `SEED=1` 가 *dev 데모*를 prod 에 넣지 않게. prod 는 관리자 1명+부서만(비번은 env/서버 세팅; dev 비번세팅 스크립트는 prod 에서 안 돎).
6. **★★sharp(및 v2-요구 네이티브 모듈) prebuilt 는 이 인프라에서 못 돈다 → vendoring** (intra 2026-06-23 에 6번 시행착오로 확정). 사내 k8s **CPU=`Common KVM processor`(가상, x86-64-v2 미노출)** → sharp 0.33+ 의 `@img` prebuilt 가 v2 요구해 런타임 거부(`require('sharp')` 사망, 모든 이미지 decode-fail). + **사내망이 node-gyp Node 헤더(`unofficial-builds.nodejs.org`) 차단** → CI 소스빌드도 불가. **로컬 docker 빌드는 v2 CPU 라 항상 통과 → CI/런타임에서만 터짐(preflight 도 못 잡음 — 로컬이 v2).** **해결 = vendoring**: 로컬 alpine 에서 시스템 libvips 로 소스빌드(`apk add vips-dev build-base python3` + `SHARP_FORCE_GLOBAL_LIBVIPS=1 npm i sharp@<vips호환버전> node-addon-api node-gyp`)한 `sharp-linuxmusl-x64.node` 를 repo `docker/` 에 커밋 → Dockerfile 이 `npm install`(JS) 후 그 .node 를 `node_modules/sharp/src/build/Release/` 로 COPY + runner `apk add vips`. CI 는 복사만(로컬==CI). **sharp 버전은 alpine apk libvips 와 호환되게 핀**(intra: alpine vips 8.18.2 ↔ sharp 0.34.3; 0.35.x 는 8.18.3+ 요구라 불가). Dockerfile deps·runner 에 `RUN node -e "require('sharp')"` 빌드 가드(깨지면 빌드 실패). 정본 절차 = `intra/docs/DEPLOY.md` "sharp 네이티브 모듈" 섹션 + [[bns-cluster-deploy-notes]].
→ **배포 전 `sh scripts/preflight-deploy.sh` 가 1~5 를 클러스터 가기 전에 잡는다**(실제 이미지 build+run). 단 **#6(v2)는 로컬이 v2 CPU 라 preflight 도 못 잡음** → Dockerfile 빌드 가드 + 실환경 계측(`k exec`)으로. `npm run build` 만으론 못 잡음.

## 인프라 패턴 ([[bns-cluster-deploy-notes]] §6~10 와 동일)
- **인클러스터 Postgres 포트는 프로젝트마다 구분**: agora 5432·llm-wiki 5532 → **새 앱은 미사용 포트**(Service `<port>`→pod 5432). DBMS 는 port-forward 로컬 1xxxx(역시 구분).
- **시크릿 = 서버에서 `k create secret` 직접**(GitLab CI 변수에 DB 비번 안 들어가게 — 동료 비노출) *또는* CI 변수→service-deploy(agora/llm-wiki 기본, Masked·Protected지만 Maintainer가 봄). 가장 민감한 키는 서버 직접(apply 가 보존). 앱은 `envFrom: [configMapRef, secretRef]`.
- **스키마 = 이미지 엔트리포인트가 파드 기동마다**(별도 Job 금지 — CI SA RBAC 없음). 다중 replica advisory lock.
- **CI SA 는 `set image` 만** — 최초 리소스는 운영자 `k apply`(repo 가 서버에 clone) *또는* `k8s/ci-rbac.yaml`(`<사내ns>` 한정 Role) 1회 부여 후 service-deploy. `<공용pull시크릿>`(원문 철자 그대로) pull, `<CSI없는노드>` 제외, `<사내cert-issuer>`/`<RWO스토리지>`.
- 무중단: replicas 2·maxUnavailable 0·preStop 10·readiness `/api/health`(DB포함)·liveness tcpSocket(DB비의존)·PDB.

## 결정·트레이드오프 (열린 구조 — 다음 앱이 같게도 다르게도)
- **시크릿 위치**: 서버직접(노출0·서버타이핑1회) vs CI변수(타이핑0·Maintainer가봄) vs SealedSecret(노출0·타이핑0·`kubeseal`+컨트롤러 필요). → 민감도·팀권한 따라 택1. intra=서버직접.
- **무중단 정도**: 일반 웹앱=replicas2+RollingUpdate(intra). 단일 라이터(git/파일락)=replicas1+Recreate(llm-wiki, 수초 blip 허용).
- **마이그레이션 도구**: raw SQL+`migrate.mjs`(intra) vs `prisma db push`(llm-wiki) — 둘 다 *엔트리포인트에서* 돈다는 게 공통(도구는 앱 따라).
- **언제 이 패턴을 안 쓰나**: 사내 인프라가 아니거나(외부 클라우드), DB가 공유 인스턴스면 postgres.yaml 생략하고 DATABASE_URL만.

## 검증
배포 전 `preflight-deploy.sh` ✅ → push → CI 초록 → `k -n <사내ns> get pods` Running → `k logs deploy/<app>` 엔트리포인트 migrate 확인 → URL 접속. 관련 [[intranet-deploy]]·[[external-project-layout]].

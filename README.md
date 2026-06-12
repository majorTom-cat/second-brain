# second-brain — 아이디어 자동 구성 파이프라인

> 아이디어 한 문단을 넣으면 **창작(설계) → 개발 → 배포** 3모듈 파이프라인이 프로젝트를 구성한다.
> 매번 처음부터 질의하지 않고, **검수 게이트가 있는 산출물 파이프라인**으로 빠르고·쉽고·품질 좋게 만든다.

이 저장소는 **레일(rails)** 이다 — 즉 "프로젝트를 만드는 공장"이지, 특정 제품이 아니다.
명령을 돌릴 때마다 `projects/<slug>/` 아래에 한 프로젝트가 생성된다.

## 핵심 철학

마법 버튼이 아니다. **모듈 사이에 넘기는 산출물(artifact)이 곧 인터페이스(계약)** 이고,
모듈 경계마다 사람이 5분 검수하는 **게이트**가 있다. 오류는 파이프라인을 따라 복리로 커지므로,
검증(critic)을 각 모듈 안에 넣고, 끝에 **회고 루프**로 교훈을 레일에 되먹인다 —
이 되먹임이 "second brain"의 진짜 보상이다(프로젝트 5번째가 1번째보다 빨라진다).

## 명령 5개 (운영 표면은 의도적으로 작게)

```
/creative "<아이디어>"   →  검수   →  /develop   →  검수   →  /deploy   →  /retro
            (아이디어→스펙)         (스펙→코드+테스트)       (코드→배포+런북)    (교훈 되먹임)
/status                                                       # 현재 단계·대기 게이트 확인(읽기 전용)
```

단계 사이는 전부 **읽고 다시 실행할 수 있는 파일**이다. 마음에 안 들면 같은 명령을 다시 돌려 반복한다.

### 흐름 한눈에

| 명령 | 입력 | 산출물(계약) | 게이트 |
| --- | --- | --- | --- |
| `/creative` | 아이디어 한 문단 | `creative/` 번호 문서 + REQ표 + `SPEC.manifest.yaml` | `creative/GATE.md` |
| `/develop` | `SPEC.manifest.yaml` | `develop/` 코드+테스트 + `DEV.manifest.yaml` | `develop/GATE.md` |
| `/deploy` | `DEV.manifest.yaml` | `deploy/` 배포물 + RUNBOOK + `DEPLOY.manifest.yaml` | `deploy/GATE.md` |
| `/retro` | 위 3개 HANDOFF/GATE | `memory/lessons/<slug>.md` + 레일 수정 제안 | 사람이 레일 변경 승인 |

## 게이트 사용법

각 명령은 끝에 `<stage>/GATE.md` 를 쓰고 **멈춘다**. 산출물을 검토한 뒤:
- 만족하면 → `projects/<slug>/.state/pipeline.yaml` 의 `gate:` 를 `approved` 로 바꾼다(또는 다음 명령이 안내).
- 고치고 싶으면 → 같은 명령(`/creative` 등)을 다시 돌려 반복한다.

다음 명령은 **이전 게이트가 `approved` 가 아니면 거부**한다(오류의 하류 전파 차단).

## 디렉터리

| 경로 | 역할 |
| --- | --- |
| `.claude/commands/` | 슬래시 명령(얇은 오케스트레이터) |
| `.claude/skills/` | 명령이 부르는 무거운 절차(팬아웃·critic 등) |
| `rails/artifact-templates/` | 각 모듈 산출물 템플릿 |
| `rails/model-tiers.yaml` | 비용 계층 라우팅 정책(seam) |
| `rails/handoff/` | HANDOFF·GATE 템플릿 |
| `memory/` | 프로젝트 간 누적 교훈(= second brain) |
| `projects/<slug>/` | 생성된 프로젝트(명령이 만든다, 사람이 직접 X) |

## 비용 모델 (무료~소과금 중간)

판단이 중요한 소수 단계(`[tier: judgment]`)만 유료 Claude(소액), 대량·지루한 작업(`[tier: bulk]`)은
무료(로컬 qwen / Gemini 무료)로 라우팅한다. 지금(R1~R3)은 태그만 깔려 있고 전부 직접 실행해도 되며,
나중에 R4에서 `rails/model-tiers.yaml` + `.env` 로 실제 라우팅 엔진을 붙인다. 설정은 `.env.example` 참고.

## prior art (읽기 전용 참조 — 복사 안 함)

- `E:\llm-wiki` — 번호 설계 문서 arc, REQ-ID 규약, HANDOFF 재개성, 멀티 프로바이더 비용 라우팅.
- `E:\agora` — 사내 배포 스택(GitLab CI→Harbor→k8s), graceful shutdown, 운영 런북, 사내 인증 패턴.

상세 운영 규칙은 [`CLAUDE.md`](CLAUDE.md), 설계 근거는 플랜 파일 참조.

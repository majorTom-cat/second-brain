# archive/ — 과거 프로젝트 집대성 (개인 second brain 백업)

> 에이전트로 진행한 과거 프로젝트의 **채팅 이력·노하우·아이디어**를 프로젝트별로 모아
> **클라우드(GitHub private)에 영속 백업**하는 영역. 로컬이 포맷/고장돼도 살아남게 한다.

`/archive <project>` 명령이 생성/갱신한다. 사람이 직접 만들지 않는다.

## 레일에서의 위치

| 영역 | 용도 |
| --- | --- |
| `projects/` | 레일이 **생성하는** 신규 프로젝트(창작→개발→배포) |
| `memory/` | `/retro` 가 쌓는 **교훈 다이제스트**(레일 자기개선) |
| **`archive/`** | **과거 프로젝트의 지식·채팅 보관소**(이 영역) |

`archive/<project>/knowledge.md` 는 향후 `/creative` 의 **prior-art 입력**으로도 인용될 수 있다.

## 구조

```
archive/
  INDEX.md                  # 프로젝트별 한 줄 포인터
  <project>/
    README.md               # 한눈에(원본 repo·민감도·세션수·용량)
    knowledge.md            # 노하우·핵심 결정·함정 (distill, 판단 단계)
    ideas.md                # 아이디어·백로그·미실현 스파크
    chats/
      INDEX.md              # 세션 색인(날짜·작업맥락·주제·원본경로)
      SECRETS.md            # 비밀 스캔 리포트(마스킹)
      raw/<sid>.jsonl       # 원본 트랜스크립트(평문) — 암호화 시 raw.tar.gpg
```

## 정책 (CLAUDE.md `archive/` 규약과 동일)

1. **원본 채팅 = 평문 커밋이 기본**(소유자 결정 — GitHub 웹에서 바로 읽기 위함). 단:
2. **비밀 스캔이 인제스트에 내장**된다. `chats/SECRETS.md` 가 `REVIEW NEEDED` 면 **푸시 전** 마스킹 또는 암호화.
3. **암호화 시임**: `/archive <project> --encrypt` 가 `chats/raw/` 를 gpg(AES256)로 잠가 `raw.tar.gpg` 로 만든다.
   회사 데이터(`sensitivity: company-internal`)는 클라우드 보관 시 암호화를 권장.
4. **푸시는 사용자가 명시 지시할 때만.** 자동 푸시 금지.
5. **repo가 public 전환 / 공동작업자 추가 전**에는 `company-internal` 아카이브를 반드시 암호화 또는 제거.

> ⚠️ agora 는 사내 실명·내부주소 데이터다. "private repo, 나만 본다"여도 **회사 기밀이 개인 클라우드로 나간다**는
> 점은 사내 보안정책 위반 소지가 있다. 위 정책은 그 위험을 인지한 소유자의 선택을 전제로 한 안전장치다.

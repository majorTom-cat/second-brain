#!/usr/bin/env bash
# archive/<project>/chats/raw/ 를 gpg(AES256)로 암호화 → raw.tar.gpg (커밋 대상).
# 평문 raw/ 는 로컬에 그대로 둔다(.gitignore 가 커밋만 막음 → 로컬 브라우징 + 암호화 백업 둘 다).
#
# 사용:  bash .claude/skills/chat-archivist/encrypt.sh <project>
#   (gpg 가 암호를 물어본다. 암호는 비밀번호 관리자에 보관 — 잃으면 복구 불가.)
# 복호:  gpg -d archive/<project>/chats/raw.tar.gpg | tar -x -C archive/<project>/chats
set -euo pipefail
proj="${1:?usage: encrypt.sh <project>}"
dir="archive/${proj}/chats"
[ -d "${dir}/raw" ] || { echo "에러: ${dir}/raw 가 없습니다. 먼저 /archive ${proj} 를 실행하세요."; exit 1; }

tar -C "${dir}" -cf "${dir}/raw.tar" raw
gpg --symmetric --cipher-algo AES256 -o "${dir}/raw.tar.gpg" "${dir}/raw.tar"
rm -f "${dir}/raw.tar"

echo "완료: ${dir}/raw.tar.gpg (커밋 대상)."
echo "평문 ${dir}/raw/ 는 로컬에 남습니다(.gitignore 로 커밋 차단)."
echo "복호: gpg -d ${dir}/raw.tar.gpg | tar -x -C ${dir}"

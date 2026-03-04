#!/bin/bash
# =============================================================
# protect-keystore.sh — Git pre-commit 훅 설치 스크립트
#
# 이 스크립트는 Git pre-commit hook을 설치하여:
#   1. 키스토어 파일 삭제 커밋 방지
#   2. key.properties 커밋 방지 (이중 안전장치)
#   3. 키스토어 경로 변경 감지
#
# 사용법: bash scripts/protect-keystore.sh
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GIT_DIR="$PROJECT_ROOT/.git"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "키스토어 보호 Git Hook 설치"
echo "=========================="

# .git 디렉토리 확인
if [ ! -d "$GIT_DIR" ]; then
    echo -e "${RED}[ERROR]${NC} .git 디렉토리를 찾을 수 없습니다."
    exit 1
fi

HOOKS_DIR="$GIT_DIR/hooks"
mkdir -p "$HOOKS_DIR"

PRE_COMMIT="$HOOKS_DIR/pre-commit"

# 기존 hook이 있으면 백업
if [ -f "$PRE_COMMIT" ]; then
    cp "$PRE_COMMIT" "${PRE_COMMIT}.backup.$(date +%Y%m%d)"
    echo -e "${YELLOW}기존 pre-commit hook 백업 완료${NC}"
fi

cat > "$PRE_COMMIT" << 'HOOK_EOF'
#!/bin/bash
# =============================================================
# Git Pre-Commit Hook — 키스토어 방어
# 자동 설치: bash scripts/protect-keystore.sh
# =============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# 1. 키스토어 파일 삭제 감지
DELETED_KEYSTORES=$(git diff --cached --name-only --diff-filter=D | grep -E '\.(keystore|jks)$' || true)
if [ -n "$DELETED_KEYSTORES" ]; then
    echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ 키스토어 삭제 감지! 커밋 차단             ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "삭제 예정 파일:"
    echo "$DELETED_KEYSTORES" | while read f; do echo "  - $f"; done
    echo ""
    echo -e "키스토어를 삭제하면 Google Play 업데이트가 불가능합니다."
    echo -e "의도적 삭제라면: ${YELLOW}git commit --no-verify${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. key.properties 커밋 방지 (이중 안전장치)
STAGED_SECRETS=$(git diff --cached --name-only | grep -E '(key\.properties|\.keystore|\.jks)$' | grep -v '.gitignore' || true)
if [ -n "$STAGED_SECRETS" ]; then
    echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ 보안 민감 파일 커밋 감지! 차단             ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "커밋 예정 민감 파일:"
    echo "$STAGED_SECRETS" | while read f; do echo "  - $f"; done
    echo ""
    echo -e "이 파일들은 Git에 커밋하면 안 됩니다."
    echo -e ".gitignore에 포함되어 있는지 확인하세요."
    echo -e "의도적 추가라면: ${YELLOW}git commit --no-verify${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. build.gradle에서 키스토어 경로 변경 감지
GRADLE_CHANGED=$(git diff --cached --name-only | grep -E 'build\.gradle' || true)
if [ -n "$GRADLE_CHANGED" ]; then
    # signingConfigs 섹션 변경 감지
    SIGNING_DIFF=$(git diff --cached -- $GRADLE_CHANGED | grep -E '^\+.*storeFile|^\+.*keyAlias|^\+.*storePassword|^\+.*keyPassword' || true)
    if [ -n "$SIGNING_DIFF" ]; then
        echo -e "${YELLOW}╔═══════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ⚠ 서명 설정 변경 감지!                      ║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "변경된 서명 설정:"
        echo "$SIGNING_DIFF"
        echo ""
        echo -e "${YELLOW}키스토어 서명 설정이 변경되었습니다.${NC}"
        echo -e "의도한 변경인지 반드시 확인하세요."
        # 경고만 — 차단하지 않음
    fi
fi

# 4. .gitignore에서 키스토어 관련 항목 제거 감지
GITIGNORE_CHANGED=$(git diff --cached --name-only | grep '.gitignore' || true)
if [ -n "$GITIGNORE_CHANGED" ]; then
    REMOVED_RULES=$(git diff --cached -- .gitignore | grep -E '^\-.*\.(keystore|jks|properties)' || true)
    if [ -n "$REMOVED_RULES" ]; then
        echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ✗ .gitignore 보호 규칙 제거 감지! 차단       ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
        echo ""
        echo "제거된 규칙:"
        echo "$REMOVED_RULES"
        echo ""
        echo -e "키스토어 관련 .gitignore 규칙을 제거하면 위험합니다."
        echo -e "의도적 변경이라면: ${YELLOW}git commit --no-verify${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}커밋이 차단되었습니다. (${ERRORS}개 보안 위반)${NC}"
    exit 1
fi

exit 0
HOOK_EOF

chmod +x "$PRE_COMMIT"

echo -e "${GREEN}[OK]${NC} pre-commit hook 설치 완료: .git/hooks/pre-commit"
echo ""
echo "보호 항목:"
echo "  - 키스토어 파일 삭제 커밋 차단"
echo "  - 보안 민감 파일(key.properties, *.keystore) 커밋 차단"
echo "  - 서명 설정 변경 경고"
echo "  - .gitignore 보호 규칙 제거 차단"
echo ""
echo -e "테스트: ${YELLOW}git commit --dry-run${NC}"
echo ""

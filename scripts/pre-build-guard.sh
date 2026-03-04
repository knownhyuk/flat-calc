#!/bin/bash
# =============================================================
# pre-build-guard.sh — 빌드 전 키스토어 방어 스크립트
#
# 기능:
#   1. 키스토어 파일 존재 확인
#   2. SHA-1 핑거프린트 일치 검증
#   3. 자동 백업 생성 (타임스탬프 포함)
#   4. key.properties 존재 확인
#   5. 키스토어 읽기전용 설정
#
# 사용법: bash scripts/pre-build-guard.sh
# 빌드 전 반드시 실행하세요.
# =============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RELEASE_KS="$PROJECT_ROOT/android/app/release.keystore"
KEY_PROPS="$PROJECT_ROOT/android/key.properties"
BACKUP_DIR="$PROJECT_ROOT/keystore-backup"
EXPECTED_SHA1="76:3C:E1:0D:53:7B:10:0E:C6:82:EC:83:4A:22:3F:EB:25:6C:A0:C2"

ERRORS=0
WARNINGS=0

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     🔐 키스토어 빌드 방어 시스템 v1.0        ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1단계: 핵심 파일 존재 확인 ───
echo -e "${BLUE}[1/5]${NC} 핵심 파일 존재 확인..."

if [ ! -f "$RELEASE_KS" ]; then
    echo -e "  ${RED}✗ FATAL: release.keystore 없음!${NC}"
    echo -e "  → 복구: cp keystore-backup/release.keystore android/app/"
    ERRORS=$((ERRORS + 1))
else
    KS_SIZE=$(stat -c%s "$RELEASE_KS" 2>/dev/null || stat -f%z "$RELEASE_KS" 2>/dev/null || echo "unknown")
    echo -e "  ${GREEN}✓${NC} release.keystore 존재 (${KS_SIZE} bytes)"
fi

if [ ! -f "$KEY_PROPS" ]; then
    echo -e "  ${RED}✗ FATAL: key.properties 없음!${NC}"
    echo -e "  → KEY_MANAGEMENT.md '키스토어 복구 절차' 참조"
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}✓${NC} key.properties 존재"
fi

# ─── 2단계: SHA-1 핑거프린트 검증 ───
echo -e "${BLUE}[2/5]${NC} SHA-1 핑거프린트 검증..."

if [ -f "$RELEASE_KS" ] && [ -f "$KEY_PROPS" ] && command -v keytool &> /dev/null; then
    STORE_PASS=$(grep RELEASE_STORE_PASSWORD "$KEY_PROPS" | cut -d'=' -f2)
    KEY_ALIAS=$(grep RELEASE_KEY_ALIAS "$KEY_PROPS" | cut -d'=' -f2)

    ACTUAL_SHA1=$(keytool -list -keystore "$RELEASE_KS" -storepass "$STORE_PASS" -alias "$KEY_ALIAS" 2>/dev/null | grep "SHA1:" | sed 's/.*SHA1: //' | tr -d '[:space:]')

    if [ -z "$ACTUAL_SHA1" ]; then
        # 다른 포맷 시도
        ACTUAL_SHA1=$(keytool -list -v -keystore "$RELEASE_KS" -storepass "$STORE_PASS" -alias "$KEY_ALIAS" 2>/dev/null | grep "SHA1:" | sed 's/.*SHA1: //' | tr -d '[:space:]')
    fi

    EXPECTED_CLEAN=$(echo "$EXPECTED_SHA1" | tr -d '[:space:]')

    if [ -n "$ACTUAL_SHA1" ]; then
        if [ "$ACTUAL_SHA1" = "$EXPECTED_CLEAN" ]; then
            echo -e "  ${GREEN}✓${NC} SHA-1 일치: $EXPECTED_SHA1"
        else
            echo -e "  ${RED}✗ FATAL: SHA-1 불일치!${NC}"
            echo -e "    기대값: $EXPECTED_SHA1"
            echo -e "    실제값: $ACTUAL_SHA1"
            echo -e "  → 키스토어가 변조되었을 수 있습니다. 백업에서 복구하세요."
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠ SHA-1 추출 실패 — keytool 출력 형식이 다를 수 있음${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
elif ! command -v keytool &> /dev/null; then
    echo -e "  ${YELLOW}⚠ keytool 미설치 — SHA-1 검증 건너뜀${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ─── 3단계: 자동 백업 ───
echo -e "${BLUE}[3/5]${NC} 자동 백업 생성..."

if [ -f "$RELEASE_KS" ]; then
    mkdir -p "$BACKUP_DIR"

    # 기본 백업 (항상 최신 유지)
    cp "$RELEASE_KS" "$BACKUP_DIR/release.keystore"
    echo -e "  ${GREEN}✓${NC} 백업 갱신: keystore-backup/release.keystore"

    # 타임스탬프 백업 (히스토리 보존, 최대 5개 유지)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp "$RELEASE_KS" "$BACKUP_DIR/release.keystore.${TIMESTAMP}.bak"
    echo -e "  ${GREEN}✓${NC} 타임스탬프 백업: release.keystore.${TIMESTAMP}.bak"

    # 오래된 타임스탬프 백업 정리 (최신 5개만 유지)
    cd "$BACKUP_DIR"
    ls -t release.keystore.*.bak 2>/dev/null | tail -n +6 | xargs -r rm -f
    cd "$PROJECT_ROOT"
    echo -e "  ${GREEN}✓${NC} 타임스탬프 백업 최대 5개 유지"
else
    echo -e "  ${YELLOW}⚠ release.keystore 없어 백업 건너뜀${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ─── 4단계: 백업 디렉토리 무결성 확인 ───
echo -e "${BLUE}[4/5]${NC} 백업 무결성 확인..."

if [ -d "$BACKUP_DIR" ]; then
    BACKUP_KS="$BACKUP_DIR/release.keystore"
    if [ -f "$BACKUP_KS" ] && [ -f "$RELEASE_KS" ]; then
        ORIG_HASH=$(sha256sum "$RELEASE_KS" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$RELEASE_KS" 2>/dev/null | cut -d' ' -f1)
        BACKUP_HASH=$(sha256sum "$BACKUP_KS" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$BACKUP_KS" 2>/dev/null | cut -d' ' -f1)
        if [ "$ORIG_HASH" = "$BACKUP_HASH" ]; then
            echo -e "  ${GREEN}✓${NC} 원본-백업 해시 일치"
        else
            echo -e "  ${YELLOW}⚠ 원본-백업 해시 불일치 (방금 갱신됨, 정상일 수 있음)${NC}"
        fi
    fi

    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.keystore "$BACKUP_DIR"/*.jks 2>/dev/null | wc -l)
    echo -e "  ${GREEN}✓${NC} 백업 파일 수: ${BACKUP_COUNT}개"
else
    echo -e "  ${RED}✗ 백업 디렉토리 없음!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ─── 5단계: 파일 보호 설정 ───
echo -e "${BLUE}[5/5]${NC} 파일 보호 설정..."

if [ -f "$RELEASE_KS" ]; then
    # 읽기전용 설정 (쓰기 방지)
    chmod 444 "$RELEASE_KS" 2>/dev/null && \
        echo -e "  ${GREEN}✓${NC} release.keystore → 읽기전용(444) 설정" || \
        echo -e "  ${YELLOW}⚠ 권한 변경 실패 (Windows 환경)${NC}"
fi

if [ -d "$BACKUP_DIR" ]; then
    chmod 444 "$BACKUP_DIR"/release.keystore 2>/dev/null && \
        echo -e "  ${GREEN}✓${NC} 백업 키스토어 → 읽기전용(444) 설정" || \
        echo -e "  ${YELLOW}⚠ 백업 권한 변경 실패 (Windows 환경)${NC}"
fi

# ─── 결과 요약 ───
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}  ✗ 빌드 중단: ${ERRORS}개 치명적 오류 발견${NC}"
    echo -e "  KEY_MANAGEMENT.md를 참조하여 문제를 해결하세요."
    echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}  △ 경고 ${WARNINGS}개 있음, 빌드 진행 가능${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    echo -e "${GREEN}  ✓ 모든 검증 통과 — 빌드 안전${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
    echo ""
    exit 0
fi

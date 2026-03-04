#!/bin/bash
# =============================================================
# 키스토어 검증 스크립트
# 빌드 전 키스토어 파일의 존재 및 유효성을 확인합니다
# 사용법: bash scripts/verify-keystore.sh
# =============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "================================================="
echo "  키스토어 검증 시작"
echo "================================================="
echo ""

ERRORS=0

# 1. key.properties 존재 확인
KEY_PROPS="$PROJECT_ROOT/android/key.properties"
if [ -f "$KEY_PROPS" ]; then
    echo -e "${GREEN}[OK]${NC} key.properties 파일 존재"
else
    echo -e "${RED}[FAIL]${NC} key.properties 파일 없음!"
    echo "     -> KEY_MANAGEMENT.md의 '키스토어 복구 절차'를 참조하세요"
    ERRORS=$((ERRORS + 1))
fi

# 2. Release keystore 존재 확인
RELEASE_KS="$PROJECT_ROOT/android/app/release.keystore"
if [ -f "$RELEASE_KS" ]; then
    echo -e "${GREEN}[OK]${NC} release.keystore 존재 ($(stat -c%s "$RELEASE_KS" 2>/dev/null || stat -f%z "$RELEASE_KS" 2>/dev/null) bytes)"
else
    echo -e "${RED}[FAIL]${NC} release.keystore 없음!"
    echo "     -> keystore-backup/ 디렉토리에서 복원하세요"
    ERRORS=$((ERRORS + 1))
fi

# 3. 백업 디렉토리 확인
BACKUP_DIR="$PROJECT_ROOT/keystore-backup"
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.keystore "$BACKUP_DIR"/*.jks 2>/dev/null | wc -l)
    echo -e "${GREEN}[OK]${NC} 백업 디렉토리 존재 (${BACKUP_COUNT}개 파일)"
else
    echo -e "${YELLOW}[WARN]${NC} 백업 디렉토리 없음! 백업을 생성하세요"
fi

# 4. keytool로 키스토어 유효성 검증
if [ -f "$RELEASE_KS" ] && [ -f "$KEY_PROPS" ]; then
    STORE_PASS=$(grep RELEASE_STORE_PASSWORD "$KEY_PROPS" | cut -d'=' -f2)
    KEY_ALIAS=$(grep RELEASE_KEY_ALIAS "$KEY_PROPS" | cut -d'=' -f2)

    if command -v keytool &> /dev/null; then
        if keytool -list -keystore "$RELEASE_KS" -storepass "$STORE_PASS" -alias "$KEY_ALIAS" > /dev/null 2>&1; then
            echo -e "${GREEN}[OK]${NC} 키스토어 유효성 확인 (alias: $KEY_ALIAS)"
        else
            echo -e "${RED}[FAIL]${NC} 키스토어 비밀번호 또는 alias 불일치!"
            ERRORS=$((ERRORS + 1))
        fi

        # SHA-1 핑거프린트 출력
        echo ""
        echo "  릴리스 키스토어 핑거프린트:"
        keytool -list -keystore "$RELEASE_KS" -storepass "$STORE_PASS" -alias "$KEY_ALIAS" 2>/dev/null | grep -E "SHA1|SHA256" || true
    else
        echo -e "${YELLOW}[WARN]${NC} keytool을 찾을 수 없어 유효성 검증을 건너뜁니다"
    fi
fi

# 5. upload_certificate.pem 확인
CERT="$PROJECT_ROOT/upload_certificate.pem"
if [ -f "$CERT" ]; then
    echo -e "${GREEN}[OK]${NC} upload_certificate.pem 존재"
else
    echo -e "${YELLOW}[WARN]${NC} upload_certificate.pem 없음 (Google Play 업로드 인증서)"
fi

echo ""
echo "================================================="
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}  검증 실패: ${ERRORS}개 오류 발견${NC}"
    echo "  KEY_MANAGEMENT.md를 참조하여 문제를 해결하세요"
    echo "================================================="
    exit 1
else
    echo -e "${GREEN}  검증 완료: 모든 키스토어 정상${NC}"
    echo "================================================="
    exit 0
fi

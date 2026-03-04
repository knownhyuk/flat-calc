# KEY_MANAGEMENT.md — 키스토어 관리 가이드

> **빌드 시 반드시 이 문서를 먼저 참조하세요.**
> 키스토어를 분실하면 Google Play에 동일 패키지로 앱 업데이트가 **영구히 불가능**합니다.

---

## 1. 키스토어 요약 정보

| 항목 | 값 |
|------|-----|
| **앱 패키지명** | `com.ezcalc.pyeong` |
| **앱 이름** | 평수계산기 (flat-calc) |
| **릴리스 키스토어 파일** | `android/app/release.keystore` |
| **키스토어 타입** | PKCS12 |
| **Key Alias** | `flat-calc-key` |
| **서명 알고리즘** | SHA384withRSA (2048-bit) |
| **인증서 주체** | CN=FlatCalc, OU=Mobile, O=FlatCalc, L=Seoul, ST=Seoul, C=KR |
| **유효 기간** | 2026-02-21 ~ 2053-07-09 |
| **SHA-1** | `76:3C:E1:0D:53:7B:10:0E:C6:82:EC:83:4A:22:3F:EB:25:6C:A0:C2` |
| **SHA-256** | `E5:41:1B:B1:54:BB:07:5C:D2:68:78:1A:B0:DC:89:6A:E7:1C:99:75:EB:BA:31:7A:7E:52:83:BC:7C:11:8A:6D` |
| **EAS 키스토어** | `@kwonhyuk__flat-calc.jks` (EAS 빌드 전용) |
| **업로드 인증서** | `upload_certificate.pem` |

---

## 2. 파일 구조

```
flat-calc/
├── android/
│   ├── app/
│   │   ├── release.keystore      ← ★ 릴리스 서명 키 (핵심!)
│   │   └── debug.keystore        ← 디버그 서명 키
│   └── key.properties            ← 서명 비밀번호 (Git 미추적)
├── keystore-backup/              ← ★ 로컬 백업
│   ├── release.keystore
│   ├── release-root.keystore
│   ├── @kwonhyuk__flat-calc.jks
│   └── upload_certificate.pem
├── @kwonhyuk__flat-calc.jks      ← EAS 빌드용
├── upload_certificate.pem        ← Google Play 업로드 인증서
└── scripts/
    └── verify-keystore.sh        ← 키스토어 검증 스크립트
```

---

## 3. 서명 설정 (build.gradle 연동)

비밀번호는 `android/key.properties`에 분리 저장되며, `build.gradle`에서 자동 로드합니다.

**`android/key.properties`** (Git에 커밋되지 않음):
```properties
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=[REDACTED]
RELEASE_KEY_ALIAS=flat-calc-key
RELEASE_KEY_PASSWORD=[REDACTED]
```

---

## 4. 빌드 전 체크리스트

릴리스 빌드 전에 반드시 확인:

- [ ] `android/app/release.keystore` 파일 존재 확인
- [ ] `android/key.properties` 파일 존재 확인
- [ ] 검증 스크립트 실행: `bash scripts/verify-keystore.sh`
- [ ] `keystore-backup/` 디렉토리에 최신 백업 존재 확인

---

## 5. 백업 전략 (3-2-1 규칙)

키스토어는 **절대 분실 불가**합니다. 다음 위치에 반드시 백업하세요:

### 필수 백업 위치

| # | 위치 | 설명 |
|---|------|------|
| 1 | `keystore-backup/` | 프로젝트 내 로컬 백업 |
| 2 | **외부 USB/드라이브** | 물리적 별도 저장 장치 |
| 3 | **클라우드 스토리지** | Google Drive / OneDrive 등 (암호화 권장) |

### 백업 명령어

```bash
# 로컬 백업 갱신
cp android/app/release.keystore keystore-backup/
cp @kwonhyuk__flat-calc.jks keystore-backup/
cp upload_certificate.pem keystore-backup/

# 외부 드라이브 백업 (예: D 드라이브)
cp -r keystore-backup/ /d/flat-calc-keystore-backup/
```

---

## 6. 키스토어 복구 절차

키스토어 파일이 손상되거나 사라진 경우:

### 방법 1: 로컬 백업에서 복구
```bash
cp keystore-backup/release.keystore android/app/release.keystore
```

### 방법 2: key.properties 재생성
```bash
cat > android/key.properties << 'EOF'
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=[REDACTED]
RELEASE_KEY_ALIAS=flat-calc-key
RELEASE_KEY_PASSWORD=[REDACTED]
EOF
```

### 방법 3: 키스토어 완전 분실 시
> Google Play App Signing을 사용 중이라면 Google Play Console에서
> 새 업로드 키를 요청할 수 있습니다.
> Play Console > 앱 무결성 > 업로드 키 재설정 요청

---

## 7. 검증 스크립트 사용법

```bash
# 키스토어 전체 검증
bash scripts/verify-keystore.sh

# 수동으로 핑거프린트 확인
keytool -list -v -keystore android/app/release.keystore -storepass [REDACTED]
```

정상 출력 시 SHA-1이 위 표의 값과 동일해야 합니다.

---

## 8. 보안 주의사항

1. **key.properties는 절대 Git에 커밋하지 마세요** (.gitignore에 등록됨)
2. 키스토어 비밀번호를 Slack, 이메일 등 평문 채널로 공유하지 마세요
3. 키스토어 파일은 `.jks`, `.keystore` 확장자 모두 .gitignore에 등록되어 있으므로, 새 환경에서는 반드시 수동으로 파일을 복사해야 합니다
4. 팀 공유 시에는 암호화된 채널(1Password, Bitwarden 등)을 사용하세요

---

## 9. 새 개발환경 세팅 절차

새 PC나 CI/CD 환경에서 빌드하려면:

```bash
# 1. 백업에서 키스토어 복원
cp [백업위치]/release.keystore android/app/release.keystore

# 2. key.properties 생성
cat > android/key.properties << 'EOF'
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=[REDACTED]
RELEASE_KEY_ALIAS=flat-calc-key
RELEASE_KEY_PASSWORD=[REDACTED]
EOF

# 3. 검증
bash scripts/verify-keystore.sh

# 4. 빌드
cd android && ./gradlew assembleRelease
```

---

## 10. 핑거프린트 참조 (Google Play / Firebase 등록용)

### 업로드 키 (release.keystore — 우리가 관리)
```
SHA-1:   76:3C:E1:0D:53:7B:10:0E:C6:82:EC:83:4A:22:3F:EB:25:6C:A0:C2
SHA-256: E5:41:1B:B1:54:BB:07:5C:D2:68:78:1A:B0:DC:89:6A:E7:1C:99:75:EB:BA:31:7A:7E:52:83:BC:7C:11:8A:6D
```

### 앱 서명 키 (Google Play가 관리)
```
SHA-1:   F6:54:51:99:8E:FA:CA:ED:7D:10:F1:DC:37:18:3C:70:C8:A9:33:E2
```

> **참고:** Google Play App Signing이 활성화되어 있으므로, Play Store에서 배포되는 APK는
> Google의 앱 서명 키(`F6:54:...`)로 재서명됩니다. 로컬 빌드 APK는 업로드 키(`76:3C:...`)로
> 서명되므로, Play Store에서 설치한 앱 위에 로컬 APK를 덮어쓸 수 없습니다.
> 로컬 APK 테스트 시 기존 앱을 먼저 삭제해야 합니다.

Firebase, Google Sign-In, Google Maps API 등에 등록할 때는 **두 SHA-1 모두** 등록하세요.

---

## 11. 키스토어 방어체계

> **빌드 중 키스토어가 유실되거나 변조되는 것을 방지하는 다층 방어 시스템입니다.**

### 방어 레이어 구조

```
┌─────────────────────────────────────────────┐
│  Layer 1: 빌드 전 자동 검증                  │
│  (pre-build-guard.sh)                       │
│  - 파일 존재 확인                             │
│  - SHA-1 핑거프린트 검증                      │
│  - 자동 백업 생성 (타임스탬프)                 │
│  - 읽기전용 권한 설정                         │
├─────────────────────────────────────────────┤
│  Layer 2: Git 커밋 방어                      │
│  (pre-commit hook)                          │
│  - 키스토어 삭제 커밋 차단                    │
│  - key.properties 커밋 차단                  │
│  - .gitignore 보호 규칙 제거 차단             │
│  - 서명 설정(build.gradle) 변경 경고          │
├─────────────────────────────────────────────┤
│  Layer 3: npm 스크립트 연동                   │
│  (package.json)                             │
│  - build:aab → 자동으로 guard 실행 후 빌드    │
│  - build:apk → 자동으로 guard 실행 후 빌드    │
│  - 수동 검증: npm run keystore:verify        │
├─────────────────────────────────────────────┤
│  Layer 4: 백업 전략                          │
│  - 빌드할 때마다 타임스탬프 백업 자동 생성     │
│  - 최신 5개 백업 자동 유지                    │
│  - keystore-backup/ 디렉토리 무결성 검증      │
└─────────────────────────────────────────────┘
```

### 초기 설정 (최초 1회)

```bash
# Git pre-commit hook 설치
bash scripts/protect-keystore.sh
```

### 빌드 명령어 (방어체계 자동 연동)

```bash
# AAB 빌드 (Play Store 업로드용) — 자동으로 키스토어 검증 후 빌드
npm run build:aab

# APK 빌드 — 자동으로 키스토어 검증 후 빌드
npm run build:apk

# 키스토어만 수동 검증
npm run keystore:verify

# 빌드 전 전체 방어 점검
npm run prebuild:guard
```

### 스크립트 설명

| 스크립트 | 파일 | 역할 |
|---------|------|------|
| `pre-build-guard.sh` | `scripts/` | 빌드 전 키스토어 검증 + 자동 백업 + 보호 설정 |
| `verify-keystore.sh` | `scripts/` | 키스토어 존재/유효성만 빠르게 확인 |
| `protect-keystore.sh` | `scripts/` | Git pre-commit hook 설치 |

---

## 12. 버전업 체크리스트

버전을 올릴 때 반드시 아래 순서를 따르세요:

### 단계별 절차

1. **키스토어 검증 먼저 실행**
   ```bash
   npm run prebuild:guard
   ```

2. **버전 번호 변경** (3곳 동시 변경 필수)
   - `app.json` → `expo.version`
   - `android/app/build.gradle` → `versionName`, `versionCode`
   - `package.json` → `version`

3. **빌드**
   ```bash
   npm run build:aab
   ```

4. **AAB 파일 확인**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

5. **Google Play Console에 업로드**

### 주의사항
- `versionCode`는 반드시 이전보다 큰 정수여야 합니다 (현재: 6)
- `expo prebuild --clean`을 실행하면 android/ 폴더가 재생성되므로 **키스토어가 삭제됩니다!**
  - 반드시 `pre-build-guard.sh`를 먼저 실행하여 백업 확인 후 진행
  - prebuild 후 `cp keystore-backup/release.keystore android/app/`로 복원

### ⚠️ 위험 명령어 목록

다음 명령어는 키스토어를 삭제할 수 있으므로 주의하세요:

| 명령어 | 위험 | 대응 |
|--------|------|------|
| `expo prebuild --clean` | android/ 전체 재생성 → 키스토어 삭제 | 실행 전 백업 확인, 실행 후 복원 |
| `rm -rf android/` | 키스토어 포함 삭제 | 절대 실행 금지 |
| `git clean -fd` | 미추적 파일 삭제 | 키스토어가 .gitignore에 있으므로 삭제됨 |
| `git checkout -- android/` | 키스토어 변경 취소 | 키스토어가 Git에 없으므로 삭제됨 |

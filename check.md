# 평수계산기 - 체크리스트

## AdMob 광고 연동 (EAS Build 전환 시)

### 현재 상태
- `react-native-google-mobile-ads` 패키지 설치 완료
- `app.json`에 앱 ID 등록 완료
- `AdBanner.tsx`에서 import 주석 처리 (Expo Go 호환 위해)
- Expo Go에서는 "AD" 플레이스홀더만 표시

### EAS Build 전환 시 해야 할 일

1. **Expo 계정 로그인**
   ```bash
   npx eas-cli login
   ```

2. **Development Build 생성**
   ```bash
   eas build --profile development --platform android
   ```

3. **AdBanner.tsx 수정** - 주석 해제하여 실제 광고 활성화
   ```tsx
   import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
   const AD_UNIT_ID = 'ca-app-pub-1999482832801395/1222654427';
   ```

4. **테스트 기기 등록** - AdMob 콘솔에서 테스트 기기 등록 (개발 중 정책 위반 방지)

5. **AdMob 정책 준수 확인**
   - 광고가 콘텐츠와 겹치지 않는지
   - 실수로 클릭 유도하는 배치가 아닌지
   - 앱 콘텐츠가 AdMob 정책에 부합하는지

### 광고 ID 정보
- 앱 ID: `ca-app-pub-1999482832801395~9790585179`
- 배너 광고 단위 ID: `ca-app-pub-1999482832801395/1222654427`

---

## Production 출시 전 체크

- [ ] EAS Build production 프로필로 빌드
- [ ] AdMob 테스트 광고 → 실제 광고 전환 확인
- [ ] 앱 아이콘 / 스플래시 이미지 교체
- [ ] Google Play Console에 앱 등록
- [ ] 개인정보처리방침 URL 준비 (AdMob 필수)

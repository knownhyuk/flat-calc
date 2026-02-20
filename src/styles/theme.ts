// 통일된 디자인 시스템 - Warm Neutral + Teal Accent
export const colors = {
  // Accent - 하나의 포인트 컬러로 통일
  accent: '#0D9488',        // teal-600
  accentLight: '#CCFBF1',   // teal-100
  accentSoft: '#F0FDFA',    // teal-50

  // Surface 계층 (회색 한 톤으로 통일)
  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceDim: '#F1F4F6',
  border: '#E2E8F0',

  // 패널 - 동일 톤, 활성만 구분
  panelBg: '#FFFFFF',
  panelActiveBg: '#F0FDFA',
  panelBorder: '#E2E8F0',
  panelActiveBorder: '#0D9488',

  // 키패드 - 배경과 구분되는 한 톤
  keyBg: '#FFFFFF',
  keyText: '#1E293B',
  keySpecialBg: '#F1F4F6',
  keySpecialText: '#64748B',
  keyDeleteBg: '#FEF2F2',
  keyDeleteText: '#DC2626',

  // 텍스트 - 3단계만 사용
  text: '#1E293B',          // slate-800
  textSub: '#64748B',       // slate-500
  textDim: '#94A3B8',       // slate-400

  // 버튼
  buttonBg: '#0D9488',
  buttonText: '#FFFFFF',

  // 탭
  tabActiveBg: '#0D9488',
  tabActiveText: '#FFFFFF',
  tabInactiveText: '#64748B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  header: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  panelValue: {
    fontSize: 26,
    fontWeight: '700' as const,
  },
  panelUnit: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  keypad: {
    fontSize: 22,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  tab: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
};

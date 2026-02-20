// 평수계산기 변환 공식
const PYEONG_TO_SQM = 3.305785;
const PYEONG_TO_HA = 0.0003305785;
const PYEONG_TO_AC = 0.000816887;

// 평 → 제곱미터
export const pyeongToSqm = (pyeong: number): number => pyeong * PYEONG_TO_SQM;

// 제곱미터 → 평
export const sqmToPyeong = (sqm: number): number => sqm / PYEONG_TO_SQM;

// 평 → 헥타르
export const pyeongToHa = (pyeong: number): number => pyeong * PYEONG_TO_HA;

// 헥타르 → 평
export const haToPyeong = (ha: number): number => ha / PYEONG_TO_HA;

// 평 → 에이커
export const pyeongToAc = (pyeong: number): number => pyeong * PYEONG_TO_AC;

// 에이커 → 평
export const acToPyeong = (ac: number): number => ac / PYEONG_TO_AC;

// 넓이 × 높이 → 평
export const areaToPyeong = (width: number, height: number): number =>
  (width * height) / PYEONG_TO_SQM;

// 숫자 포맷: 천 단위 콤마 + 소수점
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (isNaN(num) || !isFinite(num)) return '0';
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decPart && parseInt(decPart) > 0) {
    // 불필요한 뒤의 0 제거
    const trimmed = decPart.replace(/0+$/, '');
    return `${formatted}.${trimmed}`;
  }
  return formatted;
};

export type TabType = 'sqm' | 'ha' | 'ac' | 'area' | 'kukpyeong';

// 국민평형 데이터
export interface KukpyeongType {
  label: string;       // "59타입", "84타입"
  sqm: number;         // 전용면적 m²
  pyeong: number;      // 약 ~평
  supply: string;      // 공급면적 참고
}

export const KUKPYEONG_LIST: KukpyeongType[] = [
  { label: '84타입', sqm: 84, pyeong: 25, supply: '약 109~115m²' },
  { label: '59타입', sqm: 59, pyeong: 18, supply: '약 74~81m²' },
  { label: '39타입', sqm: 39, pyeong: 12, supply: '약 49~52m²' },
  { label: '49타입', sqm: 49, pyeong: 15, supply: '약 62~65m²' },
  { label: '74타입', sqm: 74, pyeong: 22, supply: '약 96~100m²' },
  { label: '101타입', sqm: 101, pyeong: 31, supply: '약 132~138m²' },
  { label: '114타입', sqm: 114, pyeong: 34, supply: '약 148~155m²' },
  { label: '135타입', sqm: 135, pyeong: 41, supply: '약 175~182m²' },
  { label: '176타입', sqm: 176, pyeong: 53, supply: '약 228~235m²' },
];

export interface TabConfig {
  id: TabType;
  label: string;
  leftUnit: string;
  rightUnit: string;
  leftToRight: (val: number) => number;
  rightToLeft: (val: number) => number;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'sqm',
    label: '제곱미터\nm²↔평',
    leftUnit: 'm²',
    rightUnit: '평',
    leftToRight: sqmToPyeong,
    rightToLeft: pyeongToSqm,
  },
  {
    id: 'ha',
    label: '헥타르\nha↔평',
    leftUnit: 'ha',
    rightUnit: '평',
    leftToRight: haToPyeong,
    rightToLeft: pyeongToHa,
  },
  {
    id: 'ac',
    label: '에이커\nac↔평',
    leftUnit: 'ac',
    rightUnit: '평',
    leftToRight: acToPyeong,
    rightToLeft: pyeongToAc,
  },
  {
    id: 'area',
    label: '면적계산\n넓이×높이',
    leftUnit: 'm(넓이)',
    rightUnit: 'm(높이)',
    leftToRight: (val: number) => val,
    rightToLeft: (val: number) => val,
  },
  {
    id: 'kukpyeong',
    label: '국민평형\n아파트',
    leftUnit: '',
    rightUnit: '',
    leftToRight: (val: number) => val,
    rightToLeft: (val: number) => val,
  },
];

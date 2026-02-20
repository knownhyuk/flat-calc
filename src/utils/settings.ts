import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabType } from './converter';

const SETTINGS_KEY = '@flat_calc_settings';

export interface Settings {
  /** 탭 전환 시 기본 입력 패널: 'right'=평, 'left'=m²/ha/ac */
  defaultPanel: 'left' | 'right';
  /** 앱 시작 시 초기 탭 */
  initialTab: TabType;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultPanel: 'right',
  initialTab: 'sqm',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

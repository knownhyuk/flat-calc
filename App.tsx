import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import TabBar from './src/components/TabBar';
import ConversionPanel from './src/components/ConversionPanel';
import NumberPad from './src/components/NumberPad';
import ActionButton from './src/components/ActionButton';
import SettingsModal from './src/components/SettingsModal';
import AdBanner from './src/components/AdBanner';
import { colors, spacing, borderRadius, typography } from './src/styles/theme';
import {
  TabType,
  TAB_CONFIGS,
  formatNumber,
  areaToPyeong,
} from './src/utils/converter';
import { Settings, DEFAULT_SETTINGS, loadSettings, saveSettings } from './src/utils/settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sqm');
  const [activePanel, setActivePanel] = useState<'left' | 'right'>('right');
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 앱 시작 시 설정 로드
  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setActiveTab(loaded.initialTab);
      if (loaded.initialTab === 'area') {
        setActivePanel('left');
      } else {
        setActivePanel(loaded.defaultPanel);
      }
    });
  }, []);

  const handleSettingsChange = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const tabConfig = useMemo(
    () => TAB_CONFIGS.find((t) => t.id === activeTab)!,
    [activeTab]
  );

  const leftResult = useMemo(() => {
    if (activeTab === 'area' || activePanel === 'left') return '';
    const val = parseFloat(rightValue);
    if (isNaN(val) || val === 0) return '0';
    return formatNumber(tabConfig.rightToLeft(val), 4);
  }, [activePanel, rightValue, tabConfig, activeTab]);

  const rightResult = useMemo(() => {
    if (activeTab === 'area' || activePanel === 'right') return '';
    const val = parseFloat(leftValue);
    if (isNaN(val) || val === 0) return '0';
    return formatNumber(tabConfig.leftToRight(val), 4);
  }, [activePanel, leftValue, tabConfig, activeTab]);

  const buttonLabel = useMemo(() => {
    if (activeTab === 'area') {
      const w = parseFloat(leftValue) || 0;
      const h = parseFloat(rightValue) || 0;
      if (w > 0 && h > 0) {
        return `${formatNumber(w * h)} m² = ${formatNumber(areaToPyeong(w, h))} 평`;
      }
      return '넓이 × 높이 → 평수 변환';
    }
    if (activePanel === 'left') {
      return `${tabConfig.leftUnit} → ${tabConfig.rightUnit} 변환`;
    }
    return `${tabConfig.rightUnit} → ${tabConfig.leftUnit} 변환`;
  }, [activeTab, activePanel, leftValue, rightValue, tabConfig]);

  const handlePanelPress = useCallback(
    (panel: 'left' | 'right') => {
      if (panel === activePanel || activeTab === 'area') {
        setActivePanel(panel);
        return;
      }
      // 패널 전환 시 결과값을 입력값으로 넘김 (콤마 없는 raw 숫자)
      if (panel === 'left') {
        const val = parseFloat(rightValue);
        if (!isNaN(val) && val !== 0) {
          const raw = tabConfig.rightToLeft(val);
          const str = parseFloat(raw.toFixed(4)).toString();
          setLeftValue(str);
        } else {
          setLeftValue('');
        }
        setRightValue('');
      } else {
        const val = parseFloat(leftValue);
        if (!isNaN(val) && val !== 0) {
          const raw = tabConfig.leftToRight(val);
          const str = parseFloat(raw.toFixed(4)).toString();
          setRightValue(str);
        } else {
          setRightValue('');
        }
        setLeftValue('');
      }
      setActivePanel(panel);
    },
    [activePanel, activeTab, leftValue, rightValue, tabConfig]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const panel = tab === 'area' ? 'left' : settingsRef.current.defaultPanel;
    setActivePanel(panel);
    setLeftValue('');
    setRightValue('');
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      const isLeft = activePanel === 'left';
      const setter = isLeft ? setLeftValue : setRightValue;
      const otherSetter = isLeft ? setRightValue : setLeftValue;
      if (activeTab !== 'area') {
        otherSetter('');
      }
      setter((prev) => {
        if (key === 'backspace') return prev.slice(0, -1);
        if (key === '.') {
          if (prev.includes('.')) return prev;
          return prev === '' ? '0.' : prev + '.';
        }
        if (key === '00') {
          if (prev === '' || prev === '0') return '0';
          if (prev.length >= 11) return prev;
          return prev + '00';
        }
        if (prev === '0') return key;
        if (prev.length >= 12) return prev;
        return prev + key;
      });
    },
    [activePanel, activeTab]
  );

  const clearFlash = useRef(new Animated.Value(0)).current;

  const handleClear = useCallback(() => {
    setLeftValue('');
    setRightValue('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // 버튼 깜빡임 효과
    clearFlash.setValue(1);
    Animated.timing(clearFlash, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [clearFlash]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>평수계산기</Text>
            <View style={styles.headerRight}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => setSettingsVisible(true)}
              >
                <Text style={styles.iconText}>⚙</Text>
              </Pressable>
              <Pressable onPress={handleClear}>
                <Animated.View style={[
                  styles.clearBtn,
                  {
                    backgroundColor: clearFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: [colors.surface, colors.accent],
                    }),
                    borderColor: clearFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: [colors.border, colors.accent],
                    }),
                  },
                ]}>
                  <Animated.Text style={[
                    styles.clearText,
                    {
                      color: clearFlash.interpolate({
                        inputRange: [0, 1],
                        outputRange: [colors.textSub, '#FFFFFF'],
                      }),
                    },
                  ]}>초기화</Animated.Text>
                </Animated.View>
              </Pressable>
            </View>
          </View>

          {/* 탭 */}
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

          {/* 변환 패널 */}
          <ConversionPanel
            activeTab={activeTab}
            activePanel={activePanel}
            leftValue={leftValue}
            rightValue={rightValue}
            leftUnit={tabConfig.leftUnit}
            rightUnit={tabConfig.rightUnit}
            leftResult={leftResult}
            rightResult={rightResult}
            onPanelPress={handlePanelPress}
          />

          {activeTab !== 'kukpyeong' && (
            <>
              <View style={styles.spacer} />
              <NumberPad onPress={handleKeyPress} />
              <View style={styles.bottom}>
                <ActionButton label={buttonLabel} onPress={() => {}} />
              </View>
            </>
          )}
        </View>

        {/* AdMob 배너 */}
        <AdBanner />
      </SafeAreaView>

      {/* 설정 모달 */}
      <SettingsModal
        visible={settingsVisible}
        settings={settings}
        onClose={() => setSettingsVisible(false)}
        onChange={handleSettingsChange}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.header,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.textSub,
  },
  clearBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  clearText: {
    ...typography.tab,
    color: colors.textSub,
  },
  spacer: {
    height: spacing.lg,
  },
  bottom: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});

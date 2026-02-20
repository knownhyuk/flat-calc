import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { TabType, formatNumber, areaToPyeong, KUKPYEONG_LIST, sqmToPyeong } from '../utils/converter';

interface ConversionPanelProps {
  activeTab: TabType;
  activePanel: 'left' | 'right';
  leftValue: string;
  rightValue: string;
  leftUnit: string;
  rightUnit: string;
  leftResult: string;
  rightResult: string;
  onPanelPress: (panel: 'left' | 'right') => void;
}

export default function ConversionPanel({
  activeTab,
  activePanel,
  leftValue,
  rightValue,
  leftUnit,
  rightUnit,
  leftResult,
  rightResult,
  onPanelPress,
}: ConversionPanelProps) {
  if (activeTab === 'kukpyeong') {
    return <KukpyeongPanel />;
  }

  if (activeTab === 'area') {
    return (
      <AreaPanel
        leftValue={leftValue}
        rightValue={rightValue}
        activePanel={activePanel}
        onPanelPress={onPanelPress}
      />
    );
  }

  const isLeftActive = activePanel === 'left';

  // 결과바: 항상 왼쪽단위(m²/ha/ac) = 오른쪽단위(평) 순서 고정
  const leftDisplay = isLeftActive
    ? (leftValue ? formatNumber(parseFloat(leftValue) || 0) : '0')
    : (leftResult || '0');
  const rightDisplay = isLeftActive
    ? (rightResult || '0')
    : (rightValue ? formatNumber(parseFloat(rightValue) || 0) : '0');

  return (
    <View style={styles.areaWrap}>
      <View style={styles.container}>
        <Panel
          unit={leftUnit}
          value={isLeftActive ? (leftValue || '0') : leftResult}
          isActive={isLeftActive}
          isInput={isLeftActive}
          onPress={() => onPanelPress('left')}
        />
        <View style={styles.divider}>
          <Text style={styles.dividerIcon}>⇄</Text>
        </View>
        <Panel
          unit={rightUnit}
          value={!isLeftActive ? (rightValue || '0') : rightResult}
          isActive={!isLeftActive}
          isInput={!isLeftActive}
          onPress={() => onPanelPress('right')}
        />
      </View>

      <View style={styles.resultBar}>
        <Text
          style={isLeftActive ? styles.resultText : styles.resultHighlight}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {leftDisplay} {leftUnit}
        </Text>
        <Text style={styles.resultEquals}>=</Text>
        <Text
          style={isLeftActive ? styles.resultHighlight : styles.resultText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {rightDisplay} {rightUnit}
        </Text>
      </View>
    </View>
  );
}

function Panel({
  unit,
  value,
  isActive,
  isInput,
  onPress,
}: {
  unit: string;
  value: string;
  isActive: boolean;
  isInput: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.panel, isActive && styles.panelActive]}
      onPress={onPress}
    >
      <Text style={[styles.unitLabel, isActive && styles.unitLabelActive]}>
        {unit}
      </Text>
      <Text
        style={[styles.value, isInput ? styles.valueInput : styles.valueResult]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.4}
      >
        {value}
      </Text>
      <Text style={styles.hint}>
        {isInput ? '입력' : '결과'}
      </Text>
    </Pressable>
  );
}

function AreaPanel({
  leftValue,
  rightValue,
  activePanel,
  onPanelPress,
}: {
  leftValue: string;
  rightValue: string;
  activePanel: 'left' | 'right';
  onPanelPress: (panel: 'left' | 'right') => void;
}) {
  const w = parseFloat(leftValue) || 0;
  const h = parseFloat(rightValue) || 0;
  const sqm = w * h;
  const pyeong = sqm > 0 ? areaToPyeong(w, h) : 0;

  return (
    <View style={styles.areaWrap}>
      <View style={styles.container}>
        <Panel
          unit="넓이 (m)"
          value={leftValue || '0'}
          isActive={activePanel === 'left'}
          isInput={true}
          onPress={() => onPanelPress('left')}
        />

        <View style={styles.divider}>
          <Text style={styles.dividerIcon}>×</Text>
        </View>

        <Panel
          unit="높이 (m)"
          value={rightValue || '0'}
          isActive={activePanel === 'right'}
          isInput={true}
          onPress={() => onPanelPress('right')}
        />
      </View>

      <View style={styles.resultBar}>
        <Text style={styles.resultText}>
          {formatNumber(sqm)} m²
        </Text>
        <Text style={styles.resultEquals}>=</Text>
        <Text
          style={styles.resultHighlight}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatNumber(pyeong)} 평
        </Text>
      </View>
    </View>
  );
}

function KukpyeongPanel() {
  return (
    <ScrollView
      style={styles.kukScroll}
      contentContainerStyle={styles.kukContent}
      showsVerticalScrollIndicator={false}
    >
      {KUKPYEONG_LIST.map((item) => {
        const exactPyeong = sqmToPyeong(item.sqm);
        return (
          <View key={item.label} style={styles.kukCard}>
            <View style={styles.kukRow}>
              <Text style={styles.kukType}>
                {item.label}
              </Text>
              <View style={styles.kukDetail}>
                <Text style={styles.kukSqm}>전용 {item.sqm}m²</Text>
                <Text style={styles.kukPyeong}>
                  {formatNumber(exactPyeong, 1)}평
                </Text>
              </View>
            </View>
            <Text style={styles.kukSupply}>공급면적 {item.supply}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 0,
  },
  panel: {
    flex: 1,
    height: 100,
    backgroundColor: colors.panelBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  panelActive: {
    backgroundColor: colors.panelActiveBg,
    borderColor: colors.panelActiveBorder,
  },
  unitLabel: {
    ...typography.panelUnit,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  unitLabelActive: {
    color: colors.accent,
  },
  value: {
    ...typography.panelValue,
    color: colors.textDim,
    height: 34,
    lineHeight: 34,
  },
  valueInput: {
    color: colors.text,
  },
  valueResult: {
    color: colors.accent,
  },
  hint: {
    ...typography.caption,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  divider: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerIcon: {
    fontSize: 16,
    color: colors.textDim,
  },
  // Area
  areaWrap: {
    gap: spacing.md,
  },
  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accentLight,
    gap: spacing.sm,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSub,
  },
  resultEquals: {
    fontSize: 14,
    color: colors.textDim,
  },
  resultHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  // 국민평형
  kukScroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  kukContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  kukCard: {
    backgroundColor: colors.panelBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  kukRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kukType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  kukDetail: {
    alignItems: 'flex-end',
  },
  kukSqm: {
    fontSize: 12,
    color: colors.textSub,
  },
  kukPyeong: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  kukSupply: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
});

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';
import { TabType, TAB_CONFIGS } from '../utils/converter';
import { Settings } from '../utils/settings';

interface SettingsModalProps {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
  onChange: (settings: Settings) => void;
}

const PANEL_OPTIONS: { value: 'left' | 'right'; label: string }[] = [
  { value: 'right', label: '평 (기본)' },
  { value: 'left', label: 'm² / ha / ac' },
];

const TAB_OPTIONS: { value: TabType; label: string }[] = TAB_CONFIGS.map((t) => ({
  value: t.id,
  label: t.id === 'sqm' ? '제곱미터 m²↔평'
    : t.id === 'ha' ? '헥타르 ha↔평'
    : t.id === 'ac' ? '에이커 ac↔평'
    : t.id === 'area' ? '면적계산 넓이×높이'
    : '국민평형 아파트',
}));

export default function SettingsModal({
  visible,
  settings,
  onClose,
  onChange,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>설정</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* 기본 입력 단위 */}
            <Text style={styles.sectionLabel}>기본 입력 단위</Text>
            <Text style={styles.sectionDesc}>탭 전환 시 선택되는 기본 입력</Text>
            <View style={styles.optionGroup}>
              {PANEL_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.option,
                    settings.defaultPanel === opt.value && styles.optionActive,
                  ]}
                  onPress={() => onChange({ ...settings, defaultPanel: opt.value })}
                >
                  <View style={[
                    styles.radio,
                    settings.defaultPanel === opt.value && styles.radioActive,
                  ]}>
                    {settings.defaultPanel === opt.value && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    settings.defaultPanel === opt.value && styles.optionTextActive,
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 시작 탭 */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>시작 탭</Text>
            <Text style={styles.sectionDesc}>앱 실행 시 처음 표시되는 탭</Text>
            <View style={[styles.optionGroup, { paddingBottom: 20 }]}>
              {TAB_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.option,
                    settings.initialTab === opt.value && styles.optionActive,
                  ]}
                  onPress={() => onChange({ ...settings, initialTab: opt.value })}
                >
                  <View style={[
                    styles.radio,
                    settings.initialTab === opt.value && styles.radioActive,
                  ]}>
                    {settings.initialTab === opt.value && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    settings.initialTab === opt.value && styles.optionTextActive,
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 120,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSub,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioActive: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSub,
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});

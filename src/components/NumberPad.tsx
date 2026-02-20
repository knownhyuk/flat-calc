import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

interface NumberPadProps {
  onPress: (key: string) => void;
}

const KEYS = [
  ['7', '8', '9', '←'],
  ['4', '5', '6', '.'],
  ['1', '2', '3', '00'],
  ['0'],
];

export default function NumberPad({ onPress }: NumberPadProps) {
  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(key === '←' ? 'backspace' : key);
  };

  return (
    <View style={styles.container}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            const isDel = key === '←';
            const isSpecial = key === '.' || key === '00';
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.key,
                  isDel && styles.keyDel,
                  isSpecial && styles.keySp,
                  pressed && styles.keyPressed,
                ]}
                onPress={() => handlePress(key)}
              >
                <Text style={[
                  styles.keyText,
                  isDel && styles.keyDelText,
                  isSpecial && styles.keySpText,
                ]}>
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  key: {
    flex: 1,
    height: 56,
    backgroundColor: colors.keyBg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySp: {
    backgroundColor: colors.keySpecialBg,
    borderColor: colors.border,
  },
  keyDel: {
    backgroundColor: colors.keyDeleteBg,
    borderColor: '#FECACA',
  },
  keyPressed: {
    backgroundColor: colors.surfaceDim,
  },
  keyText: {
    ...typography.keypad,
    color: colors.keyText,
  },
  keySpText: {
    color: colors.keySpecialText,
  },
  keyDelText: {
    color: colors.keyDeleteText,
  },
});

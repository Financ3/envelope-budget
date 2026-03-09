import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Envelope } from '../types';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  visible: boolean;
  envelope: Envelope | null;
  onSubmit: (amount: number, note: string) => void;
  onClose: () => void;
}

export function ExpenseModal({ visible, envelope, onSubmit, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setNote('');
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [visible]);

  function handleSubmit() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid expense amount.');
      return;
    }
    onSubmit(parsed, note.trim());
  }

  if (!envelope) return null;

  const overBudget = envelope.remaining_amount < 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{envelope.name}</Text>
          <Text style={[styles.balance, overBudget && styles.balanceOver]}>
            {overBudget ? 'Over by ' : 'Remaining '}
            <Text style={styles.balanceAmount}>
              ${Math.abs(envelope.remaining_amount).toFixed(2)}
            </Text>
          </Text>

          <Text style={styles.label}>Expense Amount</Text>
          <TextInput
            ref={amountRef}
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />

          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="What was this for?"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.submit]} onPress={handleSubmit}>
              <Text style={styles.submitText}>Subtract</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  balance: {
    ...typography.body,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  balanceOver: {
    color: colors.danger,
  },
  balanceAmount: {
    fontWeight: '700',
  },
  label: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submit: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  submitText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});

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
  envelope?: Envelope | null;
  onSave: (name: string, planned_amount: number) => void;
  onClose: () => void;
}

export function EnvelopeFormModal({ visible, envelope, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName(envelope?.name ?? '');
      setAmount(envelope ? String(envelope.planned_amount) : '');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [visible, envelope]);

  function handleSave() {
    const trimmed = name.trim();
    const parsed = parseFloat(amount);
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter an envelope name.');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid planned amount.');
      return;
    }
    onSave(trimmed, parsed);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{envelope ? 'Edit Envelope' : 'New Envelope'}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            ref={nameRef}
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Groceries"
            placeholderTextColor={colors.muted}
            returnKeyType="next"
          />

          <Text style={styles.label}>Monthly Budget</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.save]} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
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
    marginBottom: spacing.lg,
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
  save: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  saveText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});

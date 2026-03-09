import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBudget } from '../../src/BudgetContext';
import { EnvelopeFormModal } from '../../src/components/EnvelopeFormModal';
import { ExpenseModal } from '../../src/components/ExpenseModal';
import { Envelope } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const { envelopes, addEnvelope, updateEnvelope, deleteEnvelope, subtractExpense, loaded } =
    useBudget();

  const [showForm, setShowForm] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<Envelope | null>(null);
  const [expenseEnvelope, setExpenseEnvelope] = useState<Envelope | null>(null);

  function handleFormSave(name: string, planned_amount: number) {
    if (editingEnvelope) {
      updateEnvelope({
        ...editingEnvelope,
        name,
        planned_amount,
        remaining_amount: planned_amount - editingEnvelope.spent_amount,
      });
    } else {
      addEnvelope(name, planned_amount);
    }
    setShowForm(false);
    setEditingEnvelope(null);
  }

  function handleEdit(envelope: Envelope) {
    setEditingEnvelope(envelope);
    setShowForm(true);
  }

  function handleDelete(envelope: Envelope) {
    Alert.alert('Delete Envelope', `Delete "${envelope.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEnvelope(envelope.id) },
    ]);
  }

  function handleExpenseSubmit(amount: number, note: string) {
    if (!expenseEnvelope) return;
    subtractExpense(expenseEnvelope.id, amount, note);
    setExpenseEnvelope(null);
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Envelopes</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {envelopes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No envelopes yet</Text>
          <Text style={styles.muted}>Tap "+ Add" to create your first budget envelope.</Text>
        </View>
      ) : (
        <FlatList
          data={envelopes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EnvelopeCard
              envelope={item}
              onPress={() => setExpenseEnvelope(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <EnvelopeFormModal
        visible={showForm}
        envelope={editingEnvelope}
        onSave={handleFormSave}
        onClose={() => {
          setShowForm(false);
          setEditingEnvelope(null);
        }}
      />

      <ExpenseModal
        visible={expenseEnvelope !== null}
        envelope={expenseEnvelope}
        onSubmit={handleExpenseSubmit}
        onClose={() => setExpenseEnvelope(null)}
      />
    </SafeAreaView>
  );
}

interface CardProps {
  envelope: Envelope;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function EnvelopeCard({ envelope, onPress, onEdit, onDelete }: CardProps) {
  const pct =
    envelope.planned_amount > 0
      ? Math.min(envelope.spent_amount / envelope.planned_amount, 1)
      : 0;
  const overBudget = envelope.remaining_amount < 0;
  const barColor = pct >= 1 ? colors.danger : pct >= 0.8 ? colors.warning : colors.success;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {envelope.name}
        </Text>
        <View style={styles.cardActions}>
          <Pressable onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
            <Text style={styles.actionEdit}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
            <Text style={styles.actionDelete}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cardAmounts}>
        <View>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={[styles.amount, overBudget && styles.amountOver]}>
            ${envelope.remaining_amount.toFixed(2)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amountLabel}>Spent / Planned</Text>
          <Text style={styles.amountSub}>
            ${envelope.spent_amount.toFixed(2)} / ${envelope.planned_amount.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <View
          style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  muted: { ...typography.body, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardName: { ...typography.h3, color: colors.text, flex: 1, marginRight: spacing.sm },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  actionEdit: { fontSize: 13, fontWeight: '600', color: colors.primary },
  actionDelete: { fontSize: 13, fontWeight: '600', color: colors.danger },
  cardAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  amountLabel: { ...typography.label, color: colors.muted, marginBottom: 2 },
  amount: { fontSize: 22, fontWeight: '700', color: colors.success },
  amountOver: { color: colors.danger },
  amountSub: { fontSize: 14, color: colors.muted, fontWeight: '500' },
  barBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});

import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useBudget } from '../../src/BudgetContext';
import { Envelope } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function AnalyticsScreen() {
  const { envelopes, resetMonth } = useBudget();

  const totalPlanned = envelopes.reduce((s, e) => s + e.planned_amount, 0);
  const totalSpent = envelopes.reduce((s, e) => s + e.spent_amount, 0);
  const totalRemaining = totalPlanned - totalSpent;

  function confirmReset() {
    Alert.alert(
      'Reset This Month?',
      'Are you sure you want to reset this month?\nAll spending data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetMonth },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <FlatList
        data={envelopes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <SummaryCard
              totalPlanned={totalPlanned}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
            />
            {envelopes.length > 0 && (
              <Text style={styles.sectionLabel}>Envelope Breakdown</Text>
            )}
          </>
        }
        renderItem={({ item }) => <BreakdownRow envelope={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No envelopes yet. Create one on the Envelopes tab.
            </Text>
          </View>
        }
        ListFooterComponent={
          envelopes.length > 0 ? (
            <Pressable style={styles.resetBtn} onPress={confirmReset}>
              <Text style={styles.resetText}>Reset Month</Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  totalPlanned,
  totalSpent,
  totalRemaining,
}: {
  totalPlanned: number;
  totalSpent: number;
  totalRemaining: number;
}) {
  const over = totalRemaining < 0;
  const pct = totalPlanned > 0 ? Math.min(totalSpent / totalPlanned, 1) : 0;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Monthly Summary</Text>
      <View style={styles.metricsRow}>
        <Metric label="Planned" value={totalPlanned} color={colors.primary} />
        <Metric label="Spent" value={totalSpent} color={colors.warning} />
        <Metric
          label="Remaining"
          value={totalRemaining}
          color={over ? colors.danger : colors.success}
        />
      </View>
      {totalPlanned > 0 && (
        <>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${pct * 100}%`,
                  backgroundColor: over ? colors.danger : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.pctText}>
            {Math.round(pct * 100)}% of budget used
          </Text>
        </>
      )}
    </View>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>${Math.abs(value).toFixed(2)}</Text>
    </View>
  );
}

function BreakdownRow({ envelope }: { envelope: Envelope }) {
  const pct =
    envelope.planned_amount > 0
      ? Math.min(envelope.spent_amount / envelope.planned_amount, 1)
      : 0;
  const over = envelope.remaining_amount < 0;
  const barColor = pct >= 1 ? colors.danger : pct >= 0.8 ? colors.warning : colors.success;

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.rowName} numberOfLines={1}>
          {envelope.name}
        </Text>
        <Text style={[styles.rowRemaining, over && { color: colors.danger }]}>
          {over ? '-' : ''}${Math.abs(envelope.remaining_amount).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowSub}>
        <Text style={styles.rowMuted}>
          ${envelope.spent_amount.toFixed(2)} spent of ${envelope.planned_amount.toFixed(2)}
        </Text>
        <Text style={styles.rowMuted}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.text },
  content: { padding: spacing.lg, gap: spacing.md },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metric: { alignItems: 'center', flex: 1 },
  metricLabel: { ...typography.label, color: colors.muted, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: '700' },
  barBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: { height: '100%', borderRadius: 4 },
  pctText: { ...typography.label, color: colors.muted, textAlign: 'right' },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowName: { ...typography.h3, color: colors.text, flex: 1, marginRight: spacing.sm },
  rowRemaining: { fontSize: 17, fontWeight: '700', color: colors.success },
  rowSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rowMuted: { ...typography.body, color: colors.muted, fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  resetBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.danger,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  resetText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

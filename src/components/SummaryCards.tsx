import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
  currency?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  balance,
  income,
  expenses,
  currency = 'USD',
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <View style={styles.container}>
      {}
      <View style={[styles.card, styles.balanceCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Balance</Text>
          <View style={[styles.iconWrapper, styles.balanceIconWrapper]}>
            <Feather name="credit-card" size={20} color={theme.colors.primaryLight} />
          </View>
        </View>
        <Text style={[styles.amountText, styles.balanceText]}>
          {formatCurrency(balance)}
        </Text>
        <Text style={styles.subtext}>Available Funds</Text>
      </View>

      {}
      <View style={styles.row}>
        {}
        <View style={[styles.card, styles.halfCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Income</Text>
            <View style={[styles.iconWrapper, styles.incomeIconWrapper]}>
              <Feather name="arrow-down-left" size={18} color={theme.colors.incomeLight} />
            </View>
          </View>
          <Text style={[styles.amountText, styles.incomeText]}>
            {formatCurrency(income)}
          </Text>
          <Text style={styles.subtext}>Monthly Earnings</Text>
        </View>

        {}
        <View style={[styles.card, styles.halfCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Expenses</Text>
            <View style={[styles.iconWrapper, styles.expenseIconWrapper]}>
              <Feather name="arrow-up-right" size={18} color={theme.colors.expenseLight} />
            </View>
          </View>
          <Text style={[styles.amountText, styles.expenseText]}>
            {formatCurrency(expenses)}
          </Text>
          <Text style={styles.subtext}>Monthly Spending</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  balanceCard: {
    width: '100%',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIconWrapper: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  incomeIconWrapper: {
    backgroundColor: theme.colors.incomeBg,
  },
  expenseIconWrapper: {
    backgroundColor: theme.colors.expenseBg,
  },
  amountText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily,
  },
  balanceText: {
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
  },
  incomeText: {
    color: theme.colors.incomeLight,
  },
  expenseText: {
    color: theme.colors.expenseLight,
  },
  subtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Transaction } from '../store/useFinanceStore';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  currency?: string;
}

const CATEGORY_ICONS: Record<string, keyof typeof Feather.definitionsByNaming | string> = {
  Food: 'shopping-bag',
  Shopping: 'shopping-cart',
  Transport: 'navigation',
  Utilities: 'zap',
  Entertainment: 'tv',
  Health: 'heart',
  Salary: 'dollar-sign',
  Freelance: 'briefcase',
  Other: 'help-circle',
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  currency = 'USD',
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(val);
  };

  const getRelativeDateHeader = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase()) ||
                          tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedTransactions: Record<string, Transaction[]> = {};
  filteredTransactions.forEach((tx) => {
    if (!groupedTransactions[tx.date]) {
      groupedTransactions[tx.date] = [];
    }
    groupedTransactions[tx.date].push(tx);
  });

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const getCategoryIcon = (category: string): any => {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>History Ledger</Text>

      {}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search descriptions or categories..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} style={styles.clearPressable}>
            <Feather name="x" size={14} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>

      {}
      <View style={styles.tabsContainer}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => setFilterType(type)}
            style={[
              styles.tab,
              filterType === type && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                filterType === type && styles.tabTextActive,
              ]}
            >
              {type === 'all' ? 'All' : type === 'income' ? 'Income' : 'Expenses'}
            </Text>
          </Pressable>
        ))}
      </View>

      {}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="folder-minus" size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No matching logs found.</Text>
          </View>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{getRelativeDateHeader(date)}</Text>

              <View style={styles.transactionsGroupList}>
                {groupedTransactions[date].map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <View key={tx.id} style={styles.transactionItem}>
                      <View style={styles.itemLeft}>
                        {}
                        <View
                          style={[
                            styles.iconBadge,
                            {
                              backgroundColor: isIncome
                                ? theme.colors.incomeBg
                                : theme.colors.glassBg,
                            },
                          ]}
                        >
                          <Feather
                            name={getCategoryIcon(tx.category)}
                            size={16}
                            color={
                              isIncome
                                ? theme.colors.incomeLight
                                : theme.colors.textSecondary
                            }
                          />
                        </View>

                        {}
                        <View style={styles.details}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {tx.title}
                          </Text>
                          <Text style={styles.itemCategory}>{tx.category}</Text>
                        </View>
                      </View>

                      <View style={styles.itemRight}>
                        <Text
                          style={[
                            styles.itemAmount,
                            isIncome ? styles.incomeAmount : styles.expenseAmount,
                          ]}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </Text>

                        {}
                        <Pressable
                          onPress={() => onDeleteTransaction(tx.id)}
                          style={({ pressed }) => [
                            styles.trashBtn,
                            pressed && styles.trashBtnPressed,
                          ]}
                        >
                          <Feather name="trash-2" size={14} color={theme.colors.expenseLight} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    width: '100%',
    flex: 1,
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 38,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  } as any,
  clearPressable: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.sm,
    padding: 2,
    gap: 2,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: theme.borderRadius.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryGlow,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tabText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  tabTextActive: {
    color: theme.colors.primaryLight,
    fontWeight: theme.typography.weights.semibold,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
  },
  dateGroup: {
    marginBottom: theme.spacing.md,
  },
  dateHeader: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    paddingLeft: 2,
  },
  transactionsGroupList: {
    gap: theme.spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  details: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemAmount: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'right',
  },
  incomeAmount: {
    color: theme.colors.incomeLight,
  },
  expenseAmount: {
    color: theme.colors.text,
  },
  trashBtn: {
    width: 26,
    height: 26,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  trashBtnPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

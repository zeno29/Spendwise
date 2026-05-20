import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface BudgetLimitsProps {
  budgets: Record<string, number>;
  expensesByCategory: Record<string, number>;
  updateBudget: (category: string, amount: number) => void;
  currency?: string;
}

const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    case 'JPY': return '¥';
    default: return '$';
  }
};

export const BudgetLimits: React.FC<BudgetLimitsProps> = ({
  budgets,
  expensesByCategory,
  updateBudget,
  currency = 'USD',
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleEditBudget = (category: string) => {
    setEditingCategory(category);
    setBudgetValue(budgets[category]?.toString() || '0');
  };

  const handleSaveBudget = () => {
    if (editingCategory && budgetValue) {
      const amt = parseFloat(budgetValue);
      if (!isNaN(amt) && amt >= 0) {
        updateBudget(editingCategory, amt);
      }
    }
    setEditingCategory(null);
  };

  const budgetList = Object.entries(budgets).sort((a, b) => b[1] - a[1]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Budgets</Text>
        <Text style={styles.infoText}>Tap limit to customize</Text>
      </View>

      <View style={styles.listContainer}>
        {budgetList.map(([category, limit]) => {
          const spent = expensesByCategory[category] || 0;
          const ratio = limit > 0 ? spent / limit : 0;
          const percentUsed = Math.min(ratio * 100, 100);

          let progressColor = theme.colors.primary;
          let isWarning = false;
          let isDanger = false;

          if (ratio > 1.0) {
            progressColor = theme.colors.expenseLight;
            isDanger = true;
          } else if (ratio >= 0.8) {
            progressColor = theme.colors.warning;
            isWarning = true;
          } else {
            progressColor = theme.colors.incomeLight;
          }

          return (
            <View key={category} style={styles.budgetItem}>
              <View style={styles.itemHeader}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category}</Text>
                  {isDanger && (
                    <View style={[styles.badge, styles.dangerBadge]}>
                      <Text style={styles.badgeText}>Exceeded</Text>
                    </View>
                  )}
                  {isWarning && !isDanger && (
                    <View style={[styles.badge, styles.warningBadge]}>
                      <Text style={styles.badgeText}>Near Limit</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => handleEditBudget(category)}
                  style={styles.limitPressable}
                >
                  <Text style={styles.spentText}>
                    {formatCurrency(spent)} <Text style={styles.slash}>/</Text>{' '}
                    <Text style={styles.limitText}>{formatCurrency(limit)}</Text>
                  </Text>
                  <Feather name="edit-2" size={10} color={theme.colors.textMuted} style={styles.editIcon} />
                </Pressable>
              </View>

              {}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percentUsed}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>

              <View style={styles.itemFooter}>
                <Text style={styles.percentText}>
                  {percentUsed.toFixed(0)}% used
                </Text>
                {limit - spent >= 0 ? (
                  <Text style={styles.remainingText}>
                    {formatCurrency(limit - spent)} left
                  </Text>
                ) : (
                  <Text style={[styles.remainingText, styles.overspentText]}>
                    {formatCurrency(spent - limit)} over
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {}
      {editingCategory && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditingCategory(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set {editingCategory} Budget</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>{getCurrencySymbol(currency)}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={budgetValue}
                  onChangeText={setBudgetValue}
                  autoFocus={true}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setEditingCategory(null)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveBudget}
                  style={[styles.modalButton, styles.saveButton]}
                >
                  <Text style={styles.saveButtonText}>Save Limit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  infoText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  budgetItem: {
    width: '100%',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  dangerBadge: {
    backgroundColor: theme.colors.expenseBg,
  },
  warningBadge: {
    backgroundColor: theme.colors.warningBg,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold,
    color: '#fff',
    textTransform: 'uppercase',
  },
  limitPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 2,
  },
  editIcon: {
    opacity: 0.5,
  },
  spentText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  slash: {
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.regular,
  },
  limitText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.round,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.round,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  percentText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  remainingText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  overspentText: {
    color: theme.colors.expenseLight,
    fontWeight: theme.typography.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#120d20',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  currencyPrefix: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primaryLight,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  } as any,
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: theme.typography.weights.semibold,
  },
});

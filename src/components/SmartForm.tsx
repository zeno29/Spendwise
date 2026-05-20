import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { parseNaturalLanguage, ParsedTransaction } from '../utils/aiParser';

interface SmartFormProps {
  categories: string[];
  onAddTransaction: (tx: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
  }) => void;
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

export const SmartForm: React.FC<SmartFormProps> = ({
  categories,
  onAddTransaction,
  currency = 'USD',
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const [aiText, setAiText] = useState('');
  const [aiPreview, setAiPreview] = useState<ParsedTransaction | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeTab === 'ai' && aiText.trim().length > 3) {
      const parsed = parseNaturalLanguage(aiText, categories);
      setAiPreview(parsed);
    } else {
      setAiPreview(null);
    }
  }, [aiText, activeTab, categories]);

  const handleAddAiLog = () => {
    if (!aiPreview || aiPreview.amount <= 0) return;

    onAddTransaction({
      title: aiPreview.title,
      amount: aiPreview.amount,
      type: aiPreview.type,
      category: aiPreview.category,
      date: new Date().toISOString().split('T')[0],
    });

    setAiText('');
    setAiPreview(null);
  };

  const handleAddManualLog = () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: amt,
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setAmount('');
    setType('expense');
    setCategory(categories[0] || 'Other');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <View style={styles.card}>
      {}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab('ai')}
          style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
        >
          <Feather
            name="zap"
            size={14}
            color={activeTab === 'ai' ? theme.colors.primaryLight : theme.colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
            Smart AI Bar
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('manual')}
          style={[styles.tab, activeTab === 'manual' && styles.tabActive]}
        >
          <Feather
            name="sliders"
            size={14}
            color={activeTab === 'manual' ? theme.colors.primaryLight : theme.colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
            Manual Entry
          </Text>
        </Pressable>
      </View>

      {}
      {activeTab === 'ai' && (
        <View style={styles.formContent}>
          <Text style={styles.prompt}>Describe your transaction in natural language:</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Spent 12.50 at Subway for lunch"
              placeholderTextColor={theme.colors.textMuted}
              value={aiText}
              onChangeText={setAiText}
            />
            {aiText.length > 0 && (
              <Pressable onPress={() => setAiText('')} style={styles.clearBtn}>
                <Feather name="x" size={16} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          {}
          {aiPreview && (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Live Smart Preview:</Text>

              <View style={styles.previewRow}>
                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>Title</Text>
                  <Text style={styles.fieldValue} numberOfLines={1}>{aiPreview.title}</Text>
                </View>

                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>Amount</Text>
                  <Text style={[styles.fieldValue, styles.amountValue]}>
                    {getCurrencySymbol(currency)}{aiPreview.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.previewRow}>
                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{aiPreview.category}</Text>
                  </View>
                </View>

                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>Type</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      aiPreview.type === 'income' ? styles.typeIncome : styles.typeExpense,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>{aiPreview.type.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={handleAddAiLog}
            disabled={!aiPreview || aiPreview.amount <= 0}
            style={[
              styles.submitButton,
              (!aiPreview || aiPreview.amount <= 0) && styles.submitButtonDisabled,
            ]}
          >
            <Feather name="plus-circle" size={16} color="#fff" />
            <Text style={styles.submitButtonText}>Log Smart Transaction</Text>
          </Pressable>
        </View>
      )}

      {}
      {activeTab === 'manual' && (
        <View style={styles.formContent}>
          <View style={styles.manualRow}>
            {}
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Description / Merchant</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. Costco Grocery"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Amount ({getCurrencySymbol(currency)})</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View style={styles.manualRow}>
            {}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Log Type</Text>
              <View style={styles.typeToggle}>
                <Pressable
                  onPress={() => setType('expense')}
                  style={[styles.toggleBtn, type === 'expense' && styles.toggleExpenseActive]}
                >
                  <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
                    Expense
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setType('income')}
                  style={[styles.toggleBtn, type === 'income' && styles.toggleIncomeActive]}
                >
                  <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
                    Income
                  </Text>
                </Pressable>
              </View>
            </View>

            {}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                {Platform.OS === 'web' ? (
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor: 'transparent',
                      color: theme.colors.text,
                      border: 'none',
                      outline: 'none',
                      fontSize: 14,
                      paddingLeft: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} style={{ backgroundColor: '#120d20', color: theme.colors.text }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (

                  <TextInput
                    style={styles.manualInput}
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Category"
                  />
                )}
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleAddManualLog}
            disabled={!title.trim() || !amount}
            style={[
              styles.submitButton,
              (!title.trim() || !amount) && styles.submitButtonDisabled,
            ]}
          >
            <Feather name="plus-circle" size={16} color="#fff" />
            <Text style={styles.submitButtonText}>Log Transaction</Text>
          </Pressable>
        </View>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: 3,
    gap: 4,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  tabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  tabTextActive: {
    color: theme.colors.primaryLight,
    fontWeight: theme.typography.weights.semibold,
  },
  formContent: {
    gap: theme.spacing.md,
  },
  prompt: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    height: 44,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  } as any,
  clearBtn: {
    padding: 6,
  },
  previewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    gap: theme.spacing.sm,
  },
  previewTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  previewField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  amountValue: {
    color: theme.colors.expenseLight,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.xs,
  },
  typeIncome: {
    backgroundColor: theme.colors.incomeBg,
  },
  typeExpense: {
    backgroundColor: theme.colors.expenseBg,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    height: 44,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: theme.colors.glassBorder,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  manualRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  manualInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 40,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  } as any,
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    height: 40,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  toggleExpenseActive: {
    backgroundColor: theme.colors.expenseBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  toggleIncomeActive: {
    backgroundColor: theme.colors.incomeBg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  toggleText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: theme.typography.weights.bold,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    height: 40,
    justifyContent: 'center',
  },
});

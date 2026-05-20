import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { theme } from '../styles/theme';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  expensesByCategory: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f43f5e',
  Shopping: '#3b82f6',
  Transport: '#f59e0b',
  Utilities: '#06b6d4',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Other: '#6b7280',
};

export const DonutChart: React.FC<DonutChartProps> = ({ expensesByCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalExpense = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  const chartData: CategoryData[] = Object.entries(expensesByCategory)
    .filter(([_, amt]) => amt > 0)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other'],
    }))
    .sort((a, b) => b.amount - a.amount);

  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const getActiveText = () => {
    if (selectedCategory) {
      const match = chartData.find(d => d.category === selectedCategory);
      if (match) {
        return {
          title: match.category,
          subtitle: formatCurrency(match.amount),
          percent: `${match.percentage.toFixed(0)}%`,
        };
      }
    }
    return {
      title: 'Total Spent',
      subtitle: formatCurrency(totalExpense),
      percent: '100%',
    };
  };

  const activeText = getActiveText();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Expense Breakdown</Text>

      {totalExpense === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses logged yet.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {}
          <View style={styles.chartWrapper}>
            <Svg width={size} height={size}>
              <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                {}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {}
                {chartData.map((item) => {
                  const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                  const rotationAngle = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += item.percentage;

                  const isSelected = selectedCategory === item.category;

                  return (
                    <Circle
                      key={item.category}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={item.color}
                      strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      transform={`rotate(${rotationAngle} ${size / 2} ${size / 2})`}
                      onPress={() => {
                        setSelectedCategory(isSelected ? null : item.category);
                      }}
                      opacity={selectedCategory && !isSelected ? 0.35 : 1}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </G>
            </Svg>

            {}
            <View style={styles.centerLabel} pointerEvents="none">
              <Text style={styles.centerTitle} numberOfLines={1}>
                {activeText.title}
              </Text>
              <Text style={styles.centerSubtitle} numberOfLines={1}>
                {activeText.subtitle}
              </Text>
              {selectedCategory && (
                <Text style={styles.centerPercent}>
                  {activeText.percent}
                </Text>
              )}
            </View>
          </View>

          {}
          <View style={styles.legendContainer}>
            {chartData.map((item) => {
              const isSelected = selectedCategory === item.category;
              return (
                <Pressable
                  key={item.category}
                  onPress={() => setSelectedCategory(isSelected ? null : item.category)}
                  style={[
                    styles.legendItem,
                    isSelected && styles.legendItemActive,
                    selectedCategory && !isSelected && styles.legendItemMuted,
                  ]}
                >
                  <View style={styles.legendLeft}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryName}>{item.category}</Text>
                  </View>
                  <View style={styles.legendRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.categoryPercent}>{item.percentage.toFixed(0)}%</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
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
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
  },
  content: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    flexWrap: 'wrap',
  },
  chartWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 110,
  },
  centerTitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  centerSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  centerPercent: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primaryLight,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    minWidth: 200,
    width: '100%',
    gap: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legendItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: theme.colors.cardBorder,
  },
  legendItemMuted: {
    opacity: 0.5,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.round,
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.medium,
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semibold,
  },
  categoryPercent: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, G } from 'react-native-svg';
import { theme } from '../styles/theme';
import { Transaction } from '../store/useFinanceStore';

interface TrendChartProps {
  transactions: Transaction[];
}

interface ChartPoint {
  dayName: string;
  dateStr: string;
  amount: number;
  x: number;
  y: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ transactions }) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(6);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { dayName, dateStr };
  });

  const dailyData = last7Days.map(({ dayName, dateStr }) => {
    const dailyExpenses = transactions
      .filter((tx) => tx.date === dateStr && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      dayName,
      dateStr,
      amount: dailyExpenses,
    };
  });

  const width = 310;
  const height = 110;
  const paddingX = 15;
  const paddingY = 15;

  const maxAmount = Math.max(...dailyData.map((d) => d.amount), 50);

  const points: ChartPoint[] = dailyData.map((d, index) => {
    const x = paddingX + (index / 6) * (width - 2 * paddingX);
    const heightRatio = d.amount / maxAmount;

    const y = height - paddingY - heightRatio * (height - 2 * paddingY);
    return {
      ...d,
      x,
      y,
    };
  });

  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, idx) => {
      if (idx > 0) {
        linePath += ` L ${p.x} ${p.y}`;
      }
    });

    fillPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const selectedPoint = activePointIndex !== null ? points[activePointIndex] : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spending Trend</Text>
          <Text style={styles.subtitle}>Last 7 Days Activity</Text>
        </View>

        {selectedPoint && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsDay}>{selectedPoint.dayName}</Text>
            <Text style={styles.detailsAmount}>{formatCurrency(selectedPoint.amount)}</Text>
          </View>
        )}
      </View>

      <View style={styles.chartWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {}
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </LinearGradient>

            {}
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {}
          <Line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4,4"
            strokeWidth={1}
          />
          <Line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={1}
          />

          {}
          {fillPath ? (
            <Path d={fillPath} fill="url(#areaGrad)" />
          ) : null}

          {}
          {linePath ? (
            <Path
              d={linePath}
              stroke="url(#lineGrad)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {}
          {points.map((p, idx) => {
            const isActive = activePointIndex === idx;
            return (
              <G key={idx}>
                {}
                {isActive && (
                  <Line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth={1.5}
                    strokeDasharray="2,2"
                  />
                )}

                {}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                  onPress={() => setActivePointIndex(idx)}
                  style={{ cursor: 'pointer' }}
                />

                {}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? theme.colors.text : theme.colors.primaryLight}
                  stroke={isActive ? theme.colors.primary : 'transparent'}
                  strokeWidth={isActive ? 2 : 0}
                  onPress={() => setActivePointIndex(idx)}
                  style={{ cursor: 'pointer' }}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {}
      <View style={styles.xAxis}>
        {points.map((p, idx) => (
          <Pressable
            key={idx}
            onPress={() => setActivePointIndex(idx)}
            style={styles.xAxisLabelWrapper}
          >
            <Text
              style={[
                styles.xAxisLabel,
                activePointIndex === idx && styles.xAxisLabelActive,
              ]}
            >
              {p.dayName}
            </Text>
          </Pressable>
        ))}
      </View>
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
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  detailsContainer: {
    alignItems: 'flex-end',
  },
  detailsDay: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  detailsAmount: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.expenseLight,
    fontWeight: theme.typography.weights.bold,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: theme.spacing.xs,
  },
  xAxisLabelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  xAxisLabelActive: {
    color: theme.colors.primaryLight,
    fontWeight: theme.typography.weights.bold,
  },
});

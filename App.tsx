import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { theme } from './src/styles/theme';
import { useFinanceStore } from './src/store/useFinanceStore';
import { supabase } from './src/utils/supabase';

import { SummaryCards } from './src/components/SummaryCards';
import { DonutChart } from './src/components/DonutChart';
import { TrendChart } from './src/components/TrendChart';
import { BudgetLimits } from './src/components/BudgetLimits';
import { TransactionList } from './src/components/TransactionList';
import { SmartForm } from './src/components/SmartForm';
import { AuthScreen } from './src/components/AuthScreen';
import { OnboardingScreen } from './src/components/OnboardingScreen';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const {
    transactions,
    budgets,
    categories,
    addTransaction,
    deleteTransaction,
    updateBudget,
    resetToMock,
    user,
    setSession,
    signOut,
    loading: authLoading,
    profile,
    profileLoading,
  } = useFinanceStore();

  const [isGuest, setIsGuest] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  React.useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsGuest(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  const expensesByCategory = React.useMemo(() => {
    const result: Record<string, number> = {};
    categories.forEach((cat) => {
      result[cat] = 0;
    });

    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        result[tx.category] = (result[tx.category] || 0) + tx.amount;
      });

    return result;
  }, [transactions, categories]);

  if (authLoading || (user && profileLoading)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Syncing Secure Wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user && !isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <AuthScreen onGuestBypass={() => setIsGuest(true)} />
      </SafeAreaView>
    );
  }

  if (user && !profile && !isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  if (isEditingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <OnboardingScreen isEditing={true} onClose={() => setIsEditingProfile(false)} />
      </SafeAreaView>
    );
  }

  const activeCurrency = profile?.currency || 'USD';

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Feather name="activity" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.logoText}>SpendWise</Text>
              <Text style={styles.logoSubtext}>Premium Portfolio App</Text>
            </View>
          </View>

          {}
          <View style={styles.headerActions}>
            {user ? (
              <View style={styles.profileContainer}>
                <View style={styles.profileBadge}>
                  <Feather name="user" size={12} color={theme.colors.primaryLight} />
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {profile?.name || user.email?.split('@')[0]}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setIsEditingProfile(true)}
                  style={({ pressed }) => [
                    styles.editProfileBtn,
                    pressed && styles.editProfileBtnPressed,
                  ]}
                >
                  <Feather name="settings" size={12} color={theme.colors.primaryLight} />
                  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </Pressable>

                <Pressable
                  onPress={signOut}
                  style={({ pressed }) => [
                    styles.signOutBtn,
                    pressed && styles.signOutBtnPressed,
                  ]}
                >
                  <Feather name="log-out" size={12} color={theme.colors.expenseLight} />
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.profileContainer}>
                <View style={[styles.profileBadge, styles.guestBadge]}>
                  <Feather name="eye" size={12} color={theme.colors.primaryLight} />
                  <Text style={[styles.profileEmail, styles.guestBadgeText]}>Guest Mode</Text>
                </View>

                <Pressable
                  onPress={() => setIsEditingProfile(true)}
                  style={({ pressed }) => [
                    styles.editProfileBtn,
                    pressed && styles.editProfileBtnPressed,
                  ]}
                >
                  <Feather name="settings" size={12} color={theme.colors.primaryLight} />
                  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </Pressable>

                <Pressable
                  onPress={resetToMock}
                  style={({ pressed }) => [
                    styles.resetBtn,
                    pressed && styles.resetBtnPressed,
                  ]}
                >
                  <Feather name="refresh-cw" size={11} color={theme.colors.primaryLight} />
                  <Text style={styles.resetBtnText}>Reset Demo</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsGuest(false)}
                  style={({ pressed }) => [
                    styles.linkBtn,
                    pressed && styles.linkBtnPressed,
                  ]}
                >
                  <Feather name="log-in" size={12} color={theme.colors.primaryLight} />
                  <Text style={styles.linkBtnText}>Sign In</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {}
        <View style={[styles.layout, isDesktop ? styles.layoutRow : styles.layoutColumn]}>

          {}
          <View style={[styles.column, isDesktop && styles.leftColumn]}>
            {}
            <SummaryCards
              balance={balance}
              income={totalIncome}
              expenses={totalExpenses}
              currency={activeCurrency}
            />

            {}
            <SmartForm
              categories={categories.filter((cat) => cat !== 'Salary' && cat !== 'Freelance')}
              onAddTransaction={addTransaction}
              currency={activeCurrency}
            />

            {}
            <TrendChart transactions={transactions} />

            {}
            <DonutChart expensesByCategory={expensesByCategory} />
          </View>

          {}
          <View style={[styles.column, isDesktop && styles.rightColumn]}>
            {}
            <BudgetLimits
              budgets={budgets}
              expensesByCategory={expensesByCategory}
              updateBudget={updateBudget}
              currency={activeCurrency}
            />

            {}
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
              currency={activeCurrency}
            />
          </View>

        </View>

        {}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SpendWise • React Native Portfolio Project
          </Text>
          <Text style={styles.footerSubtext}>
            Built with Expo, Zustand, Supabase Cloud Storage, RLS Postgres, and Custom SVG Drawings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 1200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glassBorder,
    gap: theme.spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs + 2,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  guestBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  guestBadgeText: {
    color: theme.colors.primaryLight,
  },
  profileEmail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.semibold,
    maxWidth: 120,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  signOutBtnPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
  signOutBtnText: {
    color: theme.colors.expenseLight,
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.semibold,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  editProfileBtnPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  editProfileBtnText: {
    fontSize: theme.typography.sizes.xs - 1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  resetBtnPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetBtnText: {
    fontSize: theme.typography.sizes.xs - 1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  linkBtnPressed: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  linkBtnText: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.5,
  },
  layout: {
    width: '100%',
    maxWidth: 1200,
    gap: theme.spacing.lg,
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  layoutColumn: {
    flexDirection: 'column',
  },
  column: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  leftColumn: {
    flex: 1.2,
  },
  rightColumn: {
    flex: 0.8,
  },
  footer: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
    gap: 4,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  footerSubtext: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useFinanceStore } from '../store/useFinanceStore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'Pound' },
  { code: 'INR', symbol: '₹', label: 'Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Yen' },
];

interface OnboardingScreenProps {
  isEditing?: boolean;
  onClose?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  isEditing = false,
  onClose,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { createProfile, updateProfile, signOut, profileLoading, profile } = useFinanceStore();

  const [name, setName] = useState(isEditing && profile ? profile.name : '');
  const [selectedCurrency, setSelectedCurrency] = useState(isEditing && profile ? profile.currency : 'USD');
  const [initialFunds, setInitialFunds] = useState(isEditing && profile ? profile.available_funds.toString() : '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameFocused, setNameFocused] = useState(false);
  const [fundsFocused, setFundsFocused] = useState(false);

  const activeCurrencySymbol = CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol ?? '$';

  const handleLaunch = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const funds = parseFloat(initialFunds.trim());
    if (initialFunds.trim() && (isNaN(funds) || funds < 0)) {
      setErrorMessage('Please enter a valid starting balance (greater than or equal to 0).');
      return;
    }

    setErrorMessage(null);
    try {
      if (isEditing) {
        await updateProfile({
          name: name.trim(),
          currency: selectedCurrency,
          available_funds: isNaN(funds) ? 0 : funds,
        });
        onClose?.();
      } else {
        await createProfile({
          name: name.trim(),
          currency: selectedCurrency,
          available_funds: isNaN(funds) ? 0 : funds,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete profile configuration.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDesktop && styles.desktopCard]}>
          {}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Feather name="layers" size={24} color="#fff" />
            </View>
            <Text style={styles.logoText}>{isEditing ? 'Update Workspace' : 'Configure Workspace'}</Text>
            <Text style={styles.logoSubtext}>
              {isEditing ? 'Personalize your profile settings and currency defaults.' : "Let's personalize your personal ledger setup."}
            </Text>
          </View>

          {}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={theme.colors.expenseLight} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {}
          <View style={styles.form}>
            {}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>What should we call you?</Text>
              <View
                style={[
                  styles.inputWrapper,
                  nameFocused && styles.inputWrapperFocused,
                ]}
              >
                <Feather
                  name="user"
                  size={16}
                  color={nameFocused ? theme.colors.primaryLight : theme.colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Mercer"
                  placeholderTextColor={theme.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Primary Currency</Text>
              <View style={styles.currencyGrid}>
                {CURRENCIES.map((curr) => {
                  const isSelected = selectedCurrency === curr.code;
                  return (
                    <Pressable
                      key={curr.code}
                      onPress={() => setSelectedCurrency(curr.code)}
                      style={[
                        styles.currencyCard,
                        isSelected && styles.currencyCardActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.currencySymbol,
                          isSelected && styles.currencySymbolActive,
                        ]}
                      >
                        {curr.symbol}
                      </Text>
                      <Text
                        style={[
                          styles.currencyCode,
                          isSelected && styles.currencyCodeActive,
                        ]}
                      >
                        {curr.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Initial Available Funds</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fundsFocused && styles.inputWrapperFocused,
                ]}
              >
                <Text
                  style={[
                    styles.prefixSymbol,
                    fundsFocused ? styles.prefixSymbolFocused : styles.prefixSymbolMuted,
                  ]}
                >
                  {activeCurrencySymbol}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={initialFunds}
                  onChangeText={setInitialFunds}
                  onFocus={() => setFundsFocused(true)}
                  onBlur={() => setFundsFocused(false)}
                  onSubmitEditing={handleLaunch}
                />
              </View>
              <Text style={styles.fieldSubtext}>
                *This initial balance will automatically log as a starting credit transaction in your ledger.
              </Text>
            </View>

            {}
            <Pressable
              onPress={handleLaunch}
              disabled={profileLoading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
                profileLoading && styles.submitBtnDisabled,
              ]}
            >
              {profileLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>{isEditing ? 'Save Profile Changes' : 'Launch Wealth Workspace'}</Text>
                  <Feather name={isEditing ? 'check-circle' : 'rocket'} size={16} color="#fff" />
                </>
              )}
            </Pressable>

            {}
            <Pressable
              onPress={isEditing ? onClose : signOut}
              style={({ pressed }) => [
                styles.signOutLink,
                pressed && styles.signOutLinkPressed,
              ]}
            >
              <Text style={styles.signOutLinkText}>
                {isEditing ? 'Cancel & Return' : 'Sign Into Another Wallet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  desktopCard: {
    padding: theme.spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.expenseBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.expenseLight,
  },
  form: {
    width: '100%',
    gap: theme.spacing.md,
  },
  inputContainer: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    paddingLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    height: 48,
    width: '100%',
  },
  inputWrapperFocused: {
    borderColor: theme.colors.cardBorderActive,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  prefixSymbol: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginRight: theme.spacing.sm,
    width: 14,
    textAlign: 'center',
  },
  prefixSymbolFocused: {
    color: theme.colors.primaryLight,
  },
  prefixSymbolMuted: {
    color: theme.colors.textMuted,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    height: '100%',
    outlineStyle: 'none',
  } as any,
  currencyGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
    flexWrap: 'wrap',
  },
  currencyCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  currencyCardActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  currencySymbol: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
  },
  currencySymbolActive: {
    color: theme.colors.text,
  },
  currencyCode: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
  },
  currencyCodeActive: {
    color: theme.colors.primaryLight,
  },
  fieldSubtext: {
    fontSize: 9,
    color: theme.colors.textMuted,
    lineHeight: 12,
    paddingLeft: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnPressed: {
    opacity: 0.9,
    backgroundColor: theme.colors.primaryLight,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  signOutLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  signOutLinkPressed: {
    opacity: 0.7,
  },
  signOutLinkText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
    textDecorationLine: 'underline',
  },
});

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Profile {
  name: string;
  currency: string;
  available_funds: number;
}

export interface FinanceState {

  transactions: Transaction[];
  budgets: Record<string, number>;
  categories: string[];

  user: any | null;
  session: any | null;
  loading: boolean;

  profile: Profile | null;
  profileLoading: boolean;

  setSession: (session: any) => Promise<void>;
  signOut: () => Promise<void>;

  fetchProfile: () => Promise<void>;
  createProfile: (profile: Profile) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;

  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (category: string, amount: number) => Promise<void>;

  fetchCloudData: () => Promise<void>;
  resetToMock: () => void;
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Salary',
  'Freelance',
  'Other',
];

const DEFAULT_BUDGETS = {
  Food: 450,
  Shopping: 300,
  Transport: 150,
  Utilities: 200,
  Entertainment: 200,
  Health: 100,
  Other: 100,
};

const getRelativeDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const getMockTransactions = (): Transaction[] => [
  {
    id: 'tx-1',
    title: 'Monthly Paycheck',
    amount: 3200,
    type: 'income',
    category: 'Salary',
    date: getRelativeDateStr(6),
  },
  {
    id: 'tx-2',
    title: 'Costco Grocery Shopping',
    amount: 182.4,
    type: 'expense',
    category: 'Food',
    date: getRelativeDateStr(5),
  },
  {
    id: 'tx-3',
    title: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment',
    date: getRelativeDateStr(4),
  },
  {
    id: 'tx-4',
    title: 'Shell Gas Station',
    amount: 45.0,
    type: 'expense',
    category: 'Transport',
    date: getRelativeDateStr(3),
  },
  {
    id: 'tx-5',
    title: 'Starbucks Coffee',
    amount: 8.75,
    type: 'expense',
    category: 'Food',
    date: getRelativeDateStr(2),
  },
  {
    id: 'tx-6',
    title: 'Electric & Gas Bill',
    amount: 115.0,
    type: 'expense',
    category: 'Utilities',
    date: getRelativeDateStr(2),
  },
  {
    id: 'tx-7',
    title: 'Web Design Freelance',
    amount: 450.0,
    type: 'income',
    category: 'Freelance',
    date: getRelativeDateStr(1),
  },
  {
    id: 'tx-8',
    title: 'Gym Membership',
    amount: 60.0,
    type: 'expense',
    category: 'Health',
    date: getRelativeDateStr(1),
  },
  {
    id: 'tx-9',
    title: 'Dinner at Olive Garden',
    amount: 76.3,
    type: 'expense',
    category: 'Food',
    date: getRelativeDateStr(0),
  },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({

      transactions: getMockTransactions(),
      budgets: DEFAULT_BUDGETS,
      categories: DEFAULT_CATEGORIES,
      user: null,
      session: null,
      loading: false,
      profile: null,
      profileLoading: false,

      setSession: async (session) => {
        const user = session?.user ?? null;
        set({ session, user });

        if (user) {

          await get().fetchProfile();

          await get().fetchCloudData();
        } else {

          set({
            transactions: getMockTransactions(),
            budgets: DEFAULT_BUDGETS,
            profile: {
              name: 'Guest Reviewer',
              currency: 'USD',
              available_funds: 5000.00,
            },
          });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          session: null,
          user: null,
          transactions: getMockTransactions(),
          budgets: DEFAULT_BUDGETS,
          profile: {
            name: 'Guest Reviewer',
            currency: 'USD',
            available_funds: 5000.00,
          },
        });
      },

      fetchProfile: async () => {
        const user = get().user;
        if (!user) return;

        set({ profileLoading: true });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {

            if (error.code === 'PGRST116') {
              set({ profile: null });
            } else {
              throw error;
            }
          } else if (data) {
            set({
              profile: {
                name: data.name,
                currency: data.currency,
                available_funds: parseFloat(data.available_funds),
              },
            });
          }
        } catch (e) {
          console.error('Error fetching Supabase user profile:', e);
        } finally {
          set({ profileLoading: false });
        }
      },

      createProfile: async (profileData) => {
        const user = get().user;
        if (!user) return;

        set({ profileLoading: true });
        try {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: profileData.name,
              currency: profileData.currency,
              available_funds: profileData.available_funds,
            });

          if (error) throw error;

          set({ profile: profileData });

          if (profileData.available_funds > 0) {
            await get().addTransaction({
              title: 'Initial Starting Funds',
              amount: profileData.available_funds,
              type: 'income',
              category: 'Salary',
              date: new Date().toISOString().split('T')[0],
            });
          }
        } catch (e) {
          console.error('Failed to create cloud user profile:', e);
          throw e;
        } finally {
          set({ profileLoading: false });
        }
      },

      updateProfile: async (profileData) => {
        const user = get().user;
        if (!user) {

          set({ profile: profileData });
          return;
        }

        set({ profileLoading: true });
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: profileData.name,
              currency: profileData.currency,
              available_funds: profileData.available_funds,
            })
            .eq('id', user.id);

          if (error) throw error;

          set({ profile: profileData });
        } catch (e) {
          console.error('Failed to update cloud user profile:', e);
          throw e;
        } finally {
          set({ profileLoading: false });
        }
      },

      fetchCloudData: async () => {
        const user = get().user;
        if (!user) return;

        set({ loading: true });
        try {

          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (txError) throw txError;

          const { data: budgetData, error: budgetError } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id);

          if (budgetError) throw budgetError;

          const budgetMap: Record<string, number> = { ...DEFAULT_BUDGETS };
          if (budgetData && budgetData.length > 0) {
            budgetData.forEach((row) => {
              budgetMap[row.category] = parseFloat(row.limit_amount);
            });
          }

          const formattedTx: Transaction[] = (txData || []).map((row) => ({
            id: row.id,
            title: row.title,
            amount: parseFloat(row.amount),
            type: row.type as 'income' | 'expense',
            category: row.category,
            date: row.date,
          }));

          set({
            transactions: formattedTx,
            budgets: budgetMap,
          });
        } catch (e) {
          console.error('Error fetching Supabase cloud data:', e);
        } finally {
          set({ loading: false });
        }
      },

      addTransaction: async (tx) => {
        const user = get().user;
        const tempId = `tx-${Date.now()}`;

        const newLocalTx: Transaction = {
          ...tx,
          id: tempId,
        };
        set((state) => ({
          transactions: [newLocalTx, ...state.transactions],
        }));

        if (user) {
          try {

            const { data, error } = await supabase
              .from('transactions')
              .insert({
                user_id: user.id,
                title: tx.title,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                date: tx.date,
              })
              .select()
              .single();

            if (error) throw error;

            if (data) {
              set((state) => ({
                transactions: state.transactions.map((t) =>
                  t.id === tempId ? { ...t, id: data.id } : t
                ),
              }));
            }
          } catch (e) {
            console.error('Failed to sync added transaction to Supabase:', e);
          }
        }
      },

      deleteTransaction: async (id) => {
        const user = get().user;

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));

        if (user && !id.startsWith('tx-')) {
          try {

            const { error } = await supabase
              .from('transactions')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);

            if (error) throw error;
          } catch (e) {
            console.error('Failed to delete transaction from Supabase:', e);
          }
        }
      },

      updateBudget: async (category, amount) => {
        const user = get().user;

        set((state) => ({
          budgets: {
            ...state.budgets,
            [category]: amount,
          },
        }));

        if (user) {
          try {

            const { error } = await supabase
              .from('budgets')
              .upsert(
                {
                  user_id: user.id,
                  category,
                  limit_amount: amount,
                },
                { onConflict: 'user_id,category' }
              );

            if (error) throw error;
          } catch (e) {
            console.error('Failed to save updated budget to Supabase:', e);
          }
        }
      },

      resetToMock: () => {

        if (!get().user) {
          set({
            transactions: getMockTransactions(),
            budgets: DEFAULT_BUDGETS,
            categories: DEFAULT_CATEGORIES,
          });
        }
      },
    }),
    {
      name: 'spendwise-finance-store',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        categories: state.categories,
        profile: state.profile,
      }),
    }
  )
);

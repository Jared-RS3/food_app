import { supabase } from '@/lib/supabase';
import { logger } from './logger';

export interface Budget {
  id: string;
  user_id: string;
  category:
    | 'food'
    | 'restaurants'
    | 'drinks'
    | 'groceries'
    | 'takeout'
    | 'other';
  monthly_limit: number;
  spent_amount: number;
  month: string; // Format: YYYY-MM
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category:
    | 'food'
    | 'restaurants'
    | 'drinks'
    | 'groceries'
    | 'takeout'
    | 'other';
  amount: number;
  description: string;
  restaurant_id?: string;
  restaurant_name?: string;
  date: string;
  created_at: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  categories: {
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
}

class BudgetService {
  // Get current month in YYYY-MM format
  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Get or create budget for current month
  async getBudgetsForMonth(userId: string, month?: string): Promise<Budget[]> {
    try {
      const targetMonth = month || this.getCurrentMonth();

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', targetMonth);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching budgets', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, month: month || this.getCurrentMonth() },
      });
      return [];
    }
  }

  // Create or update budget
  async setBudget(
    userId: string,
    category: Budget['category'],
    monthlyLimit: number,
    month?: string
  ): Promise<Budget | null> {
    try {
      const targetMonth = month || this.getCurrentMonth();

      // Check if budget exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('month', targetMonth)
        .single();

      if (existing) {
        // Update existing budget
        const { data, error } = await supabase
          .from('budgets')
          .update({
            monthly_limit: monthlyLimit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: userId,
            category,
            monthly_limit: monthlyLimit,
            spent_amount: 0,
            month: targetMonth,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      logger.error('Error setting budget', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: {
          userId,
          category,
          monthlyLimit,
          month: month || this.getCurrentMonth(),
        },
      });
      return null;
    }
  }

  // Add expense
  async addExpense(
    userId: string,
    category: Expense['category'],
    amount: number,
    description: string,
    restaurantId?: string,
    restaurantName?: string,
    date?: string
  ): Promise<Expense | null> {
    try {
      const expenseDate = date || new Date().toISOString();

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          category,
          amount,
          description,
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
          date: expenseDate,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Update budget spent amount
      const month = expenseDate.substring(0, 7); // YYYY-MM
      await this.updateBudgetSpent(userId, category, amount, month);

      return expense;
    } catch (error) {
      logger.error('Error adding expense', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, category, amount, description },
      });
      return null;
    }
  }

  // Update budget spent amount
  private async updateBudgetSpent(
    userId: string,
    category: Budget['category'],
    amount: number,
    month: string
  ): Promise<void> {
    try {
      const { data: budget } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('month', month)
        .single();

      if (budget) {
        await supabase
          .from('budgets')
          .update({
            spent_amount: budget.spent_amount + amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', budget.id);
      }
    } catch (error) {
      logger.error('Error updating budget spent', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, category, amount, month },
      });
    }
  }

  // Get expenses for month
  async getExpensesForMonth(
    userId: string,
    month?: string
  ): Promise<Expense[]> {
    try {
      const targetMonth = month || this.getCurrentMonth();
      const startDate = `${targetMonth}-01`;
      const endDate = `${targetMonth}-31`;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching expenses', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, month: month || this.getCurrentMonth() },
      });
      return [];
    }
  }

  // Get budget summary
  async getBudgetSummary(
    userId: string,
    month?: string
  ): Promise<BudgetSummary> {
    try {
      const budgets = await this.getBudgetsForMonth(userId, month);

      const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
      const remaining = totalBudget - totalSpent;
      const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const categories = budgets.map((budget) => ({
        category: budget.category,
        limit: budget.monthly_limit,
        spent: budget.spent_amount,
        remaining: budget.monthly_limit - budget.spent_amount,
        percentage:
          budget.monthly_limit > 0
            ? (budget.spent_amount / budget.monthly_limit) * 100
            : 0,
      }));

      return {
        totalBudget,
        totalSpent,
        remaining,
        percentage,
        categories,
      };
    } catch (error) {
      logger.error('Error getting budget summary', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, month: month || this.getCurrentMonth() },
      });
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
        categories: [],
      };
    }
  }

  // Delete expense
  async deleteExpense(expenseId: string, userId: string): Promise<boolean> {
    try {
      // Get expense details first
      const { data: expense } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('user_id', userId)
        .single();

      if (!expense) return false;

      // Delete expense
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update budget spent amount (subtract)
      const month = expense.date.substring(0, 7);
      await this.updateBudgetSpent(
        userId,
        expense.category,
        -expense.amount,
        month
      );

      return true;
    } catch (error) {
      logger.error('Error deleting expense', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { expenseId, userId },
      });
      return false;
    }
  }

  // Get expenses by category
  async getExpensesByCategory(
    userId: string,
    category: Expense['category'],
    month?: string
  ): Promise<Expense[]> {
    try {
      const targetMonth = month || this.getCurrentMonth();
      const startDate = `${targetMonth}-01`;
      const endDate = `${targetMonth}-31`;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching expenses by category', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId, category, month: month || this.getCurrentMonth() },
      });
      return [];
    }
  }

  // Reset budget for new month
  async resetMonthlyBudgets(userId: string): Promise<void> {
    try {
      const currentMonth = this.getCurrentMonth();
      const budgets = await this.getBudgetsForMonth(userId, currentMonth);

      // Reset spent amounts to 0
      for (const budget of budgets) {
        await supabase
          .from('budgets')
          .update({
            spent_amount: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', budget.id);
      }
    } catch (error) {
      logger.error('Error resetting monthly budgets', error instanceof Error ? error : undefined, {
        component: 'budgetService',
        metadata: { userId },
      });
    }
  }
}

export const budgetService = new BudgetService();

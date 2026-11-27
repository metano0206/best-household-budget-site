// store.js — the household's state: records, budgets and savings goals.
//
// The books live in memory and are mirrored to localStorage so additions,
// edits and budget changes survive a reload. Everything is computed from
// the transaction list (never stored twice), so the dashboard, the
// budgets page and the report can never disagree. If localStorage is
// unavailable the site still works for the session, just without saving.

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  LATEST_MONTH,
  PAST_MONTH_TOTALS,
  SAVING_CATEGORIES,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data.js';

const STORAGE_KEY = 'wagaya-kakeibo-v1';

function seedState() {
  return {
    transactions: SEED_TRANSACTIONS.map((row, index) => ({ id: `s${index + 1}`, ...row })),
    budgets: Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.budget])),
    goals: SEED_GOALS.map((goal) => ({ ...goal })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !parsed.budgets || !Array.isArray(parsed.goals)) {
      return seedState();
    }
    return parsed;
  } catch {
    return seedState();
  }
}

let state = loadState();
let currentMonth = LATEST_MONTH;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the in-memory books keep working.
  }
}

export function getMonth() {
  return currentMonth;
}

export function setMonth(monthKey) {
  currentMonth = monthKey;
}

export function categoryOf(id) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === id) ??
    INCOME_CATEGORIES.find((c) => c.id === id) ??
    SAVING_CATEGORIES.find((c) => c.id === id) ?? { id, name: id, color: '#888888' }
  );
}

// The months that have itemised records, oldest first — the month
// switcher walks this list, so a record added in a new month extends it.
export function availableMonths() {
  return [...new Set(state.transactions.map((t) => t.d.slice(0, 7)))].sort();
}

// Back to the books as first shipped: clears the saved copy.
export function resetDemo() {
  state = seedState();
  currentMonth = LATEST_MONTH;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear; the in-memory reset still stands.
  }
}

export function budgetOf(categoryId) {
  return state.budgets[categoryId] ?? 0;
}

export function transactionsIn(monthKey) {
  return state.transactions
    .filter((t) => t.d.startsWith(monthKey))
    .sort((a, b) => (a.d === b.d ? b.a - a.a : a.d < b.d ? 1 : -1));
}

// The month's four headline figures. The free balance is what is left
// of the income after living expenses and savings: the three flows the
// money-flow chart on the dashboard and the report is drawn from.
export function monthTotals(monthKey) {
  let income = 0;
  let expense = 0;
  let savings = 0;
  for (const t of state.transactions) {
    if (!t.d.startsWith(monthKey)) continue;
    if (t.k === 'income') income += t.a;
    else if (t.k === 'saving') savings += t.a;
    else expense += t.a;
  }
  return { income, expense, savings, balance: income - expense - savings };
}

export function savingsRate(monthKey) {
  const totals = monthTotals(monthKey);
  return totals.income > 0 ? totals.savings / totals.income : 0;
}

// Per-category expense totals for a month: [{ category, spent, budget }]
export function categoryTotals(monthKey) {
  const spent = new Map(EXPENSE_CATEGORIES.map((c) => [c.id, 0]));
  for (const t of state.transactions) {
    if (t.k === 'expense' && t.d.startsWith(monthKey) && spent.has(t.c)) {
      spent.set(t.c, spent.get(t.c) + t.a);
    }
  }
  return EXPENSE_CATEGORIES.map((category) => ({
    category,
    spent: spent.get(category.id),
    budget: budgetOf(category.id),
  })).sort((a, b) => b.spent - a.spent);
}

// Expense total per day of a month: Map<'2026-11-03', 6680>
export function dailyTotals(monthKey) {
  const byDay = new Map();
  for (const t of state.transactions) {
    if (t.k !== 'expense' || !t.d.startsWith(monthKey)) continue;
    byDay.set(t.d, (byDay.get(t.d) ?? 0) + t.a);
  }
  return byDay;
}

export function daysWithIncome(monthKey) {
  const days = new Set();
  for (const t of state.transactions) {
    if (t.k === 'income' && t.d.startsWith(monthKey)) days.add(t.d);
  }
  return days;
}

// Seven months of income/expense/savings for the trend chart: stored
// totals for the older months, computed totals for the itemised ones.
export function trendData() {
  const [year, month] = LATEST_MONTH.split('-').map(Number);
  const months = [];
  for (let back = 6; back >= 0; back--) {
    const date = new Date(year, month - 1 - back, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const stored = PAST_MONTH_TOTALS.find((row) => row.month === key);
    if (stored) {
      months.push({ month: key, income: stored.income, expense: stored.expense, savings: stored.savings });
    } else {
      const totals = monthTotals(key);
      months.push({ month: key, income: totals.income, expense: totals.expense, savings: totals.savings });
    }
  }
  return months;
}

let nextUserId = 1;

export function addTransaction(record) {
  const entry = { id: `u${Date.now()}-${nextUserId++}`, ...record };
  state.transactions.push(entry);
  persist();
  return entry;
}

export function updateTransaction(id, record) {
  const index = state.transactions.findIndex((t) => t.id === id);
  if (index >= 0) {
    state.transactions[index] = { id, ...record };
    persist();
  }
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  persist();
}

export function findTransaction(id) {
  return state.transactions.find((t) => t.id === id);
}

export function setBudget(categoryId, amount) {
  state.budgets[categoryId] = Math.max(0, Math.round(amount));
  persist();
}

export function totalBudget() {
  return EXPENSE_CATEGORIES.reduce((sum, c) => sum + budgetOf(c.id), 0);
}

export function goals() {
  return state.goals;
}

export function addGoal(goal) {
  state.goals.push({ id: `g${Date.now()}`, ...goal });
  persist();
}

export function addToGoal(id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (goal) {
    goal.saved = Math.min(goal.target, goal.saved + amount);
    persist();
  }
}

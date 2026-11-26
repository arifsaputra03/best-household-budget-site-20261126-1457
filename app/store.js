// store.js — the ledger's state: load, save, change and total up.
// State is one object { transactions, budgets, goals, bills, paidBills, viewMonth }
// persisted to localStorage so the family's edits survive a reload; on first run
// it is seeded from data.js. All money math the views show goes through here.

import {
  CATEGORIES,
  SEED_TRANSACTIONS,
  SEED_BUDGETS,
  SEED_GOALS,
  SEED_BILLS,
  SEED_PAID_BILLS,
  HISTORY,
  CURRENT_MONTH,
} from './data.js';
import { monthKey } from './format.js';

const STORAGE_KEY = 'hearthhold-budget-v1';

function seedState() {
  return {
    transactions: structuredClone(SEED_TRANSACTIONS),
    budgets: { ...SEED_BUDGETS },
    goals: structuredClone(SEED_GOALS),
    bills: structuredClone(SEED_BILLS),
    paidBills: structuredClone(SEED_PAID_BILLS),
    viewMonth: CURRENT_MONTH,
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) return seedState();
    return { ...seedState(), ...parsed };
  } catch {
    return seedState();
  }
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the app still works in memory.
  }
}

export function resetAll() {
  state = seedState();
  save();
}

export function getState() {
  return state;
}

export function setViewMonth(key) {
  state.viewMonth = key;
  save();
}

// ——— Transactions ———

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter}`;
}

export function addTransaction(entry) {
  const created = { id: nextId('t'), ...entry };
  state.transactions.push(created);
  save();
  return created;
}

export function updateTransaction(id, patch) {
  const found = state.transactions.find((entry) => entry.id === id);
  if (found) Object.assign(found, patch);
  save();
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter((entry) => entry.id !== id);
  save();
}

export function transactionsInMonth(key) {
  return state.transactions
    .filter((entry) => entry.date.startsWith(key))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1));
}

// ——— Totals ———

export function monthTotals(key) {
  let income = 0;
  let spent = 0;
  for (const entry of state.transactions) {
    if (!entry.date.startsWith(key)) continue;
    if (entry.kind === 'income') income += entry.amount;
    else spent += entry.amount;
  }
  return { income, spent, balance: income - spent };
}

export function spentByCategory(key) {
  const totals = new Map();
  for (const entry of state.transactions) {
    if (!entry.date.startsWith(key) || entry.kind !== 'expense') continue;
    totals.set(entry.category, (totals.get(entry.category) || 0) + entry.amount);
  }
  return CATEGORIES
    .filter((category) => category.kind === 'expense' && totals.has(category.id))
    .map((category) => ({ category, amount: totals.get(category.id) }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetRows(key) {
  const spent = new Map(spentByCategory(key).map((row) => [row.category.id, row.amount]));
  return Object.entries(state.budgets).map(([categoryId, limit]) => {
    const used = spent.get(categoryId) || 0;
    return {
      category: CATEGORIES.find((category) => category.id === categoryId),
      limit,
      used,
      left: limit - used,
      ratio: limit > 0 ? used / limit : 0,
    };
  }).sort((a, b) => b.ratio - a.ratio);
}

export function totalBudget() {
  return Object.values(state.budgets).reduce((sum, limit) => sum + limit, 0);
}

export function setBudget(categoryId, limit) {
  state.budgets[categoryId] = Math.max(0, Math.round(limit * 100) / 100);
  save();
}

// ——— Goals ———

export function addToGoal(id, amount) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) return;
  goal.saved = Math.max(0, Math.round((goal.saved + amount) * 100) / 100);
  save();
}

// ——— Bills ———

export function isBillPaid(billId, key) {
  return (state.paidBills[key] || []).includes(billId);
}

export function setBillPaid(billId, key, paid) {
  const list = new Set(state.paidBills[key] || []);
  if (paid) list.add(billId);
  else list.delete(billId);
  state.paidBills[key] = [...list];
  save();
}

export function billsForMonth(key) {
  const [year, month] = key.split('-').map(Number);
  return state.bills
    .map((bill) => ({
      ...bill,
      date: `${year}-${String(month).padStart(2, '0')}-${String(Math.min(bill.dueDay, 28)).padStart(2, '0')}`,
      paid: isBillPaid(bill.id, key),
    }))
    .sort((a, b) => a.dueDay - b.dueDay);
}

// ——— Reports ———

// Six months ending at the given month: older months come from HISTORY,
// the two ledger months are computed from the transactions themselves.
export function sixMonthSeries(endKey) {
  const rows = [];
  const [year, month] = endKey.split('-').map(Number);
  for (let back = 5; back >= 0; back--) {
    const date = new Date(year, month - 1 - back, 1);
    const key = monthKey(date.getFullYear(), date.getMonth());
    const closed = HISTORY.find((row) => row.month === key);
    if (closed) rows.push({ key, income: closed.income, spent: closed.spent });
    else {
      const totals = monthTotals(key);
      rows.push({ key, income: totals.income, spent: totals.spent });
    }
  }
  return rows;
}

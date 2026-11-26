// main.js — the router and the wiring. Hash routes pick a view from views.js,
// the store holds the ledger, and every control the views render is answered
// here: month stepping, the transaction form, filters, envelope limits, goal
// contributions and bill toggles. After any change the current view re-renders
// from the store, so every page always agrees.

import { getState, setViewMonth, addTransaction, updateTransaction, deleteTransaction, setBudget, addToGoal, setBillPaid, resetAll, monthTotals, totalBudget } from './store.js';
import { dashboardView, transactionsView, budgetsView, goalsView, billsView, reportsView } from './views.js';
import { monthLabel, money, shiftMonthKey } from './format.js';

const MIN_MONTH = '2026-10';
const MAX_MONTH = '2026-11';

const ui = {
  txSearch: '',
  txType: 'all',
  txCategory: 'all',
  txSort: 'date-desc',
  editingId: null,
  formKind: 'expense',
  reportMonth: '2026-11',
};

const viewEl = document.getElementById('view');

function route() {
  const name = location.hash.replace('#/', '').split('/')[0];
  return ['dashboard', 'transactions', 'budgets', 'goals', 'bills', 'reports'].includes(name) ? name : 'dashboard';
}

function render() {
  const state = getState();
  const key = state.viewMonth;
  const current = route();

  document.getElementById('month-label').textContent = monthLabel(key);
  document.getElementById('prev-month').disabled = key <= MIN_MONTH;
  document.getElementById('next-month').disabled = key >= MAX_MONTH;
  for (const link of document.querySelectorAll('#main-nav a')) {
    link.classList.toggle('is-active', link.dataset.route === current);
  }

  const totals = monthTotals(key);
  document.getElementById('side-left').textContent = `${money(totals.balance, { cents: false })} left`;
  document.getElementById('side-sub').textContent =
    `Spent ${money(totals.spent, { cents: false })} of a ${money(totalBudget(), { cents: false })} plan in ${monthLabel(key).split(' ')[0]}.`;

  if (current === 'dashboard') viewEl.innerHTML = dashboardView(key);
  else if (current === 'transactions') viewEl.innerHTML = transactionsView(key, ui);
  else if (current === 'budgets') viewEl.innerHTML = budgetsView(key);
  else if (current === 'goals') viewEl.innerHTML = goalsView();
  else if (current === 'bills') viewEl.innerHTML = billsView(key);
  else viewEl.innerHTML = reportsView(ui.reportMonth);

  const titles = {
    dashboard: 'Dashboard', transactions: 'Transactions', budgets: 'Budgets',
    goals: 'Savings goals', bills: 'Bills & calendar', reports: 'Reports',
  };
  document.title = `${titles[current]} · Hearthhold — Household Budget`;

  bindView(current);
}

function bindView(current) {
  if (current === 'transactions') bindTransactions();
  if (current === 'budgets') bindBudgets();
  if (current === 'goals') bindGoals();
  if (current === 'bills') bindBills();
  if (current === 'reports') bindReports();
}

// ——— Transactions ———

function bindTransactions() {
  const form = document.getElementById('tx-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const entry = {
      date: String(data.get('date')),
      kind: String(data.get('kind')),
      category: String(data.get('category')),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
      note: String(data.get('note')).trim(),
    };
    if (!entry.date || !entry.note || !(entry.amount > 0)) return;
    if (ui.editingId) updateTransaction(ui.editingId, entry);
    else addTransaction(entry);
    ui.editingId = null;
    // A new entry may belong to the other ledger month; follow it there.
    const month = entry.date.slice(0, 7);
    if (month >= MIN_MONTH && month <= MAX_MONTH && month !== getState().viewMonth) setViewMonth(month);
    render();
  });

  document.getElementById('tx-kind').addEventListener('change', (event) => {
    ui.formKind = event.target.value;
    ui.editingId = null;
    render();
  });
  document.getElementById('tx-search').addEventListener('input', (event) => {
    ui.txSearch = event.target.value;
    render();
    const search = document.getElementById('tx-search');
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  });
  document.getElementById('tx-type').addEventListener('change', (event) => { ui.txType = event.target.value; render(); });
  document.getElementById('tx-filter-category').addEventListener('change', (event) => { ui.txCategory = event.target.value; render(); });
  document.getElementById('tx-sort').addEventListener('change', (event) => { ui.txSort = event.target.value; render(); });

  for (const button of viewEl.querySelectorAll('[data-action="tx-edit"]')) {
    button.addEventListener('click', () => {
      ui.editingId = button.dataset.id;
      render();
      document.getElementById('tx-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  for (const button of viewEl.querySelectorAll('[data-action="tx-delete"]')) {
    button.addEventListener('click', () => {
      deleteTransaction(button.dataset.id);
      if (ui.editingId === button.dataset.id) ui.editingId = null;
      render();
    });
  }
  const cancel = viewEl.querySelector('[data-action="tx-cancel-edit"]');
  if (cancel) cancel.addEventListener('click', () => { ui.editingId = null; render(); });
}

// ——— Budgets ———

function bindBudgets() {
  for (const form of viewEl.querySelectorAll('[data-action-form="budget"]')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const limit = Number(new FormData(form).get('limit'));
      if (Number.isFinite(limit) && limit >= 0) setBudget(form.dataset.category, limit);
      render();
    });
  }
}

// ——— Goals ———

function bindGoals() {
  for (const button of viewEl.querySelectorAll('[data-action="goal-quick"]')) {
    button.addEventListener('click', () => {
      addToGoal(button.dataset.id, Number(button.dataset.amount));
      render();
    });
  }
  for (const form of viewEl.querySelectorAll('[data-action-form="goal"]')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const amount = Number(new FormData(form).get('amount'));
      if (Number.isFinite(amount) && amount > 0) addToGoal(form.dataset.id, amount);
      render();
    });
  }
}

// ——— Bills ———

function bindBills() {
  const key = getState().viewMonth;
  for (const box of viewEl.querySelectorAll('[data-action="bill-paid"]')) {
    box.addEventListener('change', () => {
      setBillPaid(box.dataset.id, key, box.checked);
      render();
    });
  }
}

// ——— Reports ———

function bindReports() {
  for (const button of viewEl.querySelectorAll('[data-action="report-month"]')) {
    button.addEventListener('click', () => {
      ui.reportMonth = button.dataset.month;
      render();
    });
  }
}

// ——— Chrome (header / footer) ———

document.getElementById('prev-month').addEventListener('click', () => {
  const next = shiftMonthKey(getState().viewMonth, -1);
  if (next >= MIN_MONTH) { setViewMonth(next); render(); }
});
document.getElementById('next-month').addEventListener('click', () => {
  const next = shiftMonthKey(getState().viewMonth, 1);
  if (next <= MAX_MONTH) { setViewMonth(next); render(); }
});
document.getElementById('reset-data').addEventListener('click', () => {
  if (confirm('Reset the ledger back to the original demo figures? Your edits will be lost.')) {
    resetAll();
    Object.assign(ui, { txSearch: '', txType: 'all', txCategory: 'all', txSort: 'date-desc', editingId: null, reportMonth: '2026-11' });
    render();
  }
});

window.addEventListener('hashchange', render);
render();

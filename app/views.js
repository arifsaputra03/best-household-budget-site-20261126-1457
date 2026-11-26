// views.js — one render function per section of the site. Each returns an HTML
// string built from the store's live figures; main.js wires the controls after
// the string lands in the page. Nothing here is a placeholder: every number is
// computed from the ledger, and every control carries a data-action main.js
// answers.

import { CATEGORIES, categoryById, expenseCategories, TODAY } from './data.js';
import {
  monthTotals, spentByCategory, budgetRows, totalBudget, transactionsInMonth,
  billsForMonth, sixMonthSeries, getState,
} from './store.js';
import { donutChart, healthRing, groupedBars, meterBar } from './charts.js';
import { money, percent, prettyDate, monthLabel, monthShort, daysInMonth, escapeHtml } from './format.js';

function signedAmount(entry) {
  return entry.kind === 'income' ? `+${money(entry.amount)}` : `−${money(entry.amount)}`;
}

function categoryChip(category) {
  return `<span class="cat-chip"><span class="cat-dot" style="background:${category.color}"></span>${category.label}</span>`;
}

export function transactionRow(entry, { editable = false } = {}) {
  const category = categoryById(entry.category);
  const buttons = editable
    ? `<span class="row-actions">
         <button type="button" class="btn btn-ghost btn-small" data-action="tx-edit" data-id="${entry.id}">Edit</button>
         <button type="button" class="btn btn-ghost btn-small btn-danger" data-action="tx-delete" data-id="${entry.id}">Delete</button>
       </span>`
    : '';
  return `<li class="tx-row">
    <span class="cat-dot cat-dot-lg" style="background:${category.color}"></span>
    <span class="tx-main">
      <span class="tx-note">${escapeHtml(entry.note)}</span>
      <span class="tx-meta">${categoryChip(category)} · ${prettyDate(entry.date)}</span>
    </span>
    <span class="tx-amount ${entry.kind}">${signedAmount(entry)}</span>
    ${buttons}
  </li>`;
}

// ——— Dashboard ———

export function dashboardView(key) {
  const totals = monthTotals(key);
  const budget = totalBudget();
  const usedRatio = budget > 0 ? totals.spent / budget : 0;
  const byCategory = spentByCategory(key);
  const recent = transactionsInMonth(key).slice(0, 6);
  const bills = billsForMonth(key).filter((bill) => !bill.paid).slice(0, 3);
  const tightest = budgetRows(key).filter((row) => row.ratio >= 0.85).slice(0, 3);
  const savedRate = totals.income > 0 ? Math.max(0, (totals.income - totals.spent) / totals.income) : 0;

  const day = key === '2026-11' ? Number(TODAY.slice(8)) : daysInMonth(key);
  const monthPace = Math.round((day / daysInMonth(key)) * 100);
  const paceNote = usedRatio * 100 > monthPace
    ? `Spending is a little ahead of the calendar — ${Math.round(usedRatio * 100)}% of the budget used with ${monthPace}% of the month gone.`
    : `Spending is keeping pace — ${Math.round(usedRatio * 100)}% of the budget used with ${monthPace}% of the month gone.`;

  const donut = donutChart(
    byCategory.map((row) => ({ label: row.category.label, amount: row.amount, color: row.category.color })),
    { centerLabel: 'spent', centerValue: money(totals.spent, { cents: false }) },
  );
  const legend = byCategory.map((row) => `<li>
      <span class="cat-dot" style="background:${row.category.color}"></span>
      <span class="legend-name">${row.category.label}</span>
      <span class="legend-amt">${money(row.amount)}</span>
      <span class="legend-pct">${percent(row.amount, totals.spent)}%</span>
    </li>`).join('');

  return `
  <section class="page-head">
    <h1>${monthLabel(key)} at home</h1>
    <p class="page-sub">The Hartley ledger — two salaries in, one household out. Everything below is live: add an entry and the whole page moves.</p>
  </section>

  <section class="stat-grid">
    <article class="stat-card"><p class="stat-label">Income</p><p class="stat-value income">${money(totals.income)}</p><p class="stat-note">Two salaries${totals.income > 6790 ? ' and a little extra' : ''}</p></article>
    <article class="stat-card"><p class="stat-label">Spent</p><p class="stat-value">${money(totals.spent)}</p><p class="stat-note">Across ${byCategory.length} categories</p></article>
    <article class="stat-card"><p class="stat-label">Left from income</p><p class="stat-value">${money(totals.balance)}</p><p class="stat-note">Before December's bills</p></article>
    <article class="stat-card"><p class="stat-label">Savings rate</p><p class="stat-value">${Math.round(savedRate * 100)}%</p><p class="stat-note">Of income not spent</p></article>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>Budget health</h2>
      <div class="ring-wrap">${healthRing(usedRatio)}</div>
      <p class="card-note">${paceNote}</p>
      <p class="card-note">Envelopes total ${money(budget, { cents: false })} for the month.</p>
      ${tightest.length ? `<h3 class="mini-head">Envelopes to watch</h3>
        <ul class="mini-budgets">${tightest.map((row) => `<li>
          <span>${row.category.label}</span>${meterBar(row.ratio, row.left < 0 ? '#c0392b' : '#d98e4a')}
          <span class="mini-budget-amt">${money(row.used, { cents: false })} / ${money(row.limit, { cents: false })}</span>
        </li>`).join('')}</ul>` : ''}
      <a class="card-link" href="#/budgets">Open all budgets →</a>
    </article>

    <article class="card">
      <h2>Where it went</h2>
      <div class="donut-wrap">${donut}</div>
      <ul class="legend">${legend}</ul>
      <a class="card-link" href="#/reports">See the full report →</a>
    </article>
  </section>

  <section class="two-col">
    <article class="card">
      <h2>Recent activity</h2>
      <ul class="tx-list">${recent.map((entry) => transactionRow(entry)).join('') || '<li class="empty">No entries this month yet.</li>'}</ul>
      <a class="card-link" href="#/transactions">All transactions →</a>
    </article>

    <article class="card">
      <h2>Still to pay in ${monthLabel(key).split(' ')[0]}</h2>
      <ul class="bill-mini">${bills.map((bill) => `<li>
          <span class="bill-day">${bill.dueDay}</span>
          <span class="tx-main"><span class="tx-note">${escapeHtml(bill.name)}</span><span class="tx-meta">Due ${prettyDate(bill.date)}${bill.autopay ? ' · autopay' : ''}</span></span>
          <span class="tx-amount">${money(bill.amount)}</span>
        </li>`).join('') || '<li class="empty">Everything is paid. Nice.</li>'}</ul>
      <a class="card-link" href="#/bills">Bills &amp; calendar →</a>
    </article>
  </section>`;
}

// ——— Transactions ———

export function transactionsView(key, ui) {
  const all = transactionsInMonth(key);
  const filtered = all.filter((entry) => {
    if (ui.txType !== 'all' && entry.kind !== ui.txType) return false;
    if (ui.txCategory !== 'all' && entry.category !== ui.txCategory) return false;
    if (ui.txSearch && !entry.note.toLowerCase().includes(ui.txSearch.toLowerCase())) return false;
    return true;
  });
  const sorters = {
    'date-desc': (a, b) => (a.date < b.date ? 1 : -1),
    'date-asc': (a, b) => (a.date > b.date ? 1 : -1),
    'amount-desc': (a, b) => b.amount - a.amount,
    'amount-asc': (a, b) => a.amount - b.amount,
  };
  filtered.sort(sorters[ui.txSort] || sorters['date-desc']);

  const shownIncome = filtered.filter((e) => e.kind === 'income').reduce((s, e) => s + e.amount, 0);
  const shownSpent = filtered.filter((e) => e.kind === 'expense').reduce((s, e) => s + e.amount, 0);
  const editing = ui.editingId ? getState().transactions.find((e) => e.id === ui.editingId) : null;
  const formKind = editing ? editing.kind : ui.formKind;
  const formCategories = CATEGORIES.filter((category) => category.kind === formKind);

  const categoryOptions = CATEGORIES.map((category) =>
    `<option value="${category.id}" ${ui.txCategory === category.id ? 'selected' : ''}>${category.label}</option>`).join('');

  return `
  <section class="page-head">
    <h1>Transactions</h1>
    <p class="page-sub">Every dollar in and out of the house in ${monthLabel(key)}. Add, edit or remove an entry — the dashboard, budgets and reports all update with it.</p>
  </section>

  <section class="card">
    <h2>${editing ? 'Edit entry' : 'Add an entry'}</h2>
    <form id="tx-form" class="tx-form">
      <label>Date<input type="date" name="date" required min="2026-10-01" max="2026-11-30" value="${editing ? editing.date : TODAY}"></label>
      <label>Type
        <select name="kind" id="tx-kind">
          <option value="expense" ${formKind === 'expense' ? 'selected' : ''}>Expense</option>
          <option value="income" ${formKind === 'income' ? 'selected' : ''}>Income</option>
        </select>
      </label>
      <label>Category
        <select name="category" id="tx-category">
          ${formCategories.map((category) => `<option value="${category.id}" ${editing && editing.category === category.id ? 'selected' : ''}>${category.label}</option>`).join('')}
        </select>
      </label>
      <label>Amount $<input type="number" name="amount" required min="0.01" step="0.01" placeholder="0.00" value="${editing ? editing.amount : ''}"></label>
      <label class="tx-form-note">Note<input type="text" name="note" required maxlength="80" placeholder="What was it for?" value="${editing ? escapeHtml(editing.note) : ''}"></label>
      <span class="tx-form-actions">
        <button type="submit" class="btn btn-primary">${editing ? 'Save changes' : 'Add entry'}</button>
        ${editing ? '<button type="button" class="btn btn-ghost" data-action="tx-cancel-edit">Cancel</button>' : ''}
      </span>
    </form>
  </section>

  <section class="card">
    <div class="toolbar">
      <input type="search" id="tx-search" placeholder="Search notes…" value="${escapeHtml(ui.txSearch)}" aria-label="Search notes">
      <select id="tx-type" aria-label="Filter by type">
        <option value="all" ${ui.txType === 'all' ? 'selected' : ''}>Income &amp; expenses</option>
        <option value="income" ${ui.txType === 'income' ? 'selected' : ''}>Income only</option>
        <option value="expense" ${ui.txType === 'expense' ? 'selected' : ''}>Expenses only</option>
      </select>
      <select id="tx-filter-category" aria-label="Filter by category">
        <option value="all" ${ui.txCategory === 'all' ? 'selected' : ''}>All categories</option>
        ${categoryOptions}
      </select>
      <select id="tx-sort" aria-label="Sort entries">
        <option value="date-desc" ${ui.txSort === 'date-desc' ? 'selected' : ''}>Newest first</option>
        <option value="date-asc" ${ui.txSort === 'date-asc' ? 'selected' : ''}>Oldest first</option>
        <option value="amount-desc" ${ui.txSort === 'amount-desc' ? 'selected' : ''}>Biggest first</option>
        <option value="amount-asc" ${ui.txSort === 'amount-asc' ? 'selected' : ''}>Smallest first</option>
      </select>
    </div>
    <p class="totals-strip">Showing ${filtered.length} of ${all.length} entries · income <strong>${money(shownIncome)}</strong> · spent <strong>${money(shownSpent)}</strong> · net <strong>${money(shownIncome - shownSpent)}</strong></p>
    <ul class="tx-list tx-list-editable">
      ${filtered.map((entry) => transactionRow(entry, { editable: true })).join('') || '<li class="empty">Nothing matches those filters. Try widening the search.</li>'}
    </ul>
  </section>`;
}

// ——— Budgets ———

export function budgetsView(key) {
  const rows = budgetRows(key);
  const totals = monthTotals(key);
  const budget = totalBudget();
  const cards = rows.map((row) => {
    const status = row.left < 0
      ? `<span class="badge badge-over">Over by ${money(-row.left)}</span>`
      : row.ratio >= 0.9
        ? `<span class="badge badge-close">Close — ${money(row.left)} left</span>`
        : `<span class="badge badge-ok">On track</span>`;
    const barColor = row.left < 0 ? '#c0392b' : row.ratio >= 0.9 ? '#d98e4a' : row.category.color;
    return `<article class="card envelope">
      <header class="envelope-head">
        <span class="cat-dot cat-dot-lg" style="background:${row.category.color}"></span>
        <h3>${row.category.label}</h3>
        ${status}
      </header>
      <p class="envelope-figures"><strong>${money(row.used)}</strong> spent of ${money(row.limit, { cents: false })} · ${row.left >= 0 ? `${money(row.left)} left` : `${money(-row.left)} too much`}</p>
      <div class="meter meter-lg"><span class="meter-fill" style="width:${Math.min(100, row.ratio * 100).toFixed(1)}%;background:${barColor}"></span></div>
      <form class="budget-form" data-action-form="budget" data-category="${row.category.id}">
        <label>Monthly limit $<input type="number" name="limit" min="0" step="1" value="${row.limit}"></label>
        <button type="submit" class="btn btn-ghost btn-small">Save limit</button>
      </form>
    </article>`;
  }).join('');

  return `
  <section class="page-head">
    <h1>Budgets &amp; envelopes</h1>
    <p class="page-sub">One envelope per kind of spending, refilled on the 1st. ${monthLabel(key)}: ${money(totals.spent)} spent against ${money(budget, { cents: false })} planned. Change a limit and the dashboard ring moves too.</p>
  </section>
  <section class="envelope-grid">${cards}</section>`;
}

// ——— Savings goals ———

export function goalsView() {
  const goals = getState().goals;
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const cards = goals.map((goal) => {
    const ratio = goal.target > 0 ? goal.saved / goal.target : 0;
    const reached = goal.saved >= goal.target;
    const monthsLeft = !reached && goal.monthly > 0 ? Math.ceil((goal.target - goal.saved) / goal.monthly) : 0;
    return `<article class="card goal">
      <header class="goal-head"><h3>${escapeHtml(goal.name)}</h3>${reached ? '<span class="badge badge-ok">Goal reached</span>' : ''}</header>
      <p class="goal-note">${escapeHtml(goal.note)}</p>
      <p class="goal-figures"><strong>${money(goal.saved, { cents: false })}</strong> of ${money(goal.target, { cents: false })} · ${Math.round(ratio * 100)}%</p>
      <div class="meter meter-lg"><span class="meter-fill" style="width:${Math.min(100, ratio * 100).toFixed(1)}%;background:#2e7d52"></span></div>
      <p class="card-note">${reached ? 'Fully funded — time to enjoy it, or raise the target.' : `At ${money(goal.monthly, { cents: false })} a month this lands in about ${monthsLeft} month${monthsLeft === 1 ? '' : 's'}.`}</p>
      <form class="goal-form" data-action-form="goal" data-id="${goal.id}">
        <span class="goal-quick">
          <button type="button" class="btn btn-ghost btn-small" data-action="goal-quick" data-id="${goal.id}" data-amount="25">+$25</button>
          <button type="button" class="btn btn-ghost btn-small" data-action="goal-quick" data-id="${goal.id}" data-amount="50">+$50</button>
        </span>
        <label>$<input type="number" name="amount" min="1" step="1" placeholder="Amount"></label>
        <button type="submit" class="btn btn-primary btn-small">Add funds</button>
      </form>
    </article>`;
  }).join('');

  return `
  <section class="page-head">
    <h1>Savings goals</h1>
    <p class="page-sub">${money(totalSaved, { cents: false })} saved toward ${money(totalTarget, { cents: false })} of goals. Contributions come out of the month's leftover — little and often beats big and rare.</p>
  </section>
  <section class="goal-grid">${cards}</section>`;
}

// ——— Bills & calendar ———

export function billsView(key) {
  const bills = billsForMonth(key);
  const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidSum = bills.filter((bill) => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);

  const rows = bills.map((bill) => {
    const category = categoryById(bill.category);
    return `<li class="bill-row ${bill.paid ? 'is-paid' : ''}">
      <span class="bill-date"><strong>${bill.dueDay}</strong><small>${monthShort(Number(key.split('-')[1]) - 1)}</small></span>
      <span class="tx-main">
        <span class="tx-note">${escapeHtml(bill.name)}</span>
        <span class="tx-meta">${categoryChip(category)}${bill.autopay ? ' · autopay' : ' · pay manually'}</span>
      </span>
      <span class="tx-amount">${money(bill.amount)}</span>
      <label class="paid-toggle"><input type="checkbox" data-action="bill-paid" data-id="${bill.id}" ${bill.paid ? 'checked' : ''}> Paid</label>
    </li>`;
  }).join('');

  // Calendar grid for the viewed month, weeks starting Monday.
  const [year, month] = key.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = daysInMonth(key);
  const byDay = new Map();
  for (const bill of bills) {
    if (!byDay.has(bill.dueDay)) byDay.set(bill.dueDay, []);
    byDay.get(bill.dueDay).push(bill);
  }
  const todayDay = key === TODAY.slice(0, 7) ? Number(TODAY.slice(8)) : -1;
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="cal-cell cal-blank"></span>';
  for (let day = 1; day <= count; day++) {
    const dayBills = byDay.get(day) || [];
    const dots = dayBills.map((bill) => `<span class="cal-dot" style="background:${categoryById(bill.category).color}" title="${escapeHtml(bill.name)} — ${money(bill.amount)}"></span>`).join('');
    const names = dayBills.map((bill) => `<small class="cal-bill ${bill.paid ? 'is-paid' : ''}">${escapeHtml(bill.name.split('—')[0].trim())}</small>`).join('');
    cells += `<span class="cal-cell ${day === todayDay ? 'cal-today' : ''}"><strong>${day}</strong><span class="cal-dots">${dots}</span>${names}</span>`;
  }

  return `
  <section class="page-head">
    <h1>Bills &amp; calendar</h1>
    <p class="page-sub">The month's fixed outgoings, on the day they land. Tick a bill off when it is paid — the dashboard's "still to pay" list follows.</p>
  </section>
  <section class="stat-grid stat-grid-3">
    <article class="stat-card"><p class="stat-label">Total due</p><p class="stat-value">${money(totalDue)}</p><p class="stat-note">${bills.length} recurring bills</p></article>
    <article class="stat-card"><p class="stat-label">Paid so far</p><p class="stat-value income">${money(paidSum)}</p><p class="stat-note">${bills.filter((b) => b.paid).length} of ${bills.length} settled</p></article>
    <article class="stat-card"><p class="stat-label">Still to pay</p><p class="stat-value">${money(totalDue - paidSum)}</p><p class="stat-note">Before the month turns</p></article>
  </section>
  <section class="two-col">
    <article class="card"><h2>Bill list</h2><ul class="bill-list">${rows}</ul></article>
    <article class="card">
      <h2>${monthLabel(key)}</h2>
      <div class="cal-head"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      <div class="cal-grid">${cells}</div>
      <p class="card-note">Coloured dots are bills due that day; the outlined day is today.</p>
    </article>
  </section>`;
}

// ——— Reports ———

export function reportsView(reportMonth) {
  const series = sixMonthSeries('2026-11');
  const chart = groupedBars(series.map((row) => ({ ...row, label: monthShort(Number(row.key.split('-')[1]) - 1) })));
  const totals = monthTotals(reportMonth);
  const byCategory = spentByCategory(reportMonth);
  const previousKey = reportMonth === '2026-11' ? '2026-10' : null;
  const previous = previousKey ? spentByCategory(previousKey) : [];
  const previousMap = new Map(previous.map((row) => [row.category.id, row.amount]));

  const breakdown = byCategory.map((row) => `<tr>
      <td><span class="cat-dot" style="background:${row.category.color}"></span>${row.category.label}</td>
      <td>${meterBar(row.amount / Math.max(1, totals.spent), row.category.color)}</td>
      <td class="num">${percent(row.amount, totals.spent)}%</td>
      <td class="num">${money(row.amount)}</td>
    </tr>`).join('');

  const changes = previousKey ? byCategory.map((row) => {
    const before = previousMap.get(row.category.id) || 0;
    const delta = row.amount - before;
    return { label: row.category.label, color: row.category.color, before, now: row.amount, delta };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5) : [];

  const top = byCategory[0];
  return `
  <section class="page-head">
    <h1>Reports</h1>
    <p class="page-sub">Half a year of the household in one view — and the detail for the month you pick.</p>
  </section>

  <section class="card">
    <h2>Income vs spending — June to November 2026</h2>
    <p class="chart-legend"><span class="cat-dot" style="background:#2e7d52"></span> Income <span class="cat-dot" style="background:#d98e4a"></span> Spent</p>
    ${chart}
    <p class="card-note">Every month this year the house spent less than it earned. The steadiest win: spending has eased from ${money(series[0].spent, { cents: false })} in June to ${money(series[series.length - 1].spent, { cents: false })} in November.</p>
  </section>

  <section class="card">
    <div class="report-switch">
      <h2>Month detail</h2>
      <span class="switch-group" role="group" aria-label="Choose month">
        <button type="button" class="chip-btn chip-wide ${reportMonth === '2026-10' ? 'is-active' : ''}" data-action="report-month" data-month="2026-10">October 2026</button>
        <button type="button" class="chip-btn chip-wide ${reportMonth === '2026-11' ? 'is-active' : ''}" data-action="report-month" data-month="2026-11">November 2026</button>
      </span>
    </div>
    <section class="stat-grid stat-grid-3">
      <article class="stat-card"><p class="stat-label">Income</p><p class="stat-value income">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Spent</p><p class="stat-value">${money(totals.spent)}</p></article>
      <article class="stat-card"><p class="stat-label">Kept</p><p class="stat-value">${money(totals.balance)}</p></article>
    </section>
    <table class="breakdown">
      <thead><tr><th>Category</th><th>Share</th><th></th><th class="num">Amount</th></tr></thead>
      <tbody>${breakdown}</tbody>
    </table>
    <p class="card-note">Biggest slice: ${top.category.label} at ${money(top.amount)} (${percent(top.amount, totals.spent)}% of spending) — most of it the rent, the one bill that never moves.</p>
  </section>

  ${changes.length ? `<section class="card">
    <h2>What changed vs October</h2>
    <ul class="change-list">${changes.map((row) => `<li>
      <span class="cat-dot" style="background:${row.color}"></span><span class="change-name">${row.label}</span>
      <span class="change-vals">${money(row.before)} → ${money(row.now)}</span>
      <span class="change-delta ${row.delta <= 0 ? 'down' : 'up'}">${row.delta <= 0 ? '▼' : '▲'} ${money(Math.abs(row.delta))}</span>
    </li>`).join('')}</ul>
    <p class="card-note">Down is good news for spending. Dining out is the one to watch — it also broke its envelope this month.</p>
  </section>` : ''}`;
}

// data.js — the Hartley household's starting ledger.
// Categories, a realistic October and November 2026 of transactions, monthly
// envelope limits, savings goals, recurring bills and the six-month history the
// reports page charts. store.js loads this seed on first run, then the family's
// own edits take over (kept in localStorage).

export const CATEGORIES = [
  { id: 'salary', label: 'Salary', kind: 'income', color: '#2e7d52' },
  { id: 'other-income', label: 'Other income', kind: 'income', color: '#6aa84f' },
  { id: 'housing', label: 'Housing', kind: 'expense', color: '#b5654a' },
  { id: 'groceries', label: 'Groceries', kind: 'expense', color: '#5b8c5a' },
  { id: 'utilities', label: 'Utilities', kind: 'expense', color: '#4a7fa5' },
  { id: 'transport', label: 'Transport', kind: 'expense', color: '#7a6fb0' },
  { id: 'dining', label: 'Dining out', kind: 'expense', color: '#d98e4a' },
  { id: 'health', label: 'Health', kind: 'expense', color: '#4aa58e' },
  { id: 'kids', label: 'Kids & school', kind: 'expense', color: '#c45f7d' },
  { id: 'fun', label: 'Fun & streaming', kind: 'expense', color: '#8a9a5b' },
  { id: 'home', label: 'Home & garden', kind: 'expense', color: '#96705a' },
  { id: 'other', label: 'Everything else', kind: 'expense', color: '#8d8d94' },
];

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function expenseCategories() {
  return CATEGORIES.filter((category) => category.kind === 'expense');
}

// One transaction: { id, date: "YYYY-MM-DD", kind: "income"|"expense", category, amount, note }
function tx(id, date, kind, category, amount, note) {
  return { id, date, kind, category, amount, note };
}

export const SEED_TRANSACTIONS = [
  // — November 2026 income —
  tx('n01', '2026-11-01', 'income', 'salary', 3850.0, 'Alex — monthly salary'),
  tx('n02', '2026-11-05', 'income', 'salary', 2940.0, 'Sam — monthly salary'),
  tx('n03', '2026-11-14', 'income', 'other-income', 180.0, 'Sold the old bike'),
  // — November 2026 spending —
  tx('n04', '2026-11-01', 'expense', 'housing', 1650.0, 'Rent — Maple Street flat'),
  tx('n05', '2026-11-02', 'expense', 'groceries', 158.4, 'GreenMart weekly shop'),
  tx('n06', '2026-11-02', 'expense', 'kids', 92.0, 'School lunches — November'),
  tx('n07', '2026-11-03', 'expense', 'transport', 50.0, 'Two monthly bus passes'),
  tx('n08', '2026-11-04', 'expense', 'transport', 62.3, 'Fuel for the hatchback'),
  tx('n09', '2026-11-06', 'expense', 'groceries', 138.2, 'GreenMart weekly shop'),
  tx('n10', '2026-11-06', 'expense', 'fun', 27.99, 'Streaming bundle'),
  tx('n11', '2026-11-07', 'expense', 'health', 36.8, 'Pharmacy — prescriptions'),
  tx('n12', '2026-11-08', 'expense', 'dining', 48.5, 'Pizza night with the cousins'),
  tx('n13', '2026-11-09', 'expense', 'utilities', 118.6, 'Electric bill'),
  tx('n14', '2026-11-10', 'expense', 'home', 18.6, 'Light bulbs and batteries'),
  tx('n15', '2026-11-11', 'expense', 'kids', 54.99, 'New shoes for Mia'),
  tx('n16', '2026-11-12', 'expense', 'utilities', 46.2, 'Water bill'),
  tx('n17', '2026-11-13', 'expense', 'groceries', 164.75, 'GreenMart weekly shop'),
  tx('n18', '2026-11-13', 'expense', 'other', 40.0, "Gift for Grandma's birthday"),
  tx('n19', '2026-11-14', 'expense', 'fun', 38.0, 'Cinema tickets — family matinee'),
  tx('n20', '2026-11-15', 'expense', 'utilities', 59.99, 'Internet — fibre plan'),
  tx('n21', '2026-11-15', 'expense', 'dining', 64.2, 'Sushi lunch downtown'),
  tx('n22', '2026-11-16', 'expense', 'kids', 23.45, 'Art supplies for Leo'),
  tx('n23', '2026-11-17', 'expense', 'transport', 58.9, 'Fuel for the hatchback'),
  tx('n24', '2026-11-18', 'expense', 'utilities', 74.0, 'Phone plan — two lines'),
  tx('n25', '2026-11-19', 'expense', 'health', 85.0, 'Dentist copay — Sam'),
  tx('n26', '2026-11-19', 'expense', 'dining', 32.4, 'Coffee runs this week'),
  tx('n27', '2026-11-20', 'expense', 'groceries', 121.35, 'GreenMart weekly shop'),
  tx('n28', '2026-11-20', 'expense', 'other', 9.8, 'Stamps and a parcel'),
  tx('n29', '2026-11-21', 'expense', 'transport', 65.0, 'Car service — deposit'),
  tx('n30', '2026-11-21', 'expense', 'fun', 24.95, 'Board game for games night'),
  tx('n31', '2026-11-22', 'expense', 'dining', 58.75, 'Sunday brunch'),
  tx('n32', '2026-11-23', 'expense', 'home', 27.35, 'Garden soil and seeds'),
  tx('n33', '2026-11-24', 'expense', 'groceries', 119.6, 'GreenMart weekly shop'),
  tx('n34', '2026-11-25', 'expense', 'dining', 41.3, 'Takeaway curry'),
  tx('n35', '2026-11-26', 'expense', 'groceries', 12.3, 'Bakery and milk top-up'),

  // — October 2026 income —
  tx('o01', '2026-10-01', 'income', 'salary', 3850.0, 'Alex — monthly salary'),
  tx('o02', '2026-10-05', 'income', 'salary', 2940.0, 'Sam — monthly salary'),
  tx('o03', '2026-10-18', 'income', 'other-income', 95.0, 'Freelance proofreading'),
  // — October 2026 spending —
  tx('o04', '2026-10-01', 'expense', 'housing', 1650.0, 'Rent — Maple Street flat'),
  tx('o05', '2026-10-03', 'expense', 'groceries', 171.25, 'GreenMart weekly shop'),
  tx('o06', '2026-10-04', 'expense', 'transport', 50.0, 'Two monthly bus passes'),
  tx('o07', '2026-10-06', 'expense', 'fun', 27.99, 'Streaming bundle'),
  tx('o08', '2026-10-07', 'expense', 'utilities', 112.4, 'Electric bill'),
  tx('o09', '2026-10-09', 'expense', 'groceries', 149.8, 'GreenMart weekly shop'),
  tx('o10', '2026-10-10', 'expense', 'dining', 52.6, 'Ramen with friends'),
  tx('o11', '2026-10-12', 'expense', 'kids', 88.0, 'School lunches — October'),
  tx('o12', '2026-10-13', 'expense', 'utilities', 44.85, 'Water bill'),
  tx('o13', '2026-10-14', 'expense', 'transport', 66.15, 'Fuel for the hatchback'),
  tx('o14', '2026-10-15', 'expense', 'utilities', 59.99, 'Internet — fibre plan'),
  tx('o15', '2026-10-16', 'expense', 'groceries', 183.4, 'GreenMart — big restock'),
  tx('o16', '2026-10-17', 'expense', 'health', 42.5, 'Pharmacy — vitamins and plasters'),
  tx('o17', '2026-10-18', 'expense', 'utilities', 74.0, 'Phone plan — two lines'),
  tx('o18', '2026-10-19', 'expense', 'kids', 61.2, 'New backpack for Leo'),
  tx('o19', '2026-10-21', 'expense', 'home', 84.3, 'Curtain rails and fixings'),
  tx('o20', '2026-10-22', 'expense', 'dining', 47.9, 'Bakery treats and coffee'),
  tx('o21', '2026-10-23', 'expense', 'groceries', 156.7, 'GreenMart weekly shop'),
  tx('o22', '2026-10-24', 'expense', 'fun', 56.0, 'Concert stream and snacks'),
  tx('o23', '2026-10-26', 'expense', 'transport', 59.7, 'Fuel for the hatchback'),
  tx('o24', '2026-10-27', 'expense', 'other', 35.5, 'Halloween costumes'),
  tx('o25', '2026-10-28', 'expense', 'health', 120.0, 'Eye test and lenses — Alex'),
  tx('o26', '2026-10-30', 'expense', 'groceries', 98.65, 'GreenMart top-up shop'),
];

// Monthly envelope limits in dollars, per expense category.
export const SEED_BUDGETS = {
  housing: 1650,
  groceries: 720,
  utilities: 300,
  transport: 240,
  dining: 220,
  health: 150,
  kids: 200,
  fun: 120,
  home: 120,
  other: 80,
};

// Savings goals: { id, name, target, saved, monthly, note }
export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 10000, saved: 6850, monthly: 300, note: 'Six months of essentials, kept in the high-interest account.' },
  { id: 'g2', name: 'Family trip to the coast', target: 2400, saved: 1560, monthly: 200, note: 'A week in a small cottage next summer — train fares included.' },
  { id: 'g3', name: 'New washing machine', target: 850, saved: 850, monthly: 60, note: 'The old one rattles through every spin cycle. Fund complete!' },
  { id: 'g4', name: "Kids' bike fund", target: 320, saved: 145, monthly: 40, note: 'Two bikes, two helmets, one bell each — by spring.' },
];

// Recurring bills: { id, name, category, amount, dueDay, autopay }
// Whether this month's bill is paid is kept per month in the store.
export const SEED_BILLS = [
  { id: 'b1', name: 'Rent — Maple Street flat', category: 'housing', amount: 1650.0, dueDay: 1, autopay: true },
  { id: 'b2', name: 'Streaming bundle', category: 'fun', amount: 27.99, dueDay: 6, autopay: true },
  { id: 'b3', name: 'Electric bill', category: 'utilities', amount: 118.6, dueDay: 9, autopay: false },
  { id: 'b4', name: 'Water bill', category: 'utilities', amount: 46.2, dueDay: 12, autopay: false },
  { id: 'b5', name: 'Internet — fibre plan', category: 'utilities', amount: 59.99, dueDay: 15, autopay: true },
  { id: 'b6', name: 'Phone plan — two lines', category: 'utilities', amount: 74.0, dueDay: 18, autopay: true },
  { id: 'b7', name: 'Gym membership', category: 'health', amount: 39.0, dueDay: 27, autopay: true },
  { id: 'b8', name: 'Car insurance', category: 'transport', amount: 96.5, dueDay: 28, autopay: false },
];

// Bills already settled in November 2026 when the demo opens.
export const SEED_PAID_BILLS = { '2026-11': ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] };

// Closed months before the ledger's transactions begin, for the reports chart.
// October and November are computed from the transactions themselves.
export const HISTORY = [
  { month: '2026-06', income: 6640, spent: 3985 },
  { month: '2026-07', income: 6790, spent: 4210 },
  { month: '2026-08', income: 6790, spent: 4052 },
  { month: '2026-09', income: 6790, spent: 3874 },
];

export const CURRENT_MONTH = '2026-11';
export const TODAY = '2026-11-26';

// data.js — the household's books: categories, budgets and seed records.
//
// 「くらしの台帳」 is the ledger of a fictional three-person household
// (a couple, both working, with one child at primary school). October
// 2026 is the main month and September 2026 the comparison month; both
// are itemised in full below, and every total the site shows — income,
// living expenses, savings, the free balance left over — is computed
// from these lines, so no two pages can ever disagree.
//
// October at a glance (all derived from the lines below):
//   income ¥570,000 = salary ¥320,000 + salary ¥240,000 + child allowance ¥10,000
//   living expenses ¥330,600, savings ¥150,000, free balance ¥89,400
//
// A transaction is one line:
//   { d: '2026-10-02', k: 'expense', c: 'food', a: 8940,
//     n: 'イオンスタイル', p: 'カード' }
//     d = date, k = 'income' | 'expense' | 'saving', c = category id,
//     a = amount in yen, n = shop or purpose, p = how it was paid
//     ('現金' cash, 'カード' card, '口座振替' bank transfer,
//      '電子マネー' e-money).

export const EXPENSE_CATEGORIES = [
  { id: 'housing', name: '住居費', color: '#8a7b68', budget: 100000, fixed: true },
  { id: 'food', name: '食費', color: '#c77d4f', budget: 85000, fixed: false },
  { id: 'utilities', name: '水道光熱費', color: '#d9a441', budget: 26000, fixed: false },
  { id: 'daily', name: '日用品', color: '#9aa87c', budget: 14000, fixed: false },
  { id: 'telecom', name: '通信費', color: '#718b70', budget: 12000, fixed: true },
  { id: 'transport', name: '交通費', color: '#6e8ca0', budget: 20000, fixed: false },
  { id: 'education', name: '教育費', color: '#7d6b91', budget: 34000, fixed: true },
  { id: 'medical', name: '保険・医療', color: '#b76e79', budget: 18000, fixed: true },
  { id: 'leisure', name: 'レジャー', color: '#d58a62', budget: 25000, fixed: false },
  { id: 'subscription', name: 'サブスク', color: '#5f7161', budget: 4000, fixed: true },
  { id: 'other', name: 'その他', color: '#a39e93', budget: 22000, fixed: false },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: '給与', color: '#718b70' },
  { id: 'allowance', name: '手当・給付', color: '#9aa87c' },
  { id: 'side', name: '副収入', color: '#c9b458' },
];

export const SAVING_CATEGORIES = [
  { id: 'fund', name: 'つみたて投資', color: '#4e6e58' },
  { id: 'deposit', name: '積立預金', color: '#7d9b76' },
];

export const SEED_TRANSACTIONS = [
  // ---- 2026年9月（比較月） ----
  { d: '2026-09-02', k: 'expense', c: 'food', a: 8620, n: 'ライフ', p: 'カード' },
  { d: '2026-09-05', k: 'expense', c: 'food', a: 9240, n: 'イオンスタイル', p: 'カード' },
  { d: '2026-09-05', k: 'expense', c: 'education', a: 24000, n: '塾（9月分）', p: '口座振替' },
  { d: '2026-09-08', k: 'expense', c: 'food', a: 1180, n: 'セブン-イレブン', p: '電子マネー' },
  { d: '2026-09-09', k: 'expense', c: 'daily', a: 5120, n: 'ウエルシア', p: 'カード' },
  { d: '2026-09-10', k: 'expense', c: 'food', a: 7940, n: 'ライフ', p: 'カード' },
  { d: '2026-09-10', k: 'expense', c: 'utilities', a: 4680, n: '東京都水道局', p: '口座振替' },
  { d: '2026-09-10', k: 'income', c: 'allowance', a: 10000, n: '児童手当', p: '口座振替' },
  { d: '2026-09-12', k: 'expense', c: 'education', a: 6800, n: 'スイミングスクール', p: '口座振替' },
  { d: '2026-09-13', k: 'expense', c: 'food', a: 4120, n: '外食（うどん）', p: 'カード' },
  { d: '2026-09-14', k: 'expense', c: 'medical', a: 1500, n: '内科クリニック', p: '現金' },
  { d: '2026-09-14', k: 'expense', c: 'medical', a: 900, n: '調剤薬局', p: '現金' },
  { d: '2026-09-15', k: 'expense', c: 'food', a: 7480, n: '業務スーパー', p: '現金' },
  { d: '2026-09-15', k: 'expense', c: 'utilities', a: 12680, n: '東京電力', p: '口座振替' },
  { d: '2026-09-16', k: 'expense', c: 'transport', a: 6400, n: 'ENEOS', p: 'カード' },
  { d: '2026-09-17', k: 'expense', c: 'daily', a: 3860, n: 'マツモトキヨシ', p: 'カード' },
  { d: '2026-09-18', k: 'expense', c: 'food', a: 8860, n: 'ライフ', p: 'カード' },
  { d: '2026-09-19', k: 'expense', c: 'leisure', a: 12800, n: 'キャンプ用品', p: 'カード' },
  { d: '2026-09-20', k: 'expense', c: 'utilities', a: 6540, n: '東京ガス', p: '口座振替' },
  { d: '2026-09-20', k: 'income', c: 'salary', a: 230000, n: '給与（妻）', p: '口座振替' },
  { d: '2026-09-21', k: 'expense', c: 'food', a: 780, n: 'パン屋', p: '現金' },
  { d: '2026-09-21', k: 'expense', c: 'leisure', a: 7700, n: 'キャンプ場', p: 'カード' },
  { d: '2026-09-22', k: 'expense', c: 'education', a: 1200, n: 'ワークブック', p: '現金' },
  { d: '2026-09-23', k: 'expense', c: 'food', a: 9680, n: 'イオンスタイル', p: 'カード' },
  { d: '2026-09-24', k: 'expense', c: 'transport', a: 5000, n: 'Suica チャージ', p: '電子マネー' },
  { d: '2026-09-25', k: 'expense', c: 'food', a: 7310, n: 'ライフ', p: 'カード' },
  { d: '2026-09-25', k: 'income', c: 'salary', a: 320000, n: '給与（夫）', p: '口座振替' },
  { d: '2026-09-25', k: 'saving', c: 'fund', a: 90000, n: 'つみたて投資（9月分）', p: '口座振替' },
  { d: '2026-09-25', k: 'saving', c: 'deposit', a: 50000, n: '積立預金（9月分）', p: '口座振替' },
  { d: '2026-09-26', k: 'expense', c: 'transport', a: 6100, n: 'ENEOS', p: 'カード' },
  { d: '2026-09-26', k: 'expense', c: 'transport', a: 3800, n: '高速道路・駐車場', p: 'カード' },
  { d: '2026-09-27', k: 'expense', c: 'housing', a: 98000, n: '家賃', p: '口座振替' },
  { d: '2026-09-27', k: 'expense', c: 'food', a: 5940, n: '外食（回転寿司）', p: 'カード' },
  { d: '2026-09-27', k: 'expense', c: 'telecom', a: 3980, n: 'スマホ（夫）', p: '口座振替' },
  { d: '2026-09-27', k: 'expense', c: 'telecom', a: 2940, n: 'スマホ（妻）', p: '口座振替' },
  { d: '2026-09-27', k: 'expense', c: 'telecom', a: 4880, n: '光回線', p: '口座振替' },
  { d: '2026-09-27', k: 'expense', c: 'medical', a: 11800, n: '生命保険', p: '口座振替' },
  { d: '2026-09-28', k: 'expense', c: 'other', a: 1880, n: '手土産', p: 'カード' },
  { d: '2026-09-29', k: 'expense', c: 'food', a: 9490, n: 'ライフ', p: 'カード' },
  { d: '2026-09-29', k: 'expense', c: 'daily', a: 2820, n: '無印良品', p: 'カード' },
  { d: '2026-09-30', k: 'expense', c: 'food', a: 1760, n: 'ファミリーマート', p: '電子マネー' },
  { d: '2026-09-30', k: 'expense', c: 'leisure', a: 5700, n: 'TOHOシネマズ', p: 'カード' },
  { d: '2026-09-30', k: 'expense', c: 'leisure', a: 2640, n: '紀伊國屋書店', p: 'カード' },
  { d: '2026-09-30', k: 'expense', c: 'leisure', a: 2660, n: 'おもちゃ', p: 'カード' },
  { d: '2026-09-11', k: 'expense', c: 'subscription', a: 1490, n: 'Netflix', p: 'カード' },
  { d: '2026-09-11', k: 'expense', c: 'subscription', a: 980, n: 'Spotify', p: 'カード' },
  { d: '2026-09-11', k: 'expense', c: 'subscription', a: 830, n: 'iCloud', p: 'カード' },
  { d: '2026-09-18', k: 'expense', c: 'other', a: 3800, n: '理容室（夫）', p: '現金' },
  { d: '2026-09-22', k: 'expense', c: 'other', a: 1120, n: '文房具', p: '現金' },
  // ---- 2026年10月（主月） ----
  { d: '2026-10-02', k: 'expense', c: 'food', a: 8940, n: 'イオンスタイル', p: 'カード' },
  { d: '2026-10-04', k: 'expense', c: 'food', a: 1260, n: 'セブン-イレブン', p: '電子マネー' },
  { d: '2026-10-05', k: 'expense', c: 'transport', a: 6200, n: 'ENEOS', p: 'カード' },
  { d: '2026-10-05', k: 'expense', c: 'education', a: 24000, n: '塾（10月分）', p: '口座振替' },
  { d: '2026-10-06', k: 'expense', c: 'food', a: 7830, n: 'ライフ', p: 'カード' },
  { d: '2026-10-07', k: 'expense', c: 'daily', a: 4860, n: 'マツモトキヨシ', p: 'カード' },
  { d: '2026-10-08', k: 'expense', c: 'transport', a: 5000, n: 'Suica チャージ', p: '電子マネー' },
  { d: '2026-10-09', k: 'expense', c: 'food', a: 920, n: 'パン屋', p: '現金' },
  { d: '2026-10-09', k: 'expense', c: 'other', a: 1340, n: '文房具', p: '現金' },
  { d: '2026-10-10', k: 'expense', c: 'utilities', a: 4670, n: '東京都水道局', p: '口座振替' },
  { d: '2026-10-10', k: 'income', c: 'allowance', a: 10000, n: '児童手当', p: '口座振替' },
  { d: '2026-10-11', k: 'expense', c: 'food', a: 9410, n: 'イオンスタイル', p: 'カード' },
  { d: '2026-10-11', k: 'expense', c: 'leisure', a: 5700, n: 'TOHOシネマズ', p: 'カード' },
  { d: '2026-10-11', k: 'expense', c: 'subscription', a: 1490, n: 'Netflix', p: 'カード' },
  { d: '2026-10-11', k: 'expense', c: 'subscription', a: 980, n: 'Spotify', p: 'カード' },
  { d: '2026-10-11', k: 'expense', c: 'subscription', a: 830, n: 'iCloud', p: 'カード' },
  { d: '2026-10-12', k: 'expense', c: 'education', a: 6800, n: 'スイミングスクール', p: '口座振替' },
  { d: '2026-10-13', k: 'expense', c: 'food', a: 3480, n: 'サイゼリヤ', p: 'カード' },
  { d: '2026-10-14', k: 'expense', c: 'medical', a: 2900, n: '歯科クリニック', p: '現金' },
  { d: '2026-10-14', k: 'expense', c: 'medical', a: 1800, n: '調剤薬局', p: '現金' },
  { d: '2026-10-15', k: 'expense', c: 'utilities', a: 13240, n: '東京電力', p: '口座振替' },
  { d: '2026-10-16', k: 'expense', c: 'food', a: 8260, n: 'ライフ', p: 'カード' },
  { d: '2026-10-17', k: 'expense', c: 'other', a: 3800, n: '理容室（夫）', p: '現金' },
  { d: '2026-10-18', k: 'expense', c: 'food', a: 6940, n: '業務スーパー', p: '現金' },
  { d: '2026-10-18', k: 'expense', c: 'leisure', a: 2400, n: '上野動物園', p: '現金' },
  { d: '2026-10-19', k: 'expense', c: 'daily', a: 3240, n: '無印良品', p: 'カード' },
  { d: '2026-10-19', k: 'expense', c: 'transport', a: 5900, n: 'ENEOS', p: 'カード' },
  { d: '2026-10-20', k: 'expense', c: 'food', a: 840, n: 'ローソン', p: '電子マネー' },
  { d: '2026-10-20', k: 'expense', c: 'utilities', a: 6890, n: '東京ガス', p: '口座振替' },
  { d: '2026-10-20', k: 'income', c: 'salary', a: 240000, n: '給与（妻）', p: '口座振替' },
  { d: '2026-10-21', k: 'expense', c: 'food', a: 7590, n: 'ライフ', p: 'カード' },
  { d: '2026-10-21', k: 'expense', c: 'leisure', a: 3960, n: '紀伊國屋書店', p: 'カード' },
  { d: '2026-10-22', k: 'expense', c: 'education', a: 1200, n: '学用品', p: '現金' },
  { d: '2026-10-24', k: 'expense', c: 'food', a: 9120, n: 'イオンスタイル', p: 'カード' },
  { d: '2026-10-25', k: 'expense', c: 'daily', a: 4300, n: 'ウエルシア', p: 'カード' },
  { d: '2026-10-25', k: 'expense', c: 'leisure', a: 8940, n: '日帰り温泉', p: 'カード' },
  { d: '2026-10-25', k: 'income', c: 'salary', a: 320000, n: '給与（夫）', p: '口座振替' },
  { d: '2026-10-25', k: 'saving', c: 'fund', a: 100000, n: 'つみたて投資（10月分）', p: '口座振替' },
  { d: '2026-10-25', k: 'saving', c: 'deposit', a: 50000, n: '積立預金（10月分）', p: '口座振替' },
  { d: '2026-10-26', k: 'expense', c: 'food', a: 4860, n: 'スシロー', p: 'カード' },
  { d: '2026-10-26', k: 'expense', c: 'transport', a: 1400, n: '駐車場', p: '現金' },
  { d: '2026-10-27', k: 'expense', c: 'housing', a: 98000, n: '家賃', p: '口座振替' },
  { d: '2026-10-27', k: 'expense', c: 'telecom', a: 3980, n: 'スマホ（夫）', p: '口座振替' },
  { d: '2026-10-27', k: 'expense', c: 'telecom', a: 2940, n: 'スマホ（妻）', p: '口座振替' },
  { d: '2026-10-27', k: 'expense', c: 'telecom', a: 4880, n: '光回線', p: '口座振替' },
  { d: '2026-10-27', k: 'expense', c: 'medical', a: 11800, n: '生命保険', p: '口座振替' },
  { d: '2026-10-28', k: 'expense', c: 'food', a: 8020, n: 'ライフ', p: 'カード' },
  { d: '2026-10-28', k: 'expense', c: 'other', a: 3560, n: '贈り物', p: 'カード' },
  { d: '2026-10-29', k: 'expense', c: 'leisure', a: 5000, n: 'トイザらス', p: 'カード' },
  { d: '2026-10-30', k: 'expense', c: 'food', a: 1130, n: 'ファミリーマート', p: '電子マネー' },
];

// Months before September are kept as totals only: the trend chart on
// the report page uses them, and September / October are computed from
// the itemised books above so the chart can never disagree with them.
export const PAST_MONTH_TOTALS = [
  { month: '2026-04', income: 555000, expense: 341200, savings: 130000 },
  { month: '2026-05', income: 558000, expense: 352600, savings: 135000 },
  { month: '2026-06', income: 560000, expense: 344800, savings: 140000 },
  { month: '2026-07', income: 720000, expense: 388400, savings: 220000 },
  { month: '2026-08', income: 562000, expense: 371900, savings: 120000 },
];

// Recurring monthly payments, shown on the budgets page. Their amounts
// match the matching transactions above, so the two views agree.
export const FIXED_COSTS = [
  { name: '家賃', category: 'housing', amount: 98000, day: 27 },
  { name: '塾', category: 'education', amount: 24000, day: 5 },
  { name: '生命保険', category: 'medical', amount: 11800, day: 27 },
  { name: 'スイミングスクール', category: 'education', amount: 6800, day: 12 },
  { name: '光回線', category: 'telecom', amount: 4880, day: 27 },
  { name: 'スマホ（夫）', category: 'telecom', amount: 3980, day: 27 },
  { name: 'スマホ（妻）', category: 'telecom', amount: 2940, day: 27 },
  { name: 'サブスク（3件）', category: 'subscription', amount: 3300, day: 11 },
];

export const SEED_GOALS = [
  { id: 'g1', name: '家族旅行', target: 1200000, saved: 840000, monthly: 30000 },
  { id: 'g2', name: '生活防衛資金', target: 1500000, saved: 1050000, monthly: 25000 },
  { id: 'g3', name: '教育費', target: 2000000, saved: 620000, monthly: 20000 },
];

// The month the ledger opens on, and the day treated as "today" in it:
// the newest day that has entries.
export const LATEST_MONTH = '2026-10';
export const TODAY = '2026-10-30';
export const PAYMENT_METHODS = ['現金', 'カード', '口座振替', '電子マネー'];

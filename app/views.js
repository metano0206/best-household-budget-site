// views.js — the six pages of 「くらしの台帳」 and their controls.
//
// Each render function fills the #view element with one page's HTML and
// then wires that page's buttons and forms. Pages are reached by hash
// links in the header; every figure comes from store.js, so a change made
// on one page (a new record, a new budget, a savings deposit) shows on
// all the others at once.

import { EXPENSE_CATEGORIES, FIXED_COSTS, INCOME_CATEGORIES, PAYMENT_METHODS, SAVING_CATEGORIES, TODAY } from './data.js';
import { donutChart, trendChart } from './charts.js';
import { dayLabel, esc, monthLabel, percent, percent1, shiftMonth, yen } from './format.js';
import {
  addGoal,
  addToGoal,
  addTransaction,
  availableMonths,
  categoryOf,
  categoryTotals,
  dailyTotals,
  deleteTransaction,
  findTransaction,
  getMonth,
  goals,
  monthTotals,
  savingsRate,
  setBudget,
  setMonth,
  totalBudget,
  transactionsIn,
  trendData,
  updateTransaction,
} from './store.js';

// ---------- shared pieces ----------

function monthSwitcher() {
  const months = availableMonths();
  const current = getMonth();
  const index = months.indexOf(current);
  const prev = index > 0 ? months[index - 1] : null;
  const next = index >= 0 && index < months.length - 1 ? months[index + 1] : null;
  return (
    `<div class="month-switch">` +
    (prev
      ? `<button class="month-btn" data-goto-month="${prev}">← ${monthLabel(prev)}</button>`
      : `<button class="month-btn" disabled>← 前月</button>`) +
    `<span class="month-current">${monthLabel(current)}</span>` +
    (next
      ? `<button class="month-btn" data-goto-month="${next}">${monthLabel(next)} →</button>`
      : `<button class="month-btn" disabled>翌月 →</button>`) +
    `</div>`
  );
}

function wireMonthSwitcher(root, rerender) {
  root.querySelectorAll('[data-goto-month]').forEach((button) => {
    button.addEventListener('click', () => {
      setMonth(button.dataset.gotoMonth);
      rerender();
    });
  });
}

function progressBar(spent, budget, color) {
  const ratio = budget > 0 ? spent / budget : 0;
  const width = Math.min(100, ratio * 100);
  const over = spent > budget;
  return (
    `<div class="bar${over ? ' bar-over' : ''}">` +
    `<span style="width:${width}%;background:${over ? '#b5502f' : color}"></span></div>`
  );
}

function amountHtml(t) {
  if (t.k === 'income') return `<span class="tx-amt amt-in">+${esc(yen(t.a))}</span>`;
  if (t.k === 'saving') return `<span class="tx-amt amt-save">${esc(yen(t.a))} → 貯蓄</span>`;
  return `<span class="tx-amt amt-out">-${esc(yen(t.a))}</span>`;
}

function transactionRow(t, withActions = false) {
  const category = categoryOf(t.c);
  const actions = withActions
    ? `<span class="tx-actions"><button class="mini-btn" data-edit="${t.id}">編集</button>` +
      `<button class="mini-btn danger" data-delete="${t.id}">削除</button></span>`
    : '';
  return (
    `<li class="tx-row">` +
    `<span class="tx-dot" style="background:${category.color}"></span>` +
    `<span class="tx-main"><span class="tx-cat">${esc(category.name)}</span>` +
    `<span class="tx-note">${esc(t.n)}</span></span>` +
    `<span class="tx-pay">${esc(t.p ?? '')}</span>` +
    amountHtml(t) +
    actions +
    `</li>`
  );
}

// The signature chart: where the month's income went, as one stacked bar
// with the three flows labelled in yen and in percent of income.
export function moneyFlow(totals) {
  if (totals.income <= 0) return '';
  const parts = [
    { name: '生活支出', value: totals.expense, color: '#d58a62' },
    { name: '貯蓄', value: totals.savings, color: '#4e6e58' },
    { name: '自由残高', value: Math.max(0, totals.balance), color: '#c9b458' },
  ];
  const segments = parts
    .map((p) => `<span class="flow-seg" style="width:${(p.value / totals.income) * 100}%;background:${p.color}"></span>`)
    .join('');
  const labels = parts
    .map(
      (p) =>
        `<div class="flow-label"><span class="flow-name"><span class="tx-dot" style="background:${p.color}"></span>${p.name}</span>` +
        `<span class="flow-amt">${esc(yen(p.value))}</span>` +
        `<span class="flow-pct">${percent(p.value / totals.income)}</span></div>`,
    )
    .join('');
  return (
    `<div class="flow"><p class="flow-title">収入 ${esc(yen(totals.income))} の行き先</p>` +
    `<div class="flow-bar">${segments}</div><div class="flow-labels">${labels}</div></div>`
  );
}

// 「今月の暮らし通信」: a short letter whose three paragraphs are written
// from the month's own figures — what went well, what to watch, and one
// goal for next month.
function monthlyLetter(monthKey) {
  const totals = monthTotals(monthKey);
  const prevKey = shiftMonth(monthKey, -1);
  const prevTotals = monthTotals(prevKey);
  const rows = categoryTotals(monthKey);
  const prevRows = categoryTotals(prevKey);
  const prevSpent = new Map(prevRows.map((r) => [r.category.id, r.spent]));
  const rate = savingsRate(monthKey);
  const prevRate = savingsRate(prevKey);

  const good = [];
  if (prevTotals.income > 0) {
    const diff = Math.round((rate - prevRate) * 1000) / 10;
    if (diff > 0) good.push(`貯蓄率は ${percent1(rate)} で、先月より ${diff} ポイント上がりました。`);
    else if (diff === 0) good.push(`貯蓄率は ${percent1(rate)} を保ちました。`);
  }
  const drops = rows
    .map((r) => ({ name: r.category.name, drop: (prevSpent.get(r.category.id) ?? 0) - r.spent }))
    .filter((x) => x.drop > 0)
    .sort((a, b) => b.drop - a.drop);
  if (drops.length > 0) {
    good.push(`${drops[0].name}は先月より ${yen(drops[0].drop)} 少なく済みました。`);
  }
  if (good.length === 0) good.push(`今月の記録は ${transactionsIn(monthKey).length} 件、最後までつけきりました。`);

  const watch = [];
  for (const row of rows) {
    if (row.spent > row.budget) {
      watch.push(`${row.category.name}が予算を ${yen(row.spent - row.budget)} 超えています（${yen(row.spent)} / 予算 ${yen(row.budget)}）。`);
    }
  }
  const rises = rows
    .map((r) => ({ name: r.category.name, rise: r.spent - (prevSpent.get(r.category.id) ?? 0) }))
    .filter((x) => x.rise > 0)
    .sort((a, b) => b.rise - a.rise);
  if (rises.length > 0 && watch.length === 0) {
    watch.push(`${rises[0].name}が先月より ${yen(rises[0].rise)} 増えています。`);
  }
  if (watch.length === 0) watch.push('予算を超えたカテゴリはありませんでした。');

  const goalLines = [];
  const over = rows.find((r) => r.spent > r.budget);
  if (over) goalLines.push(`来月は${over.category.name}を予算の ${yen(over.budget)} 以内に収めること。`);
  goalLines.push(`貯蓄率は ${percent1(Math.min(0.99, rate + 0.01))} を目指します。`);

  const para = (title, lines) =>
    `<div class="letter-part"><h3>${title}</h3><p>${lines.map(esc).join('')}</p></div>`;
  return (
    `<div class="letter">` +
    `<p class="letter-head">今月の暮らし通信<span class="letter-date">${monthLabel(monthKey)}の記録から</span></p>` +
    para('よかったこと', good) +
    para('気をつけたいこと', watch) +
    para('来月の目標', goalLines) +
    `</div>`
  );
}

// ---------- dashboard (ホーム) ----------

export function renderDashboard(root) {
  const month = getMonth();
  const totals = monthTotals(month);
  const byCategory = categoryTotals(month);
  const budget = totalBudget();
  const recent = transactionsIn(month).slice(0, 6);
  const rate = savingsRate(month);
  const donutSegments = byCategory
    .filter((row) => row.spent > 0)
    .map((row) => ({ name: row.category.name, value: row.spent, color: row.category.color }));
  const legend = byCategory
    .filter((row) => row.spent > 0)
    .map(
      (row) =>
        `<li><span class="tx-dot" style="background:${row.category.color}"></span>` +
        `<span class="legend-name">${esc(row.category.name)}</span>` +
        `<span class="legend-amt">${esc(yen(row.spent))}</span>` +
        `<span class="legend-pct">${percent(row.spent / totals.expense)}</span></li>`,
    )
    .join('');
  const topBudgets = byCategory
    .slice(0, 5)
    .map(
      (row) =>
        `<div class="budget-mini">` +
        `<div class="budget-mini-head"><span>${esc(row.category.name)}${row.spent > row.budget ? ' <span class="over-badge">超過</span>' : ''}</span>` +
        `<span>${esc(yen(row.spent))} / ${esc(yen(row.budget))}</span></div>` +
        progressBar(row.spent, row.budget, row.category.color) +
        `</div>`,
    )
    .join('');

  root.innerHTML = `
    <section class="page">
      <div class="page-head">
        <h1>${monthLabel(month)}の台帳</h1>
        ${monthSwitcher()}
      </div>
      <div class="cards">
        <div class="card"><p class="card-label">収入</p><p class="card-value in">${yen(totals.income)}</p></div>
        <div class="card"><p class="card-label">生活支出</p><p class="card-value out">${yen(totals.expense)}</p>
          <p class="card-sub">予算 ${yen(budget)} の ${percent(totals.expense / budget)}</p></div>
        <div class="card"><p class="card-label">貯蓄</p><p class="card-value save">${yen(totals.savings)}</p>
          <p class="card-sub">貯蓄率 ${percent1(rate)}</p></div>
        <div class="card"><p class="card-label">自由残高</p><p class="card-value">${yen(totals.balance)}</p>
          <p class="card-sub">収入 − 支出 − 貯蓄</p></div>
      </div>
      <div class="panel">
        <h2>お金の行き先</h2>
        ${moneyFlow(totals)}
      </div>
      <div class="grid-2">
        <div class="panel">
          <h2>カテゴリ別の支出</h2>
          <div class="donut-wrap">${donutChart(donutSegments, totals.expense)}
            <ul class="legend">${legend}</ul>
          </div>
        </div>
        <div class="panel">
          <h2>予算の使用率</h2>
          ${topBudgets}
          <p class="panel-link"><a href="#/budgets">予算管理をすべて見る →</a></p>
        </div>
      </div>
      <div class="grid-2">
        <div class="panel">
          <h2>最近の入出金</h2>
          <ul class="tx-list">${recent.map((t) => transactionRow(t)).join('')}</ul>
          <p class="panel-link"><a href="#/transactions">${monthLabel(month)}の入出金をすべて見る →</a></p>
        </div>
        <div class="panel letter-panel">
          ${monthlyLetter(month)}
          <p class="panel-link"><a href="#/report">月次レポートを見る →</a></p>
        </div>
      </div>
    </section>`;
  wireMonthSwitcher(root, () => renderDashboard(root));
}

// ---------- transactions (入出金) ----------

const KIND_LABELS = { expense: '支出', income: '収入', saving: '貯蓄' };

function categoriesForKind(kind) {
  if (kind === 'income') return INCOME_CATEGORIES;
  if (kind === 'saving') return SAVING_CATEGORIES;
  return EXPENSE_CATEGORIES;
}

export function renderTransactions(root) {
  const month = getMonth();
  let filterKind = 'all';
  let filterCategory = 'all';
  let keyword = '';
  let editingId = null;
  let confirmingDeleteId = null;

  const categoryOptions = (kind, selected) =>
    categoriesForKind(kind)
      .map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`)
      .join('');

  root.innerHTML = `
    <section class="page">
      <div class="page-head">
        <h1>入出金</h1>
        ${monthSwitcher()}
      </div>
      <div class="panel" id="tx-summary"></div>
      <div class="panel">
        <h2 id="form-title">記録を追加</h2>
        <form id="tx-form" class="tx-form">
          <label>日付<input type="date" id="f-date" required></label>
          <label>区分
            <select id="f-kind">
              <option value="expense">支出</option>
              <option value="income">収入</option>
              <option value="saving">貯蓄</option>
            </select></label>
          <label>カテゴリ<select id="f-category"></select></label>
          <label>金額（円）<input type="number" id="f-amount" min="1" step="1" required placeholder="8500"></label>
          <label>店名・内容<input type="text" id="f-note" required placeholder="ライフ"></label>
          <label>支払方法
            <select id="f-payment">${PAYMENT_METHODS.map((p) => `<option>${p}</option>`).join('')}</select></label>
          <div class="form-actions">
            <button type="submit" class="primary-btn" id="f-submit">保存する</button>
            <button type="button" class="ghost-btn" id="f-cancel" hidden>編集をやめる</button>
          </div>
        </form>
      </div>
      <div class="panel">
        <div class="filter-row">
          <div class="kind-tabs" id="kind-tabs">
            <button data-kind="all" class="active">すべて</button>
            <button data-kind="expense">支出</button>
            <button data-kind="income">収入</button>
            <button data-kind="saving">貯蓄</button>
          </div>
          <select id="filter-category">
            <option value="all">カテゴリ：すべて</option>
            ${[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...SAVING_CATEGORIES]
              .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
              .join('')}
          </select>
          <input type="search" id="filter-word" placeholder="店名・内容で検索">
        </div>
        <div id="tx-list"></div>
      </div>
    </section>`;

  const form = root.querySelector('#tx-form');
  const kindSelect = root.querySelector('#f-kind');
  const categorySelect = root.querySelector('#f-category');
  const syncCategoryOptions = () => {
    categorySelect.innerHTML = categoryOptions(kindSelect.value, categorySelect.value);
  };
  kindSelect.addEventListener('change', syncCategoryOptions);
  syncCategoryOptions();
  root.querySelector('#f-date').value = TODAY;

  function resetForm() {
    editingId = null;
    form.reset();
    root.querySelector('#f-date').value = TODAY;
    kindSelect.value = 'expense';
    syncCategoryOptions();
    root.querySelector('#form-title').textContent = '記録を追加';
    root.querySelector('#f-submit').textContent = '保存する';
    root.querySelector('#f-cancel').hidden = true;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const record = {
      d: root.querySelector('#f-date').value,
      k: kindSelect.value,
      c: categorySelect.value,
      a: Math.max(1, Math.round(Number(root.querySelector('#f-amount').value) || 0)),
      n: root.querySelector('#f-note').value.trim(),
      p: root.querySelector('#f-payment').value,
    };
    if (!record.d || !record.n) return;
    if (editingId) updateTransaction(editingId, record);
    else addTransaction(record);
    if (!record.d.startsWith(getMonth())) setMonth(record.d.slice(0, 7));
    resetForm();
    renderTransactions(root);
  });
  root.querySelector('#f-cancel').addEventListener('click', resetForm);

  function renderSummary() {
    const totals = monthTotals(getMonth());
    const budget = totalBudget();
    root.querySelector('#tx-summary').innerHTML =
      `<div class="summary-strip">` +
      `<span>収入 <strong>${esc(yen(totals.income))}</strong></span>` +
      `<span>支出 <strong>${esc(yen(totals.expense))}</strong></span>` +
      `<span>貯蓄 <strong>${esc(yen(totals.savings))}</strong></span>` +
      `<span>予算の残り <strong>${esc(yen(budget - totals.expense))}</strong></span></div>` +
      progressBar(totals.expense, budget, '#718b70') +
      `<p class="card-sub">支出は予算 ${esc(yen(budget))} の ${percent(totals.expense / budget)} です。</p>`;
  }

  function renderList() {
    const rows = transactionsIn(getMonth()).filter((t) => {
      if (filterKind !== 'all' && t.k !== filterKind) return false;
      if (filterCategory !== 'all' && t.c !== filterCategory) return false;
      if (keyword && !`${t.n}${categoryOf(t.c).name}`.includes(keyword)) return false;
      return true;
    });
    const list = root.querySelector('#tx-list');
    if (rows.length === 0) {
      list.innerHTML = `<p class="empty-note">条件に合う記録がありません。</p>`;
      return;
    }
    const byDate = new Map();
    for (const t of rows) {
      if (!byDate.has(t.d)) byDate.set(t.d, []);
      byDate.get(t.d).push(t);
    }
    list.innerHTML = [...byDate.entries()]
      .map(([date, dayRows]) => {
        const dayExpense = dayRows.filter((t) => t.k === 'expense').reduce((s, t) => s + t.a, 0);
        const items = dayRows
          .map((t) => {
            if (confirmingDeleteId === t.id) {
              return (
                `<li class="tx-row confirm-row"><span class="tx-note">「${esc(t.n)} ${esc(yen(t.a))}」を削除しますか？</span>` +
                `<span class="tx-actions"><button class="mini-btn danger" data-delete-yes="${t.id}">削除する</button>` +
                `<button class="mini-btn" data-delete-no>やめる</button></span></li>`
              );
            }
            return transactionRow(t, true);
          })
          .join('');
        return (
          `<div class="day-group"><p class="day-head">${dayLabel(date)}` +
          `<span class="day-total">支出 ${esc(yen(dayExpense))}</span></p>` +
          `<ul class="tx-list">${items}</ul></div>`
        );
      })
      .join('');
    list.querySelectorAll('[data-edit]').forEach((button) => {
      button.addEventListener('click', () => {
        const t = findTransaction(button.dataset.edit);
        if (!t) return;
        editingId = t.id;
        confirmingDeleteId = null;
        root.querySelector('#f-date').value = t.d;
        kindSelect.value = t.k;
        syncCategoryOptions();
        categorySelect.value = t.c;
        root.querySelector('#f-amount').value = t.a;
        root.querySelector('#f-note').value = t.n;
        root.querySelector('#f-payment').value = t.p ?? 'カード';
        root.querySelector('#form-title').textContent = '記録を編集';
        root.querySelector('#f-submit').textContent = '更新する';
        root.querySelector('#f-cancel').hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderList();
      });
    });
    list.querySelectorAll('[data-delete]').forEach((button) => {
      button.addEventListener('click', () => {
        confirmingDeleteId = button.dataset.delete;
        renderList();
      });
    });
    list.querySelectorAll('[data-delete-yes]').forEach((button) => {
      button.addEventListener('click', () => {
        deleteTransaction(button.dataset.deleteYes);
        confirmingDeleteId = null;
        renderSummary();
        renderList();
      });
    });
    list.querySelectorAll('[data-delete-no]').forEach((button) => {
      button.addEventListener('click', () => {
        confirmingDeleteId = null;
        renderList();
      });
    });
  }

  root.querySelectorAll('#kind-tabs button').forEach((button) => {
    button.addEventListener('click', () => {
      filterKind = button.dataset.kind;
      root.querySelectorAll('#kind-tabs button').forEach((b) => b.classList.toggle('active', b === button));
      renderList();
    });
  });
  root.querySelector('#filter-category').addEventListener('change', (event) => {
    filterCategory = event.target.value;
    renderList();
  });
  root.querySelector('#filter-word').addEventListener('input', (event) => {
    keyword = event.target.value.trim();
    renderList();
  });

  wireMonthSwitcher(root, () => renderTransactions(root));
  renderSummary();
  renderList();
}

// ---------- budgets (予算管理) ----------

export function renderBudgets(root) {
  const month = getMonth();
  const totals = monthTotals(month);
  const rows = categoryTotals(month);
  const budget = totalBudget();
  const fixedTotal = FIXED_COSTS.reduce((s, f) => s + f.amount, 0);

  const budgetRow = (row) => {
    const remaining = row.budget - row.spent;
    const status =
      remaining < 0
        ? `<span class="over-badge">${esc(yen(-remaining))} 超過</span>`
        : `<span class="remain-note">残り ${esc(yen(remaining))}</span>`;
    return (
      `<div class="budget-row">` +
      `<div class="budget-row-head"><span class="tx-dot" style="background:${row.category.color}"></span>` +
      `<span class="budget-name">${esc(row.category.name)}</span>${status}` +
      `<span class="budget-figures">${esc(yen(row.spent))} / 予算 ${esc(yen(row.budget))}（${percent(row.budget ? row.spent / row.budget : 0)}）</span></div>` +
      progressBar(row.spent, row.budget, row.category.color) +
      `<form class="budget-form" data-budget-form="${row.category.id}">` +
      `<label>予算を変更 <input type="number" min="0" step="100" value="${row.budget}"> 円</label>` +
      `<button type="submit" class="mini-btn">保存</button></form></div>`
    );
  };
  const group = (title, fixed) => {
    const groupRows = rows.filter((r) => r.category.fixed === fixed);
    const spent = groupRows.reduce((s, r) => s + r.spent, 0);
    const groupBudget = groupRows.reduce((s, r) => s + r.budget, 0);
    return (
      `<div class="panel"><h2>${title}（実績 ${esc(yen(spent))} / 予算 ${esc(yen(groupBudget))}）</h2>` +
      groupRows.map(budgetRow).join('') +
      `</div>`
    );
  };
  const fixedRows = FIXED_COSTS.map((f) => {
    const category = categoryOf(f.category);
    return (
      `<tr><td>${esc(f.name)}</td><td><span class="tx-dot" style="background:${category.color}"></span>${esc(category.name)}</td>` +
      `<td>毎月${f.day}日</td><td class="num">${esc(yen(f.amount))}</td></tr>`
    );
  }).join('');

  root.innerHTML = `
    <section class="page">
      <div class="page-head">
        <h1>予算管理</h1>
        ${monthSwitcher()}
      </div>
      <div class="panel">
        <div class="summary-strip">
          <span>予算合計 <strong>${yen(budget)}</strong></span>
          <span>生活支出 <strong>${yen(totals.expense)}</strong></span>
          <span>残り <strong>${yen(budget - totals.expense)}</strong></span>
        </div>
        ${progressBar(totals.expense, budget, '#718b70')}
        <p class="card-sub">予算はカテゴリごとに変更できます。変更はホームやレポートにも反映されます。</p>
      </div>
      ${group('固定費のカテゴリ', true)}
      ${group('変動費のカテゴリ', false)}
      <div class="panel">
        <h2>毎月の固定費（内訳）</h2>
        <table class="data-table">
          <thead><tr><th>項目</th><th>カテゴリ</th><th>支払日</th><th>金額</th></tr></thead>
          <tbody>${fixedRows}
            <tr class="total-row"><td colspan="3">固定費の合計（月額）</td><td class="num">${yen(fixedTotal)}</td></tr>
          </tbody>
        </table>
        <p class="card-sub">年額にすると ${yen(fixedTotal * 12)} です。固定費を見直すと、毎月の支出がそのまま下がります。</p>
      </div>
    </section>`;
  wireMonthSwitcher(root, () => renderBudgets(root));
  root.querySelectorAll('[data-budget-form]').forEach((formEl) => {
    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = Number(formEl.querySelector('input').value);
      if (Number.isFinite(value) && value >= 0) {
        setBudget(formEl.dataset.budgetForm, value);
        renderBudgets(root);
      }
    });
  });
}

// ---------- calendar (カレンダー) ----------

export function renderCalendar(root) {
  const month = getMonth();
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstWeekday = new Date(year, mon - 1, 1).getDay();
  const expenses = dailyTotals(month);
  const all = transactionsIn(month);
  const incomeDays = new Map();
  for (const t of all) {
    if (t.k === 'income') incomeDays.set(t.d, (incomeDays.get(t.d) ?? 0) + t.a);
  }
  let selected = all.length > 0 ? all[0].d : `${month}-01`;
  if (month === TODAY.slice(0, 7)) selected = TODAY;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push('<div class="cal-cell cal-blank"></div>');
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const spent = expenses.get(dateStr) ?? 0;
    const income = incomeDays.get(dateStr) ?? 0;
    cells.push(
      `<button class="cal-cell${dateStr === selected ? ' selected' : ''}${dateStr === TODAY ? ' today' : ''}" data-day="${dateStr}">` +
        `<span class="cal-day">${day}</span>` +
        (spent > 0 ? `<span class="cal-expense">${esc(yen(spent))}</span>` : '') +
        (income > 0 ? `<span class="cal-income">+${esc(yen(income))}</span>` : '') +
        `</button>`,
    );
  }

  root.innerHTML = `
    <section class="page">
      <div class="page-head">
        <h1>カレンダー</h1>
        ${monthSwitcher()}
      </div>
      <div class="panel">
        <div class="cal-week"><span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span></div>
        <div class="cal-grid">${cells.join('')}</div>
        <p class="card-sub">日付を選ぶと、その日の入出金が見られます。金額はその日の支出合計、緑は収入です。</p>
      </div>
      <div class="panel" id="cal-detail"></div>
    </section>`;

  function renderDetail() {
    const dayRows = all.filter((t) => t.d === selected);
    const dayTotals = {
      income: dayRows.filter((t) => t.k === 'income').reduce((s, t) => s + t.a, 0),
      expense: dayRows.filter((t) => t.k === 'expense').reduce((s, t) => s + t.a, 0),
      savings: dayRows.filter((t) => t.k === 'saving').reduce((s, t) => s + t.a, 0),
    };
    root.querySelector('#cal-detail').innerHTML =
      `<h2>${dayLabel(selected)}</h2>` +
      `<div class="summary-strip"><span>収入 <strong>${esc(yen(dayTotals.income))}</strong></span>` +
      `<span>支出 <strong>${esc(yen(dayTotals.expense))}</strong></span>` +
      `<span>貯蓄 <strong>${esc(yen(dayTotals.savings))}</strong></span></div>` +
      (dayRows.length > 0
        ? `<ul class="tx-list">${dayRows.map((t) => transactionRow(t)).join('')}</ul>`
        : `<p class="empty-note">この日の記録はありません。</p>`);
    root.querySelectorAll('.cal-cell[data-day]').forEach((cell) => {
      cell.classList.toggle('selected', cell.dataset.day === selected);
    });
  }
  root.querySelectorAll('.cal-cell[data-day]').forEach((cell) => {
    cell.addEventListener('click', () => {
      selected = cell.dataset.day;
      renderDetail();
    });
  });
  wireMonthSwitcher(root, () => renderCalendar(root));
  renderDetail();
}

// ---------- report (月次レポート) ----------

export function renderReport(root) {
  const month = getMonth();
  const prev = shiftMonth(month, -1);
  const totals = monthTotals(month);
  const prevTotals = monthTotals(prev);
  const rows = categoryTotals(month);
  const prevRows = categoryTotals(prev);
  const prevSpent = new Map(prevRows.map((r) => [r.category.id, r.spent]));
  const prevItemised = transactionsIn(prev).length > 0;
  const rate = savingsRate(month);
  const prevRate = prevTotals.income > 0 ? prevTotals.savings / prevTotals.income : 0;

  // goodWhenUp: for income, savings and the free balance an increase is
  // good news (green); for spending an increase is a warning (persimmon).
  const diffCell = (now, before, goodWhenUp = false) => {
    const diff = now - before;
    if (diff === 0) return '<span class="diff-flat">±0</span>';
    const arrow = diff > 0 ? '▲' : '▼';
    const good = diff > 0 === goodWhenUp;
    return `<span class="${good ? 'diff-down' : 'diff-up'}">${arrow} ${esc(yen(Math.abs(diff)))}</span>`;
  };
  const compareCards = [
    ['収入', totals.income, prevTotals.income, true],
    ['生活支出', totals.expense, prevTotals.expense, false],
    ['貯蓄', totals.savings, prevTotals.savings, true],
    ['自由残高', totals.balance, prevTotals.balance, true],
  ]
    .map(
      ([label, now, before, goodWhenUp]) =>
        `<div class="card"><p class="card-label">${label}</p><p class="card-value">${yen(now)}</p>` +
        `<p class="card-sub">先月 ${yen(before)} ・ ${diffCell(now, before, goodWhenUp)}</p></div>`,
    )
    .join('');

  const tableRows = rows
    .map((row) => {
      const before = prevSpent.get(row.category.id) ?? 0;
      return (
        `<tr><td><span class="tx-dot" style="background:${row.category.color}"></span>${esc(row.category.name)}</td>` +
        `<td class="num">${esc(yen(before))}</td><td class="num">${esc(yen(row.spent))}</td>` +
        `<td class="num">${diffCell(row.spent, before)}</td></tr>`
      );
    })
    .join('');

  const movers = rows
    .map((r) => ({ name: r.category.name, diff: r.spent - (prevSpent.get(r.category.id) ?? 0) }))
    .sort((a, b) => b.diff - a.diff);
  const findings = [];
  if (movers.length > 0 && movers[0].diff > 0) {
    findings.push(`先月より増えたのは${movers[0].name}（+${yen(movers[0].diff)}）です。`);
  }
  const last = movers[movers.length - 1];
  if (last && last.diff < 0) {
    findings.push(`いちばん減ったのは${last.name}（${yen(last.diff)}）でした。`);
  }
  findings.push(
    `貯蓄率は ${percent1(rate)} で、先月（${percent1(prevRate)}）と比べて ${Math.round((rate - prevRate) * 1000) / 10} ポイントの変化です。`,
  );
  const goalSummary = goals()
    .map(
      (g) =>
        `<div class="budget-mini"><div class="budget-mini-head"><span>${esc(g.name)}</span>` +
        `<span>${esc(yen(g.saved))} / ${esc(yen(g.target))}</span></div>` +
        progressBar(g.saved, g.target, '#4e6e58') + `</div>`,
    )
    .join('');

  root.innerHTML = `
    <section class="page">
      <div class="page-head">
        <h1>月次レポート</h1>
        ${monthSwitcher()}
      </div>
      <p class="report-lead">${monthLabel(month)}と${monthLabel(prev)}の比較です。</p>
      <div class="cards">${compareCards}</div>
      <div class="panel">
        <h2>お金の行き先（${monthLabel(month)}）</h2>
        ${moneyFlow(totals)}
        <p class="card-sub">貯蓄率 ${percent1(rate)}（先月 ${percent1(prevRate)}）。収入のうち生活支出が ${percent(totals.income ? totals.expense / totals.income : 0)} を占めます。</p>
      </div>
      <div class="panel">
        <h2>カテゴリ別の比較</h2>
        ${
          prevItemised
            ? `<table class="data-table"><thead><tr><th>カテゴリ</th><th>${monthLabel(prev)}</th><th>${monthLabel(month)}</th><th>差額</th></tr></thead><tbody>${tableRows}</tbody></table>`
            : `<p class="empty-note">${monthLabel(prev)}は合計のみ記録されているため、カテゴリ別の比較はありません。</p>`
        }
      </div>
      <div class="grid-2">
        <div class="panel">
          <h2>7か月の推移</h2>
          ${trendChart(trendData())}
        </div>
        <div class="panel">
          <h2>今月の所見</h2>
          <ul class="insights">${findings.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <h2 class="panel-subhead">貯蓄目標の進み具合</h2>
          ${goalSummary}
          <p class="panel-link"><a href="#/goals">貯蓄・目標を見る →</a></p>
        </div>
      </div>
    </section>`;
  wireMonthSwitcher(root, () => renderReport(root));
}

// ---------- goals (貯蓄・目標) ----------

export function renderGoals(root) {
  const list = goals();
  const totalTarget = list.reduce((s, g) => s + g.target, 0);
  const totalSaved = list.reduce((s, g) => s + g.saved, 0);
  const totalMonthly = list.reduce((s, g) => s + g.monthly, 0);

  const cards = list
    .map((g) => {
      const ratio = g.target > 0 ? g.saved / g.target : 0;
      const achieved = g.saved >= g.target;
      const monthsLeft = !achieved && g.monthly > 0 ? Math.ceil((g.target - g.saved) / g.monthly) : null;
      return (
        `<div class="panel goal-card">` +
        `<div class="budget-mini-head"><h2>${esc(g.name)}</h2>${achieved ? '<span class="achieved-badge">達成！</span>' : ''}</div>` +
        progressBar(g.saved, g.target, '#4e6e58') +
        `<p class="goal-figures">${esc(yen(g.saved))} / ${esc(yen(g.target))}（${percent(Math.min(1, ratio))}）` +
        (achieved ? '' : ` ・ あと ${esc(yen(g.target - g.saved))}`) + `</p>` +
        `<p class="card-sub">毎月 ${esc(yen(g.monthly))} の積立` +
        (monthsLeft ? ` ・ このペースで約 ${monthsLeft} か月後に達成見込み` : '') + `</p>` +
        (achieved || g.monthly <= 0
          ? ''
          : `<button class="primary-btn" data-deposit="${g.id}">今月分 ${esc(yen(g.monthly))} を積み立てる</button>`) +
        `</div>`
      );
    })
    .join('');

  root.innerHTML = `
    <section class="page">
      <div class="page-head"><h1>貯蓄・目標</h1></div>
      <div class="cards">
        <div class="card"><p class="card-label">目標の合計</p><p class="card-value">${yen(totalTarget)}</p></div>
        <div class="card"><p class="card-label">積立済み</p><p class="card-value save">${yen(totalSaved)}</p></div>
        <div class="card"><p class="card-label">全体の達成率</p><p class="card-value">${percent(totalTarget ? totalSaved / totalTarget : 0)}</p></div>
        <div class="card"><p class="card-label">毎月の積立</p><p class="card-value">${yen(totalMonthly)}</p></div>
      </div>
      <div class="goal-grid">${cards}</div>
      <div class="panel">
        <h2>目標を追加</h2>
        <form id="goal-form" class="tx-form">
          <label>目標の名前<input type="text" id="g-name" required placeholder="車の買い替え"></label>
          <label>目標額（円）<input type="number" id="g-target" min="1" step="1000" required placeholder="500000"></label>
          <label>現在の積立額（円）<input type="number" id="g-saved" min="0" step="1000" value="0"></label>
          <label>毎月の積立額（円）<input type="number" id="g-monthly" min="0" step="1000" value="10000"></label>
          <div class="form-actions"><button type="submit" class="primary-btn">目標を追加する</button></div>
        </form>
      </div>
    </section>`;

  root.querySelectorAll('[data-deposit]').forEach((button) => {
    button.addEventListener('click', () => {
      const goal = list.find((g) => g.id === button.dataset.deposit);
      if (goal) addToGoal(goal.id, goal.monthly);
      renderGoals(root);
    });
  });
  root.querySelector('#goal-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = root.querySelector('#g-name').value.trim();
    const target = Number(root.querySelector('#g-target').value);
    if (!name || !(target > 0)) return;
    addGoal({
      name,
      target: Math.round(target),
      saved: Math.max(0, Math.round(Number(root.querySelector('#g-saved').value) || 0)),
      monthly: Math.max(0, Math.round(Number(root.querySelector('#g-monthly').value) || 0)),
    });
    renderGoals(root);
  });
}

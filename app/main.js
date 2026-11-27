// main.js — entry point: the hash router and the demo reset.
//
// The site is one page with six views, switched by the hash in the URL
// (#/, #/transactions, #/budgets, #/calendar, #/report, #/goals). Every
// link in the header, the phone bottom bar and the panels points at one
// of those hashes, so the whole site works from this single file with no
// network request.

import { resetDemo } from './store.js';
import {
  renderBudgets,
  renderCalendar,
  renderDashboard,
  renderGoals,
  renderReport,
  renderTransactions,
} from './views.js';

const ROUTES = {
  '': renderDashboard,
  transactions: renderTransactions,
  budgets: renderBudgets,
  calendar: renderCalendar,
  report: renderReport,
  goals: renderGoals,
};

const view = document.querySelector('#view');

function currentRoute() {
  return location.hash.replace(/^#\/?/, '').split('/')[0];
}

function draw() {
  const route = currentRoute();
  const render = ROUTES[route] ?? renderDashboard;
  render(view);
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', draw);

// Footer button: two-step reset back to the books as first shipped.
const resetButton = document.querySelector('#reset-demo');
let resetArmed = false;
resetButton.addEventListener('click', () => {
  if (!resetArmed) {
    resetArmed = true;
    resetButton.textContent = '本当にリセットしますか？（もう一度押すと実行）';
    setTimeout(() => {
      resetArmed = false;
      resetButton.textContent = 'デモデータをリセット';
    }, 4000);
    return;
  }
  resetDemo();
  resetArmed = false;
  resetButton.textContent = 'デモデータをリセット';
  draw();
});

draw();

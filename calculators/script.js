const display = document.querySelector('#display');
let expression = '';

function render(value = expression || '0') {
  display.textContent = value;
}

function calculate() {
  if (!expression || !/[+\-*/.]$/.test(expression)) return;
  try {
    // The input is restricted to calculator buttons, then evaluated as arithmetic.
    if (!/^[0-9+\-*/. ]+$/.test(expression)) throw new Error('Invalid expression');
    const result = Function(`"use strict"; return (${expression})`)();
    if (!Number.isFinite(result)) throw new Error('Invalid result');
    expression = String(result);
    render();
  } catch {
    expression = '';
    render('Error');
  }
}

document.querySelector('.keys').addEventListener('click', ({ target }) => {
  if (!(target instanceof HTMLButtonElement)) return;
  const { value, action } = target.dataset;
  if (action === 'clear') expression = '';
  else if (action === 'backspace') expression = expression.slice(0, -1);
  else if (action === 'equals') return calculate();
  else if (value) {
    if (value === '.' && expression.split(/[+\-*/]/).pop().includes('.')) return;
    expression += value;
  }
  render();
});

document.addEventListener('keydown', (event) => {
  if (/^[0-9.+\-*/]$/.test(event.key)) { expression += event.key; render(); }
  else if (event.key === 'Enter' || event.key === '=') calculate();
  else if (event.key === 'Escape') { expression = ''; render(); }
  else if (event.key === 'Backspace') { expression = expression.slice(0, -1); render(); }
});

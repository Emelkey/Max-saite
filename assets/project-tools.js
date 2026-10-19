(() => {
  const tool = document.querySelector('[data-budget-tool]');
  if (!tool) return;
  const prices = {landing:5906.25,business:11081.25,seo:16312.5,store:19293.75};
  const update = () => {
    const value = tool.querySelector('select').value;
    const output = tool.querySelector('output');
    const selected = [...tool.querySelectorAll('input:checked')].map(input=>input.value);
    output.textContent = `Від ${prices[value].toLocaleString('uk-UA', {minimumFractionDigits: Number.isInteger(prices[value]) ? 0 : 2, maximumFractionDigits: 2})} грн за базовий формат. ${selected.length ? `Окрема оцінка: ${selected.join(', ')}.` : 'Додаткові модулі не обрані.'} Остаточна ціна — після погодження обсягу.`;
  };
  tool.addEventListener('change', update);
  update();
})();

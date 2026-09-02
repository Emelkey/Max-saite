(() => {
  const tool = document.querySelector('[data-budget-tool]');
  if (!tool) return;
  const prices = {landing:10500,business:19700,seo:29000,store:34300};
  const update = () => {
    const value = tool.querySelector('select').value;
    const output = tool.querySelector('output');
    const selected = [...tool.querySelectorAll('input:checked')].map(input=>input.value);
    output.textContent = `Від ${prices[value].toLocaleString('uk-UA')} грн за базовий формат. ${selected.length ? `Окрема оцінка: ${selected.join(', ')}.` : 'Додаткові модулі не обрані.'} Остаточна ціна — після погодження обсягу.`;
  };
  tool.addEventListener('change', update);
  update();
})();

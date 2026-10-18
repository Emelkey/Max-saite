(() => {
  const tool = document.querySelector('[data-budget-tool]');
  if (!tool) return;
  const prices = {landing:7875,business:14775,seo:21750,store:25725};
  const update = () => {
    const value = tool.querySelector('select').value;
    const output = tool.querySelector('output');
    const selected = [...tool.querySelectorAll('input:checked')].map(input=>input.value);
    output.textContent = `Від ${prices[value].toLocaleString('uk-UA')} грн за базовий формат. ${selected.length ? `Окрема оцінка: ${selected.join(', ')}.` : 'Додаткові модулі не обрані.'} Остаточна ціна — після погодження обсягу.`;
  };
  tool.addEventListener('change', update);
  update();
})();

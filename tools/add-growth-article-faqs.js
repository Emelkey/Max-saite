const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const articles = [
  {
    file: "blog/skilky-koshtuye-stvorennya-internet-magazynu/index.html",
    marker: '<p>Якщо потрібен розрахунок під каталог і інтеграції,',
    questions: [
      ["Чи входить наповнення товарів у стартову ціну?", "Обсяг первинного наповнення погоджується окремо. Для великого каталогу доцільніше підготувати шаблон імпорту й визначити відповідального за актуальність даних."],
      ["Чому інтеграції оцінюються після брифу?", "Вартість залежить від актуального API, обсягу даних, правил синхронізації, помилкових сценаріїв і відповідальності кожної системи."],
      ["Які регулярні витрати не входять у розробку?", "Окремо можуть оплачуватися домен, хостинг, комісії платіжних сервісів, платні модулі, підтримка, наповнення й реклама."],
    ],
  },
  {
    file: "blog/yak-pidgotuvaty-bryf-na-sajt/index.html",
    marker: '<p>Після брифу можна визначити,',
    questions: [
      ["Чи потрібно самостійно писати технічне завдання?", "Ні. Власнику достатньо надати факти про бізнес, аудиторію, послуги, географію, докази й потрібні інтеграції. Технічну структуру формує виконавець."],
      ["Що робити, якщо ціни або структура послуг ще не визначені?", "Позначити це як відкрите рішення. До дизайну потрібно погодити хоча б правила розрахунку й пріоритети, щоб сайт не вводив клієнта в оману."],
      ["Які доступи потрібні на старті?", "Не всі одразу. Власників домену, аналітики й реклами потрібно зафіксувати до початку, а конкретні доступи передавати лише на етапі, коли вони потрібні."],
    ],
  },
  {
    file: "blog/landing-dlya-google-ads/index.html",
    marker: '<p>Пов’язані матеріали:',
    questions: [
      ["Чи можна вести всю рекламу на головну сторінку?", "Можна лише коли головна точно відповідає одному наміру. Для різних послуг зазвичай потрібні окремі релевантні посадкові сторінки."],
      ["Які конверсії потрібно перевірити до запуску?", "Мінімум успішну доставку форми, клік на телефон і переходи в погоджені месенджери. Перегляд сторінки не є лідом."],
      ["Коли додавати мінус-слова?", "Базовий список додають до запуску, а далі регулярно аналізують фактичні пошукові запити й виключають лише нерелевантні наміри без блокування цільових ключів."],
    ],
  },
];

for (const article of articles) {
  const absolute = path.join(root, article.file);
  let html = fs.readFileSync(absolute, "utf8");
  const faqId = "article-faq";
  if (!html.includes(`id="${faqId}"`)) {
    const details = article.questions
      .map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`)
      .join("");
    const section = `<section class="seo-band faq-list reveal" id="${faqId}"><h2>Поширені запитання</h2>${details}</section>`;
    if (!html.includes(article.marker)) throw new Error(`Marker missing: ${article.file}`);
    html = html.replace(article.marker, `${section}${article.marker}`);
  }

  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (full, json) => {
    const data = JSON.parse(json);
    if (!Array.isArray(data["@graph"])) return full;
    if (!data["@graph"].some((item) => item["@type"] === "FAQPage")) {
      data["@graph"].push({
        "@type": "FAQPage",
        mainEntity: article.questions.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      });
    }
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });

  fs.writeFileSync(absolute, html);
}

console.log("Added visible FAQ and matching FAQPage schema to three priority articles.");

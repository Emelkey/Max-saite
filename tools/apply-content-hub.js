#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const sourceLinks = `<section class="seo-band article-sources"><span class="eyebrow">Джерела і редакційна перевірка</span><h2>На що спирається матеріал</h2><ul><li><a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener noreferrer">Google Search Central: people-first content</a></li><li><a href="https://web.dev/performance/" target="_blank" rel="noopener noreferrer">web.dev: web performance</a></li><li><a href="https://www.w3.org/WAI/tutorials/forms/labels/" target="_blank" rel="noopener noreferrer">W3C WAI: доступні форми й підписи</a></li></ul><p>Практичні рекомендації базуються на процесі MAX SITE та перевіряються перед оновленням. Матеріал не є гарантією позицій, строків або бізнес-результату.</p></section>`;

const articles = [
  {
    slug:'skilky-koshtuye-stvorennya-sajtu',
    short:'Вартість сайту',
    title:'Скільки коштує створення сайту у 2026 році | MAX SITE',
    description:'Пояснюємо вартість створення сайту у 2026 році: склад робіт, типи проєктів, інтеграції, приховані витрати та правила точного кошторису.',
    published:'2026-07-18',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> ціна сайту залежить від бізнес-задачі, кількості окремих сценаріїв, контенту, інтеграцій і рівня перевірки. Порівнювати лише кількість блоків — помилка: два однакові за розміром сайти можуть мати зовсім різну складність.</p>
    <h2>Орієнтири MAX SITE для першої версії</h2><div class="seo-columns"><section class="seo-mini-card"><h3>Landing Page</h3><p><strong>від 10 500 грн</strong></p><p>Одна пропозиція, 5–7 смислових блоків, форма, адаптивність і базова технічна підготовка.</p></section><section class="seo-mini-card"><h3>Бізнес-сайт</h3><p><strong>від 19 700 грн</strong></p><p>Головна, до п’яти внутрішніх сторінок, послуги, аналітична підготовка та SEO-структура.</p></section><section class="seo-mini-card"><h3>SEO Pro</h3><p><strong>від 29 000 грн</strong></p><p>До десяти сторінок на старті, перелінковка, schema, Search Console і основа контент-хабу.</p></section></div><p>Це опубліковані стартові орієнтири, а не універсальна оферта. Склад, ціна й строки фіксуються після брифу.</p>
    <h2>З чого складається кошторис</h2><ol><li><strong>Дослідження й структура.</strong> Визначаємо аудиторії, запити, сторінки та шлях до звернення.</li><li><strong>Контент.</strong> Перевіряємо наявні матеріали, формуємо зміст, готуємо тексти й візуали в погодженому обсязі.</li><li><strong>Дизайн.</strong> Створюємо систему компонентів, а не набір непов’язаних макетів.</li><li><strong>Розробка.</strong> Верстка, форми, інтеграції, аналітика, адаптивність і технічні правила.</li><li><strong>QA та запуск.</strong> Перевіряємо навігацію, мобільні сценарії, метадані, канонічні URL і production.</li></ol>
    <h2>Що збільшує бюджет найчастіше</h2><ul><li>великий каталог, фільтри, особистий кабінет або ролі;</li><li>CRM, онлайн-оплата, доставка, телефонія чи нестандартний API;</li><li>кілька мов із повноцінним перекладом і окремими URL;</li><li>фотозйомка, ілюстрації або великий обсяг редакційної роботи;</li><li>міграція зі старого сайту зі збереженням URL і пошукових сигналів;</li><li>окреме щомісячне SEO, реклама або підтримка після запуску.</li></ul>
    <h2>Як порівнювати дві пропозиції</h2><p>Попросіть однакову декомпозицію: карта сторінок, перелік функцій, відповідальний за контент, кількість погоджень, браузерна й мобільна перевірка, передача доступів, умови підтримки. Низька цифра без меж робіт не дає зрозуміти фінальну вартість.</p>
    <h2>П’ять відповідей для точного розрахунку</h2><ul><li>Що сайт має продавати або пояснювати?</li><li>Які аудиторії й послуги не можна змішувати на одній сторінці?</li><li>Звідки очікується трафік: Ads, органічний пошук, соцмережі, прямі переходи?</li><li>Які матеріали вже готові й хто їх погоджує?</li><li>Які інтеграції потрібні в першій версії?</li></ul><p>Далі варто визначити мінімальний реліз і відкласти другорядні функції. Так бюджет спрямовується на перевірний результат, а не на запас можливостей.</p>
    <p><a href="/stvorennya-saytiv/">Переглянути склад створення сайту під ключ</a> · <a href="/blog/chomu-tsiny-na-sajty-vidriznyayutsya/">Чому оцінки різних студій відрізняються</a>.</p>`
  },
  {
    slug:'yak-vybraty-vebstudiyu-v-ukrayini',
    short:'Вибір вебстудії',
    title:'Як вибрати вебстудію в Україні: практичний чек-лист',
    description:'Як перевірити вебстудію до договору: кейси, процес, кошторис, доступи, SEO, аналітика, ризики та питання для фінальної співбесіди.',
    published:'2026-08-28',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> обирайте не найкрасивішу презентацію, а команду або відповідального, які можуть показати живі роботи, пояснити процес, зафіксувати межі й залишити ключові акаунти під вашим контролем.</p>
    <h2>Почніть із задачі, а не технології</h2><p>До першої розмови сформулюйте продукт, аудиторію, бажану дію та джерела трафіку. Якщо підрядник одразу продає платформу без уточнення цих даних, він оптимізує рішення під свій шаблон, а не під бізнес.</p>
    <h2>Перевірте три рівні доказів</h2><ol><li><strong>Живий URL.</strong> Сайт відкривається, має реальний контент, мобільну версію й контакти.</li><li><strong>Опис внеску.</strong> Зрозуміло, що саме зробив підрядник: структура, дизайн, код, SEO, реклама чи лише окремий блок.</li><li><strong>Підтверджений результат.</strong> Цифри мають період, джерело й дозвіл власника. Скріншот без контексту не є доказом доходу.</li></ol><p>Перегляньте <a href="/portfolio/">кейси MAX SITE</a> як приклад поділу перевірних фактів і непідтверджених даних.</p>
    <h2>Попросіть показати процес до підписання</h2><div class="seo-columns"><article class="seo-mini-card"><h3>До дизайну</h3><p>Бриф, карта сторінок, пошукові наміри, контентні залежності та критерії приймання.</p></article><article class="seo-mini-card"><h3>Під час роботи</h3><p>Етапи, відповідальні, формат погоджень, межі правок і регулярні демонстрації.</p></article><article class="seo-mini-card"><h3>Перед запуском</h3><p>Форми, мобільні екрани, аналітика, метадані, доступність, резервний і rollback-план.</p></article></div>
    <h2>Де мають зберігатися доступи</h2><p>Домен, DNS, репозиторій, GA4, Search Console, Google Ads і платіжні сервіси мають належати бізнесу. Підрядник отримує роль, потрібну для роботи. У договорі або пропозиції варто зафіксувати передачу файлів, список акаунтів і процедуру відкликання доступу.</p>
    <h2>Сім запитань фіналісту</h2><ul><li>Який URL володітиме кожним основним пошуковим наміром?</li><li>Хто готує та погоджує тексти, фото й юридичні формулювання?</li><li>Як перевіряються форма, мобільне меню й помилки production?</li><li>Що не входить у названу ціну?</li><li>Як обробляються зміни обсягу?</li><li>Хто володіє доменом, кодом та аналітичними акаунтами?</li><li>Який період технічних виправлень зафіксують у договорі?</li></ul>
    <h2>Червоні прапорці</h2><ul><li>гарантія TOP-1 або точної кількості заявок;</li><li>відсутність живих кейсів і конкретного опису внеску;</li><li>оплата на невизначений «сайт під ключ» без переліку результатів;</li><li>реєстрація домену та Google-акаунтів лише на підрядника;</li><li>масові міські сторінки з однаковим текстом;</li><li>відмова описати передачу й підтримку після запуску.</li></ul><p><a href="/pro-nas/">Як організована відповідальність MAX SITE</a> · <a href="/qa-checklist/">Чек-лист перевірки сайту</a>.</p>`
  },
  {
    slug:'shcho-vhodyt-u-sajt-pid-klyuch',
    short:'Сайт під ключ',
    title:'Що входить у сайт під ключ: етапи й межі робіт',
    description:'Повний склад сайту під ключ: дослідження, структура, контент, дизайн, розробка, SEO, аналітика, QA, запуск, доступи та підтримка.',
    published:'2026-08-28',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> «під ключ» має означати погоджений результат, готовий до використання на домені, а не необмежений набір послуг. У пропозиції повинні бути сторінки, функції, матеріали, інтеграції, перевірки й передача.</p>
    <h2>1. Діагностика задачі</h2><p>Фіксуємо продукт, аудиторії, конкурентне середовище, конверсійну дію та джерела трафіку. Результат етапу — короткий бриф і список припущень, які потрібно підтвердити.</p>
    <h2>2. Архітектура</h2><p>Створюємо карту сторінок і визначаємо власника кожного основного наміру. Для реклами плануємо відповідність групи оголошень посадковій сторінці; для SEO — canonical, перелінковку й відсутність канібалізації.</p>
    <h2>3. Контент</h2><p>Визначаємо, що надає бізнес, а що готується в межах проєкту: тексти, фото, ціни, кейси, юридичні дані. Непідтверджені цифри, відгуки й сертифікати не повинні потрапляти на сайт.</p>
    <h2>4. Дизайн</h2><p>Проєктуємо перший екран, навігацію, типові секції, форми, мобільний сценарій і стани помилок. Компонентна система скорочує непослідовність та полегшує майбутні зміни.</p>
    <h2>5. Розробка й інтеграції</h2><ul><li>семантичний HTML і адаптивна верстка;</li><li>форми із validation, consent, success/error state та spam protection;</li><li>телефон і месенджери;</li><li>аналітика ключових дій без PII;</li><li>CRM, оплата або API — якщо вони прямо включені;</li><li>HTTPS, canonical, robots, sitemap і базова schema.</li></ul>
    <h2>6. QA та production</h2><p>До запуску перевіряються навігація, клавіатура, мобільний overflow, форми, 404, console errors, метадані, schema, sitemap та analytics. Production перевіряється повторно після деплою.</p>
    <h2>7. Передача</h2><p>Клієнт отримує погоджені доступи, код або репозиторій, перелік сервісів і коротку інструкцію. Умови подальшої підтримки й період виправлення технічних помилок фіксуються окремо.</p>
    <h2>Що зазвичай не входить автоматично</h2><ul><li>безстрокове наповнення та необмежені правки;</li><li>щомісячне SEO, Google Ads і контент-маркетинг;</li><li>вартість домену, реклами й сторонніх підписок;</li><li>професійна фото- або відеозйомка;</li><li>складні CRM, кабінети й інтеграції без технічного опису.</li></ul><p><a href="/stvorennya-saytiv/">Склад послуги MAX SITE</a> · <a href="/blog/skilky-tryvaye-rozrobka-sajtu/">Як формується строк розробки</a>.</p>`
  },
  {
    slug:'chomu-tsiny-na-sajty-vidriznyayutsya',
    short:'Різниця у цінах',
    title:'Чому ціни на сайти відрізняються у 5–10 разів',
    description:'Розбір різниці у вартості сайтів: склад робіт, шаблон чи custom, контент, інтеграції, SEO, QA, ризики та повна вартість володіння.',
    published:'2026-08-28',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> дві пропозиції часто оцінюють різні продукти під однаковою назвою «сайт». В одній може бути лише шаблон і форма, в іншій — дослідження, окремі сторінки, інтеграції, QA, аналітика та передача.</p>
    <h2>Одна назва — різний обсяг</h2><p>«Корпоративний сайт» може означати п’ять простих сторінок або систему з каталогом, кількома мовами, CRM, ролями й міграцією. Порівняння ціни можливе лише після вирівнювання карти сторінок і критеріїв приймання.</p>
    <h2>Шаблон, компоненти або індивідуальна система</h2><p>Готовий шаблон скорочує старт, але може обмежувати структуру й майбутні зміни. Компонентний дизайн створює повторювану систему під бренд. Повністю custom-рішення потрібне, коли процес або інтерфейс справді нестандартний — інакше бізнес платить за непотрібну унікальність.</p>
    <h2>Контент — прихована частина кошторису</h2><p>Якщо клієнт надає перевірені тексти, фото, ціни й кейси, команда витрачає менше часу. Коли потрібно досліджувати попит, проводити інтерв’ю, писати, редагувати й готувати графіку, це окрема робота, навіть якщо кількість сторінок не змінюється.</p>
    <h2>Інтеграція змінює не один блок</h2><p>CRM або оплата потребує не тільки кнопки: потрібні стани помилок, validation, безпека, аналітика, тестові сценарії й підтримка змін стороннього сервісу. Чим більше залежностей, тим вища вартість перевірки та відповідальності.</p>
    <h2>SEO-основа і SEO-просування — різні речі</h2><p>Під час розробки можна закласти URL-структуру, метадані, schema, sitemap, canonical і аналітику. Регулярне дослідження запитів, створення матеріалів, Digital PR та робота з Search Console тривають після запуску й не мають маскуватися в одноразовій ціні.</p>
    <h2>QA, доступність і передача</h2><p>Дешева оцінка часто не містить системної перевірки мобільних екранів, keyboard navigation, форм, schema, 404 і production. Це не завжди означає погану роботу, але ризик переноситься на власника сайту.</p>
    <h2>Порівняльна матриця</h2><div class="comparison-table" role="region" aria-label="Порівняння пропозицій" tabindex="0"><table><thead><tr><th>Питання</th><th>Що має бути в пропозиції</th></tr></thead><tbody><tr><td>Сторінки</td><td>Точна карта й типи шаблонів</td></tr><tr><td>Контент</td><td>Хто пише, редагує та погоджує</td></tr><tr><td>Інтеграції</td><td>Сценарії, обмеження, тестове середовище</td></tr><tr><td>SEO</td><td>Технічний склад і окремий план розвитку</td></tr><tr><td>QA</td><td>Пристрої, форми, доступність, production</td></tr><tr><td>Передача</td><td>Домен, код, акаунти, документація</td></tr></tbody></table></div>
    <p><a href="/blog/skilky-koshtuye-stvorennya-sajtu/">Поточні орієнтири вартості</a> · <a href="/blog/yak-vybraty-vebstudiyu-v-ukrayini/">Як перевірити вебстудію</a>.</p>`
  },
  {
    slug:'lending-abo-korporatyvnyj-sajt',
    short:'Landing чи корпоративний',
    title:'Landing Page чи корпоративний сайт: що обрати',
    description:'Порівнюємо Landing Page, бізнес-сайт і корпоративний сайт за задачами, рекламою, SEO, масштабуванням, контентом та повною вартістю.',
    published:'2026-07-21',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> лендінг підходить для однієї пропозиції й одного головного сценарію. Бізнес- або корпоративний сайт потрібен, коли різні послуги, аудиторії, докази й пошукові наміри не можна чесно вмістити на одну сторінку.</p>
    <h2>Коли достатньо Landing Page</h2><ul><li>одна послуга або продукт;</li><li>одна основна аудиторія;</li><li>трафік переважно з однієї рекламної кампанії;</li><li>короткий шлях від проблеми до заявки;</li><li>перевірка нової пропозиції без складного каталогу.</li></ul><p>Лендінг не означає «дешевий сайт». Сильна посадкова може потребувати дослідження, доказів, аналітики й кількох версій рекламного повідомлення.</p>
    <h2>Коли потрібен бізнес-сайт</h2><p>Оберіть багатосторінкову структуру, якщо є кілька послуг, різні аудиторії, кейси, FAQ, команда й план органічного пошуку. Кожний окремий намір отримує релевантний URL, а користувач не читає довгу змішану сторінку.</p>
    <h2>Коли потрібен корпоративний сайт</h2><p>Корпоративний формат корисний для складнішого циклу довіри: кілька напрямів, B2B, партнери, вакансії, документи, проєкти, географія й відповідальні. Його відмінність не лише в кількості сторінок, а в інформаційній архітектурі.</p>
    <h2>Порівняння</h2><div class="comparison-table" role="region" aria-label="Порівняння типів сайтів" tabindex="0"><table><thead><tr><th>Критерій</th><th>Landing</th><th>Бізнес-сайт</th><th>Корпоративний</th></tr></thead><tbody><tr><td>Основний намір</td><td>Одна пропозиція</td><td>Кілька послуг</td><td>Компанія й напрями</td></tr><tr><td>Ads</td><td>Одна релевантна група</td><td>Кілька посадкових</td><td>Окремі кампанії/напрями</td></tr><tr><td>SEO</td><td>Обмежений кластер</td><td>Кластери послуг</td><td>Широка архітектура</td></tr><tr><td>Масштабування</td><td>Через нові посадкові</td><td>Через сторінки</td><td>Через розділи й системи</td></tr></tbody></table></div>
    <h2>Decision tree</h2><ol><li>Якщо одна пропозиція й один рекламний сценарій — почніть із лендінгу.</li><li>Якщо дві або більше послуг потребують різних аргументів — бізнес-сайт.</li><li>Якщо потрібні напрями, команда, партнери, документи чи кабінет — корпоративний або custom-рішення.</li><li>Якщо відповідь невизначена — спочатку карта аудиторій і намірів, потім формат.</li></ol><p><a href="/stvorennya-landing-page/">Створення Landing Page</a> · <a href="/stvorennya-korporatyvnoho-saytu/">Корпоративний сайт</a> · <a href="/stvorennya-program/">Custom software</a>.</p>`
  },
  {
    slug:'skilky-tryvaye-rozrobka-sajtu',
    short:'Строк розробки',
    title:'Скільки триває розробка сайту: реалістичний план',
    description:'Від чого залежить строк розробки сайту: бриф, структура, контент, дизайн, код, інтеграції, QA, погодження та критичний шлях.',
    published:'2026-08-28',
    body:`<p class="article-lead"><strong>Коротка відповідь:</strong> строк визначає не лише код. Критичний шлях проходить через рішення, матеріали, погодження, інтеграції та QA. Точний календар можна назвати після карти сторінок і залежностей.</p>
    <h2>Що входить у календар</h2><ol><li><strong>Бриф і діагностика.</strong> Узгоджуємо аудиторії, цілі, джерела трафіку й відповідальних.</li><li><strong>Структура.</strong> Формуємо URL, прототипи та контентні вимоги.</li><li><strong>Матеріали.</strong> Збираємо й перевіряємо тексти, фото, ціни, кейси та юридичні дані.</li><li><strong>Дизайн.</strong> Погоджуємо напрям, компоненти й мобільні стани.</li><li><strong>Розробка.</strong> Верстка, функції, форми, інтеграції та аналітика.</li><li><strong>QA і запуск.</strong> Тестування, виправлення, домен, production і повторна перевірка.</li></ol>
    <h2>Чому проста оцінка в днях часто не працює</h2><p>Команда може завершити макет, але чекати фото; інтеграція може залежати від доступу; власник може повернути суперечливі правки. Тому календар має містити не лише робочий час підрядника, а й строки на матеріали та рішення клієнта.</p>
    <h2>Що можна робити паралельно</h2><p>Після погодження структури частину контенту, дизайн компонентів, технічну підготовку й аналітичний план можна вести паралельно. Але розробка сторінки без затвердженого змісту часто створює переробку, а не економію.</p>
    <h2>Що подовжує проєкт</h2><ul><li>нові функції після погодження кошторису;</li><li>відсутність одного відповідального за рішення;</li><li>непідготовлені ціни, фото, кейси й юридичні тексти;</li><li>кілька мов без готового перекладу;</li><li>зовнішні API без тестового доступу;</li><li>міграція URL і даних без повного inventory.</li></ul>
    <h2>Як скоротити строк без втрати якості</h2><ul><li>призначити одного власника рішень;</li><li>погодити MVP і відкласти другорядні функції;</li><li>дати доступи й матеріали до відповідного етапу;</li><li>об’єднувати правки в один узгоджений список;</li><li>не пропускати QA — виправлення після реклами дорожче.</li></ul>
    <h2>Контрольні точки</h2><div class="seo-columns"><article class="seo-mini-card"><h3>Структура готова</h3><p>Є карта URL, цілі сторінок, CTA й перелік матеріалів.</p></article><article class="seo-mini-card"><h3>Дизайн готовий</h3><p>Погоджено систему компонентів, mobile і важливі стани.</p></article><article class="seo-mini-card"><h3>Готово до релізу</h3><p>Пройдені форми, SEO, analytics, accessibility і production checklist.</p></article></div><p><a href="/blog/shcho-vhodyt-u-sajt-pid-klyuch/">Повний склад робіт</a> · <a href="/qa-checklist/">Що перевіряємо перед запуском</a>.</p>`
  }
];

const templateFile = path.join(root, 'blog', 'skilky-koshtuye-stvorennya-sajtu', 'index.html');
const template = fs.readFileSync(templateFile, 'utf8');

function jsonLd(article) {
  const url = `https://maxsite.com.ua/blog/${article.slug}/`;
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':'https://maxsite.com.ua/#organization',name:'MAX SITE',url:'https://maxsite.com.ua/',telephone:'+380972692322'},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Головна',item:'https://maxsite.com.ua/'},{'@type':'ListItem',position:2,name:'Блог',item:'https://maxsite.com.ua/blog/'},{'@type':'ListItem',position:3,name:article.short,item:url}]},
    {'@type':'Article','@id':`${url}#article`,headline:article.title.replace(/ \| MAX SITE$/, ''),description:article.description,datePublished:article.published,dateModified:'2026-08-28',author:{'@id':'https://maxsite.com.ua/zasnovnyk/#person'},publisher:{'@id':'https://maxsite.com.ua/#organization'},mainEntityOfPage:url,image:'https://maxsite.com.ua/assets/og-max-site.webp'}
  ]});
}

function articleMain(article) {
  const body = article.body
    .replace(/<article class="seo-mini-card">/g, '<section class="seo-mini-card">')
    .replace(/<\/article>/g, '</section>');
  return `<main class="section seo-page"><nav class="breadcrumbs" aria-label="Хлібні крихти"><span><a href="/">Головна</a></span><span><a href="/blog/">Блог</a></span><span>${article.short}</span></nav><section class="seo-hero reveal"><div><span class="eyebrow">Практичний гід · оновлено 28.08.2026</span><h1>${article.title.replace(/ \| MAX SITE$/, '')}</h1><p>${article.description}</p><div class="hero-buttons"><a class="btn" href="#article">Читати матеріал</a><a class="btn btn-ghost" href="#lead">Обговорити задачу</a></div></div><aside class="seo-hero-card"><strong>Рішення до дизайну</strong><p>Спочатку задача, структура й критерії. Потім інтерфейс, код і запуск.</p></aside></section><div class="seo-content"><article class="article-body reveal" id="article">${body}<p class="article-author">Автор: відповідальний за проєкти MAX SITE. <a href="/zasnovnyk/">Роль, процес і правила доказовості</a>. Опубліковано ${article.published.split('-').reverse().join('.')}; оновлено 28.08.2026.</p></article>${sourceLinks}<section class="seo-band"><h2>Читайте далі</h2><div class="link-grid"><a href="/blog/skilky-koshtuye-stvorennya-sajtu/">Скільки коштує сайт</a><a href="/blog/yak-vybraty-vebstudiyu-v-ukrayini/">Як вибрати вебстудію</a><a href="/blog/shcho-vhodyt-u-sajt-pid-klyuch/">Що входить у сайт під ключ</a><a href="/blog/lending-abo-korporatyvnyj-sajt/">Landing чи корпоративний сайт</a></div></section><section class="seo-lead reveal" id="lead"><div><span class="eyebrow">Консультація</span><h2>Потрібне рішення під ваш бізнес?</h2><p>Опишіть задачу, послуги й джерела трафіку. Запропонуємо структуру, межі першого релізу та реалістичний план.</p><p><a href="tel:+380972692322">0972692322</a> · <a href="https://t.me/MaxMytt">Telegram</a></p></div><form class="compact-form" action="#" method="post"><input name="name" aria-label="Ім’я" autocomplete="name" placeholder="Ім’я" required><input name="phone" aria-label="Телефон" autocomplete="tel" inputmode="tel" placeholder="Телефон" required><textarea name="comment" aria-label="Коротко про задачу" rows="4" placeholder="Коротко про задачу"></textarea><label class="form-consent"><input type="checkbox" name="consent" aria-label="Погодження з політикою конфіденційності" required><span>Погоджуюся з <a href="/polityka-konfidentsijnosti/">політикою конфіденційності</a>.</span></label><button class="btn" type="submit">Отримати консультацію</button></form></section></div></main>`;
}

for (const article of articles) {
  const file = path.join(root, 'blog', article.slug, 'index.html');
  fs.mkdirSync(path.dirname(file), {recursive:true});
  let html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : template;
  const url = `https://maxsite.com.ua/blog/${article.slug}/`;
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${article.title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${article.description}" />`)
    .replace(/<link rel="canonical" href="[^"]+"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${article.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${article.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${article.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${article.description}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonLd(article)}</script>`)
    .replace(/<main\b[\s\S]*?<\/main>/, articleMain(article));
  fs.writeFileSync(file, html);
}

const blogIndexFile = path.join(root, 'blog', 'index.html');
let blogIndex = fs.readFileSync(blogIndexFile, 'utf8');
const priority = `<section class="seo-links"><h2>Пріоритетні матеріали</h2><div class="link-grid"><a href="/blog/skilky-koshtuye-stvorennya-sajtu/">Скільки коштує створення сайту у 2026 році</a><a href="/blog/yak-vybraty-vebstudiyu-v-ukrayini/">Як вибрати вебстудію в Україні</a><a href="/blog/shcho-vhodyt-u-sajt-pid-klyuch/">Що входить у сайт під ключ</a><a href="/blog/chomu-tsiny-na-sajty-vidriznyayutsya/">Чому ціни відрізняються у 5–10 разів</a><a href="/blog/lending-abo-korporatyvnyj-sajt/">Landing Page чи корпоративний сайт</a><a href="/blog/skilky-tryvaye-rozrobka-sajtu/">Скільки триває розробка сайту</a></div></section>`;
blogIndex = blogIndex.replace(/<section class="seo-links"><h2>Пріоритетні матеріали<\/h2>[\s\S]*?<\/section>/, priority);
fs.writeFileSync(blogIndexFile, blogIndex);

console.log(`Published/updated ${articles.length} priority content-hub articles.`);

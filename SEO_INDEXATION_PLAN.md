# MAX SITE — карта індексації та переписування

Дата аудиту: 23 липня 2026 року  
Середовище: `https://emelkey.github.io/Max-saite/`  
Статус: робочий план до підключення Google Search Console

## Правило ухвалення рішень

- **Index** — сторінка зберігається в sitemap і може індексуватися.
- **Index + improve** — URL і намір правильні, але сторінка потребує змістовного посилення.
- **Rewrite first** — сторінка має високий ризик шаблонності; її потрібно суттєво переписати до активного просування.
- **Noindex candidate** — лише рекомендація на випадок, якщо сторінка не має показів, посилань, унікальної цінності або плану переписування. Масовий `noindex` не застосовувати без даних Search Console і окремого погодження.

## Перший пакет реалізації

Першими переписуються три сторінки ніш, три сторінки географії та дві комерційні статті:

1. `/nishi/sajt-dlya-kliningovoyi-kompaniyi/`
2. `/nishi/sajt-dlya-lokalnogo-biznesu/`
3. `/nishi/sajt-dlya-budivelnoyi-kompaniyi/`
4. `/mista/stvorennya-sajtiv-cherkasy/`
5. `/mista/stvorennya-sajtiv-kyiv/`
6. `/mista/stvorennya-sajtiv-ukrayina/`
7. `/blog/skilky-koshtuye-stvorennya-sajtu/`
8. `/blog/lending-abo-korporatyvnyj-sajt/`

Окремо в першому технічному пакеті посилюються сторінки `/google-ads/` та `/google-analytics-search-console/`, тому що вони мають власні ціни, послуги та пошукові наміри.

## Карта всіх 58 URL

| № | URL | Рішення | Пріоритет | Коментар |
|---:|---|---|---|---|
| 1 | `/` | Index | Критичний | Головна комерційна сторінка; зберегти дизайн, ціни й перелінковку. |
| 2 | `/poslugy/` | Index + improve | Високий | Хаб послуг; має розподіляти наміри між окремими посадковими. |
| 3 | `/stvorennya-sajtiv-pid-klyuch/` | Index + improve | Високий | Основний комерційний запит. |
| 4 | `/stvorennya-lendingiv/` | Index + improve | Високий | Окремий формат продукту й намір. |
| 5 | `/korporatyvni-sajty/` | Index + improve | Високий | Окремий формат продукту й намір. |
| 6 | `/sajty-dlya-poslug/` | Index + improve | Високий | Важлива сторінка для сервісного бізнесу. |
| 7 | `/seo-sajt-pid-google/` | Index + improve | Високий | Не обіцяти гарантовані позиції; пояснити межі базового SEO. |
| 8 | `/internet-magazyn-pid-klyuch/` | Index + improve | Високий | Окремий продукт і ціна. |
| 9 | `/google-ads/` | Index + improve | Критичний | Прибрати загальні тарифи сайтів; показати ціни й FAQ саме Google Ads. |
| 10 | `/google-analytics-search-console/` | Index + improve | Критичний | Розділити разове налаштування й щомісячний супровід. |
| 11 | `/portfolio/` | Index | Високий | Два підтверджені кейси; не змінювати зовнішні сайти. |
| 12 | `/kontakty/` | Index | Високий | Показувати тільки підтверджені канали зв’язку. |
| 13 | `/polityka-konfidentsijnosti/` | Index | Середній | Не є посадковою; потрібна для довіри та форм. |
| 14 | `/nishi/` | Index + improve | Високий | Хаб ніш із короткими унікальними описами й перелінковкою. |
| 15 | `/nishi/sajt-dlya-kliningovoyi-kompaniyi/` | Rewrite first | Критичний | Перший пакет; використати релевантний кейс «Формула Чистоти». |
| 16 | `/nishi/sajt-dlya-budivelnoyi-kompaniyi/` | Rewrite first | Критичний | Перший пакет; без вигаданого кейсу чи результатів. |
| 17 | `/nishi/sajt-dlya-salonu-krasy/` | Rewrite first | Високий | Потрібні унікальні сценарії запису, послуг і локального пошуку. |
| 18 | `/nishi/sajt-dlya-avtoservisu/` | Rewrite first | Високий | Потрібні сценарії за послугами, марками авто та записом. |
| 19 | `/nishi/sajt-dlya-medychnyh-poslug/` | Rewrite first | Високий | Особливо обережно з медичними твердженнями й довірою. |
| 20 | `/nishi/sajt-dlya-remontnyh-poslug/` | Rewrite first | Високий | Потрібні унікальні послуги, об’єкти, фото й кваліфікація заявки. |
| 21 | `/nishi/sajt-dlya-magazynu/` | Rewrite first | Високий | Розвести інформаційний сайт магазину та інтернет-магазин. |
| 22 | `/nishi/sajt-dlya-lokalnogo-biznesu/` | Rewrite first | Критичний | Перший пакет; геозапити, карта, дзвінки, сервісна зона. |
| 23 | `/nishi/sajt-dlya-eksperta/` | Rewrite first | Високий | Довіра, продуктова лінійка, консультації; без вигаданих регалій. |
| 24 | `/nishi/sajt-dlya-kursiv/` | Rewrite first | Високий | Програма, формат, оплата, FAQ; не обіцяти результати навчання. |
| 25 | `/mista/` | Index + improve | Високий | Хаб географії; пояснити дистанційний формат роботи. |
| 26 | `/mista/stvorennya-sajtiv-cherkasy/` | Rewrite first | Критичний | Перший пакет; чесно описати роботу з бізнесом Черкас без фальшивого офісу. |
| 27 | `/mista/stvorennya-sajtiv-chernihiv/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 28 | `/mista/stvorennya-sajtiv-chernivtsi/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 29 | `/mista/stvorennya-sajtiv-dnipro/` | Rewrite first | Високий | Додати унікальні сценарії B2B, послуг і конкуренції, без вигаданих даних. |
| 30 | `/mista/stvorennya-sajtiv-ivano-frankivsk/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 31 | `/mista/stvorennya-sajtiv-kharkiv/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 32 | `/mista/stvorennya-sajtiv-kherson/` | Rewrite first | Високий | Уникати неперевірених локальних і безпекових тверджень. |
| 33 | `/mista/stvorennya-sajtiv-khmelnytskyi/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 34 | `/mista/stvorennya-sajtiv-kropyvnytskyi/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 35 | `/mista/stvorennya-sajtiv-kyiv/` | Rewrite first | Критичний | Перший пакет; висока конкуренція, сегментація послуг і районів. |
| 36 | `/mista/stvorennya-sajtiv-lutsk/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 37 | `/mista/stvorennya-sajtiv-lviv/` | Rewrite first | Високий | Додати унікальний бізнес-сценарій, не вигадувати локальну присутність. |
| 38 | `/mista/stvorennya-sajtiv-mykolaiv/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 39 | `/mista/stvorennya-sajtiv-odesa/` | Rewrite first | Високий | Унікально розкрити сезонність і послуги лише як сценарії, не як статистику. |
| 40 | `/mista/stvorennya-sajtiv-poltava/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 41 | `/mista/stvorennya-sajtiv-rivne/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 42 | `/mista/stvorennya-sajtiv-sumy/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 43 | `/mista/stvorennya-sajtiv-ternopil/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 44 | `/mista/stvorennya-sajtiv-ukrayina/` | Rewrite first | Критичний | Перший пакет; національна архітектура без масових doorway-сторінок. |
| 45 | `/mista/stvorennya-sajtiv-uzhhorod/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 46 | `/mista/stvorennya-sajtiv-vinnytsya/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 47 | `/mista/stvorennya-sajtiv-zaporizhzhya/` | Rewrite first | Високий | Уникати неперевірених локальних і безпекових тверджень. |
| 48 | `/mista/stvorennya-sajtiv-zhytomyr/` | Rewrite first | Високий | Високий ризик дублювання міського шаблону. |
| 49 | `/blog/` | Index + improve | Високий | Хаб статей; додати описи, дати й тематичні кластери. |
| 50 | `/blog/skilky-koshtuye-stvorennya-sajtu/` | Rewrite first | Критичний | Перший пакет; актуальні ціни, фактори, межі комплектації. |
| 51 | `/blog/lending-abo-korporatyvnyj-sajt/` | Rewrite first | Критичний | Перший пакет; практичне порівняння і дерево вибору. |
| 52 | `/blog/yak-sajt-dopomagaye-otrymuvaty-zayavky/` | Rewrite first | Високий | Не гарантувати ліди; пояснити роль трафіку й конверсії. |
| 53 | `/blog/chomu-sajt-bez-seo-ne-daye-rezultatu/` | Rewrite first | Високий | Не знецінювати інші канали; відрізнити технічну базу від просування. |
| 54 | `/blog/yak-pidgotuvaty-biznes-do-zapusku-sajtu/` | Rewrite first | Високий | Додати практичний чекліст і приклади матеріалів. |
| 55 | `/blog/yakyj-sajt-potriben-lokalnomu-biznesu/` | Rewrite first | Високий | Унікально розкрити локальний намір і карту конверсій. |
| 56 | `/blog/sajt-dlya-kliningovoyi-kompaniyi/` | Rewrite first | Високий | Не дублювати нішеву посадкову; стаття має бути інформаційною. |
| 57 | `/blog/google-ads-dlya-biznesu/` | Rewrite first | Високий | Не дублювати посадкову Google Ads; стаття має допомагати ухвалити рішення. |
| 58 | `/blog/google-analytics-search-console/` | Rewrite first | Високий | Пояснити різницю інструментів, не дублювати сторінку послуги. |

## Умови для можливого noindex

Після підключення Search Console сторінку можна винести на окреме погодження для `noindex`, якщо одночасно виконуються умови:

1. немає показів і кліків за репрезентативний період;
2. немає зовнішніх посилань або підтвердженого попиту;
3. сторінка суттєво дублює інший URL;
4. у найближчому контентному плані немає її якісного переписування.

До отримання цих даних sitemap, canonical і статус індексації не змінювати масово.

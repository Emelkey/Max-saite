const fs = require("fs");
const path = require("path");
const file = path.resolve(__dirname, "../seo/cities.json");
const cities = JSON.parse(fs.readFileSync(file, "utf8"));
const descriptions = {
  kyiv: "Створення сайтів у Києві під ключ для B2B, нерухомості, медицини, ecommerce і послуг. SEO-структура, аналітика, дистанційний процес і заявки.",
  lviv: "Створення сайтів у Львові для готелів, освіти, медицини й локальних брендів. Мультимовні сценарії, мобільний UX, SEO, аналітика й заявки.",
  odesa: "Створення сайтів в Одесі для hospitality, логістики, нерухомості, медицини й послуг. Сезонні офери, мультимовність, SEO та заявки без дублів.",
  dnipro: "Створення сайтів у Дніпрі для виробництва, інженерії, логістики, авто й B2B. Каталоги, запити кошторису, SEO, аналітика й online-заявки.",
  kharkiv: "Створення сайтів у Харкові для IT, освіти, виробництва, медицини й ecommerce. Експертний контент, online-процес, SEO, аналітика та заявки.",
};
for (const city of cities) if (descriptions[city.slug]) city.description = descriptions[city.slug];
fs.writeFileSync(file, `${JSON.stringify(cities, null, 2)}\n`);

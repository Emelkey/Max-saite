const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const excluded = new Set([".git", "artifacts", "docs", "node_modules", "release", "tools"]);
const labelByName = {
  name: "Ім’я",
  phone: "Телефон або месенджер",
  business: "Тип проєкту або ніша",
  comment: "Коротко про задачу",
  consent: "Погодження з політикою конфіденційності",
};

const htmlFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
};

walk(root);

const addAttribute = (attributes, name, value) => {
  if (new RegExp(`\\b${name}=`, "i").test(attributes)) return attributes;
  return `${attributes} ${name}="${value}"`;
};

const improveControl = (tag, attributes) => {
  const selfClosing = /\/\s*$/.test(attributes);
  const cleanAttributes = attributes.replace(/\/\s*$/, "").trimEnd();
  const type = cleanAttributes.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
  if (type === "hidden") return `<${tag}${cleanAttributes}${selfClosing ? " /" : ""}>`;

  const name = cleanAttributes.match(/\bname=["']([^"']+)["']/i)?.[1] || "field";
  let next = cleanAttributes;
  next = addAttribute(next, "aria-label", labelByName[name] || "Поле форми");

  if (tag.toLowerCase() === "input") {
    if (name === "name") next = addAttribute(next, "autocomplete", "name");
    if (name === "phone") {
      next = addAttribute(next, "autocomplete", "tel");
      next = addAttribute(next, "inputmode", "tel");
    }
  }

  return `<${tag}${next}${selfClosing ? " /" : ""}>`;
};

let changed = 0;
let forms = 0;
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  let html = source.replace(/\bFo[ -]Dez\b/g, "FO-DEZ");

  html = html.replace(/<form\b[\s\S]*?<\/form>/gi, (form) => {
    forms += 1;
    const normalizedForm = form.replace(/\s+\/\s+(?=[\w:-]+=["'])/g, " ");
    let next = normalizedForm.replace(/<(input|textarea|select)\b([^>]*)>/gi, (_, tag, attributes) =>
      improveControl(tag, attributes)
    );

    if (!/\bname=["']consent["']/i.test(next)) {
      const consent = '<label class="form-consent"><input type="checkbox" name="consent" aria-label="Погодження з політикою конфіденційності" required><span>Погоджуюся з <a href="/polityka-konfidentsijnosti/">політикою конфіденційності</a>.</span></label>';
      next = next.replace(/(<button\b)/i, `${consent}$1`);
    }

    return next;
  });

  if (html !== source) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`HTML files: ${htmlFiles.length}`);
console.log(`Forms checked: ${forms}`);
console.log(`Files changed: ${changed}`);

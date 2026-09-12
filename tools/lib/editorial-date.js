// A build is not an editorial update. Only an explicit, visible review sets lastmod.
function editorialDate(main) {
  for(const match of main.matchAll(/<([a-z0-9]+)\b[^>]*data-editorial-review="(\d{4}-\d{2}-\d{2})"[^>]*>([\s\S]*?)<\/\1>/gi)) {
    if(new RegExp(`<time\\b[^>]*datetime="${match[2]}"`).test(match[3])) return match[2];
  }
  const legacy=/data-master4-editorial/.test(main)?main.match(/data-master4-editorial[\s\S]*?<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i)?.[1]:undefined;
  return legacy||main.match(/<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i)?.[1];
}
module.exports={editorialDate};

// A GitHub repository/evidence URL is not a legacy public hosting base.
function hasLegacyHostingReference(html) {
  const legacyDomain = /https?:\/\/(?:emelkey\.github\.io\/Max-saite(?:[/?#"'\s<>]|$)|maxsite\.ua(?=[/?#:"'\s<>]|$))/i;
  const rootRelativeBase = /["'(=\s]\/Max-saite\//;
  const productionBase = /(?:https?:)?\/\/(?:www\.)?maxsite\.com\.ua\/Max-saite\//i;
  return legacyDomain.test(html) || rootRelativeBase.test(html) || productionBase.test(html);
}
module.exports = {hasLegacyHostingReference};

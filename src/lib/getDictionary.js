export async function getDictionary(locale) {
  return import(`./dictionaries/${locale}.json`).then(r => r.default);
}

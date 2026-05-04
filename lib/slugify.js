export function slugify(str = '') {
  return str
    .toString()
    .normalize('NFD')                 // разбиваем é → e + `
    .replace(/[\u0300-\u036f]/g, '')  // убираем диакритику
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // убираем мусор
    .replace(/\s+/g, '-')             // пробел → -
    .replace(/-+/g, '-')              // убираем дубли -
}

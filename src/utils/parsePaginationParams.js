const parseIntSafe = (value, def) => {
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? def : n;
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const parsePaginationParams = (query) => {
  const page = clamp(parseIntSafe(query.page, 1), 1, Number.MAX_SAFE_INTEGER);
  const perPage = clamp(parseIntSafe(query.perPage, 10), 1, 100); // limitujme 1..100
  return { page, perPage };
};

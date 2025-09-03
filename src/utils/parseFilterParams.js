const parseIsFavourite = (val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return undefined;
};

const parseType = (val) => {
  const allowed = ['work', 'home', 'personal'];
  return allowed.includes(val) ? val : undefined;
};

export const parseFilterParams = (query) => {
  const type = parseType(query.type);
  const isFavourite = parseIsFavourite(query.isFavourite);
  return { type, isFavourite };
};

import { SORT_ORDER, CONTACTS_SORTABLE_FIELDS } from '../constants/index.js';

const parseSortOrder = (value) =>
  [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(value) ? value : SORT_ORDER.ASC;

const parseSortBy = (value) =>
  CONTACTS_SORTABLE_FIELDS.includes(value) ? value : 'name';

export const parseSortParams = (query) => {
  const { sortBy, sortOrder } = query || {};
  return {
    sortBy: parseSortBy(sortBy),
    sortOrder: parseSortOrder(sortOrder),
  };
};

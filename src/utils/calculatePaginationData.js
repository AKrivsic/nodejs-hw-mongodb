export const calculatePaginationData = (count, perPage, page) => {
  const totalPages = Math.max(Math.ceil(count / perPage), 1);
  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

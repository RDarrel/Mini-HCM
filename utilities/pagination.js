// utilities/pagination.js

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const getPaginationMeta = ({ page, limit, totalRecords }) => {
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
};

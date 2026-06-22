const handlePagination = (array, page, max) =>
  array.slice((page - 1) * max, max + (page - 1) * max);

export default handlePagination;

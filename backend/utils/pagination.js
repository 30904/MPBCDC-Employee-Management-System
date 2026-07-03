const { sendError } = require('./apiResponse');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse ?page=1&limit=20 from query string.
 */
function parsePagination(query = {}, options = {}) {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;

  const pageRaw = Number.parseInt(query.page, 10);
  const limitRaw = Number.parseInt(query.limit, 10);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;
  let limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : defaultLimit;

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPaginationMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: totalPages > 0 && page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Run a Mongoose query with pagination and return docs + meta.
 */
async function executePaginatedQuery(query, pagination) {
  const { page, limit, skip } = pagination;
  const filter = query.getFilter();
  const model = query.model;

  const [total, docs] = await Promise.all([
    model.countDocuments(filter),
    query.clone().skip(skip).limit(limit).exec(),
  ]);

  return {
    docs,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

function validatePaginationMiddleware(req, res, next) {
  const { page, limit } = req.query;

  if (page !== undefined && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return sendError(res, 'Invalid page. Must be a positive integer', 400, 'INVALID_PAGINATION');
  }

  if (limit !== undefined && (!Number.isInteger(Number(limit)) || Number(limit) < 1)) {
    return sendError(res, 'Invalid limit. Must be a positive integer', 400, 'INVALID_PAGINATION');
  }

  return next();
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  buildPaginationMeta,
  executePaginatedQuery,
  validatePaginationMiddleware,
};

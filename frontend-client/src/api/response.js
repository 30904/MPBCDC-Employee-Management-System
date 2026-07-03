/**
 * Client helpers for the standard API response envelope.
 *
 * Success: { success: true, data: ... }
 * Error:   { success: false, error: "message" }
 */

export function isApiSuccess(body) {
  return body && typeof body === 'object' && body.success === true;
}

export function isApiError(body) {
  return body && typeof body === 'object' && body.success === false;
}

export function unwrapApiData(response) {
  const body = response?.data;

  if (!body || typeof body !== 'object') {
    throw new Error('Invalid API response');
  }

  if (isApiSuccess(body)) {
    return body.data;
  }

  if (isApiError(body)) {
    throw new Error(body.error || 'Request failed');
  }

  throw new Error('Unexpected API response format');
}

export function getApiErrorMessage(error) {
  const body = error?.response?.data;

  if (isApiError(body)) {
    return body.error;
  }

  return error?.message || 'Request failed';
}

/**
 * Unwrap paginated list response.
 * @returns {{ items: Array, pagination: object }}
 */
export function unwrapPaginatedData(response) {
  const body = response?.data;

  if (!body || typeof body !== 'object') {
    throw new Error('Invalid API response');
  }

  if (!isApiSuccess(body)) {
    throw new Error(body.error || 'Request failed');
  }

  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.meta?.pagination ?? null,
  };
}

export function buildPaginationQuery({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  return params.toString();
}

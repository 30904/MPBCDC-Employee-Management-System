/**
 * MPBCDC API conventions — base path and metadata.
 * All REST routes are mounted under API_BASE_PATH.
 */
const API_BASE_PATH = process.env.API_BASE_PATH || '/api';

const API_INFO = {
  name: 'mpbcdc-hrms-api',
  version: '1.0.0',
  basePath: API_BASE_PATH,
  description: 'MPBCDC Employee Management System REST API',
};

module.exports = {
  API_BASE_PATH,
  API_INFO,
};

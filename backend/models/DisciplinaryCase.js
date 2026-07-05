const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');

const DisciplinaryCase = createTenantModel({
  modelName: 'DisciplinaryCase',
  collection: 'disciplinary_cases',
  fields: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MpbcdcEmployee' },
  },
});

module.exports = DisciplinaryCase;

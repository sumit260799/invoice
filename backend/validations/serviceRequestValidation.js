const { celebrate, Joi } = require('celebrate');

const serviceRequestValidationSchema = {
  body: Joi.object({
    quotationNo: Joi.string().required(),
    industryDiv: Joi.string().valid('BCP', 'GCI', 'SEM', 'Mining').required(),
    zone: Joi.string()
      .valid(
        'Zone1',
        'Zone2',
        'Zone3',
        'Zone4',
        'Zone5',
        'Zone6',
        'Zone7',
        'Zone8'
      )
      .required(),
    equipmentSerialNo: Joi.string().required(),
    modelNo: Joi.string().required(),
    customerName: Joi.string().required(),
    billingPlant: Joi.string().required(),
    salesUserOnBehalfOf: Joi.string().allow(null, '').optional(),
    remarks: Joi.string().allow(null, '').optional(),
    // attachments: Joi.array().items(Joi.string()).optional().allow(null), // Validate attachments as an array of strings
  }),
};

// const allocateValidationSchema = {
//   body: Joi.object({
//     serviceRequestId: Joi.string().required(),
//     // quotationNo: Joi.string().required(),
//     // industryDiv: Joi.string().valid('BCP', 'GCI', 'SEM', 'Mining').required(),
//     // zone: Joi.string()
//     //   .valid(
//     //     'Zone1',
//     //     'Zone2',
//     //     'Zone3',
//     //     'Zone4',
//     //     'Zone5',
//     //     'Zone6',
//     //     'Zone7',
//     //     'Zone8'
//     //   )
//     //   .required(),
//     // equipmentSerialNo: Joi.string().required(),
//     // modelNo: Joi.string().required(),
//     // customerName: Joi.string().required(),
//     // billingPlant: Joi.string().required(),
//     // remarks: Joi.string().required(),
//     allocatedTo: Joi.string().email().required(),
//   }),
// };

const getServiceRequestValidation = {
  query: Joi.object({
    serviceRequestId: Joi.string().required(),
  }),
};

module.exports = {
  serviceRequestValidationSchema,
  // allocateValidationSchema,
  getServiceRequestValidation, // Added export for this validation schema
};

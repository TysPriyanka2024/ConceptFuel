const validate = require('validate.js');
const moment = require('moment');
const { ValidationConstants } = require('../helpers');

module.exports = {
  customize: () => {
    validate.extend(validate.validators.datetime, {
      parse: (value) => moment.utc(value),
      format: (value) => moment.utc(value).toISOString()
    });

    validate.validators.inequality = (value, options, key, obj) => {
      try {
        return `${value}` === `${obj[options.attribute]}` ? options.message : null;
      } catch (error) {
        return null;
      }
    };

    validate.validators.eitherEmailOrPhone = (value, options, key, obj) => {
      try {
        if (value) {
          const isEmail = !validate(obj, { [key]: { email: true } });
          const isPhone = !validate(obj, {
            [key]: {
              numericality: { onlyInteger: true },
              length: { is: ValidationConstants.PHONE_NUMBER_LENGTH }
            }
          });
          return isEmail || isPhone ? null : options.message;
        }
        return null;
      } catch (error) {
        return null;
      }
    };
  },
  validate: (values, constraints) => validate(values, constraints),
  isEmail: (value) => !validate({ value }, { value: { email: true } })
};

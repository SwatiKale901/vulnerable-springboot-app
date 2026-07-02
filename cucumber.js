const common = {
  paths: ['features'],
  requireModule: ['ts-node/register'],
  require: ['tests/support/**/*.ts', 'tests/step-definitions/**/*.ts'],
  format: ['progress'],
};

module.exports = {
  default: common,
};

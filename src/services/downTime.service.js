const { downtime } = require("../../models/index");

const downTimeService = {};

downTimeService.getAll = async () => {
  const result = await downtime.findAll();
  return result;
};

module.exports = downTimeService;

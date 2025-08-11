// moduleNameResolver.js
const modulesList = require("../modules/modulesList");
const { modules_actual_name } = require("../modules/modules_names");

const getModuleName = async (url) => {
  const matchingModule = modules_actual_name.find((module) => {
    const apiList = modulesList[module.function_name];
    return apiList.some((api) => url.startsWith(api));
  });

  return matchingModule ? matchingModule.module_name : null;
};

module.exports = { getModuleName };

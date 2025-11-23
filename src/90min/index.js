const fetch90min = require("./fetch90min");
const { getCategories } = require("../../utils/getCategories");

module.exports.NinetyMins = async function () {
  const categories = await getCategories();

  for (let category of categories) {
    await fetch90min(category);
  }
};

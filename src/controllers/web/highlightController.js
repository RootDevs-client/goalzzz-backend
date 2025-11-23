const Highlight = require("../../models/Highlight");

const getAllNHighlights = async ({ page = 1, limit = 10 }) => {
  try {
    // const highlights = await Highlight.find();
    // return {
    //   status: true,
    //   message:
    //     highlights.length === 0
    //       ? "No Highlight found!"
    //       : "Highlight fetched successfully!",
    //   data: highlights,
    // };

    const count = limit;
    const skip = (page - 1) * count;

    const totalHighlight = await Highlight.countDocuments();
    let allHighlight = await Highlight.find().sort({ publish_date: "desc" }).skip(skip).limit(count);
    return {
      status: true,
      message: allHighlight.length === 0 ? "No Highlight found!" : "Highlight fetched successfully!",
      data: allNews,
      allHighlight
    };
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

module.exports = {
  getAllNHighlights
};

const News = require("../../models/News");

const getAllNews = async ({ page = 1, limit = 10 }) => {
  try {
    // const news = await News.find().sort({ position: "asc" });
    // return {
    //   status: true,
    //   message:
    //     news.length === 0 ? "No News found!" : "News fetched successfully!",
    //   data: news,
    // };

    const count = limit;
    const skip = (page - 1) * count;

    const totalNews = await News.countDocuments();
    let allNews = await News.find().sort({ publish_date: "desc" }).skip(skip).limit(count);
    return {
      status: true,
      message: allNews.length === 0 ? "No News found!" : "News fetched successfully!",
      data: allNews,
      totalNews
    };
  } catch (error) {
    console.log("err", error);
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

const getSingleNews = async slug => {
  try {
    const news = await News.findOne({ slug });

    if (news) {
      return {
        status: true,
        message: "News fetched successfully!",
        data: news
      };
    } else {
      return {
        status: false,
        message: "No news found!"
      };
    }
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

module.exports = {
  getAllNews,
  getSingleNews
};

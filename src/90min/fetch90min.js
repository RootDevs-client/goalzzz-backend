const { JSDOM } = require("jsdom");
const News = require("../models/News");
const { getSlugify } = require("../utils");
const GeneralSettings = require("../models/GeneralSetting");

const getDom = async url => {
  let dom = await fetch(url);
  dom = await dom.text();
  dom = new JSDOM(dom);
  dom = dom.window.document;
  return dom;
};

const extractNewsDetails = dom => {
  let news = "";
  const newsBody = dom.getElementsByClassName("wrapper_wfxu5h")[0].children[0].children[0];

  // Remove unnecessary figure element
  const figureElements = newsBody.querySelectorAll("figure");
  figureElements.forEach(figure => {
    figure.parentNode.removeChild(figure);
  });

  const newsParagraphs = newsBody.getElementsByTagName("p");

  for (let i = 0; i < newsParagraphs.length; i++) {
    news += `<p>${newsParagraphs[i].innerHTML}</p>`;
  }

  news = news.replace(/<a[^>]*>(.*?)<\/a>/g, "$1"); // remove <a/> tag

  return news;
};

const fetch90min = async category => {
  try {
    const generalSettings = await GeneralSettings.findOne();

    const currentDate = new Date();
    const targetTimestamp = new Date(currentDate).setDate(currentDate.getDate() - generalSettings?.days_news);
    let currentPage = 1;

    const allNews = [];

    while (true) {
      // exit if url is not from 90min.com
      if (!category?.newsSource?.startsWith("https://www.90min.com/")) return;

      let dom = await getDom(`${category.newsSource}?page=${currentPage}`);

      const articles = dom.getElementsByTagName("article");

      for (let article of articles) {
        let news = {};

        const newsTimestamp = article.getElementsByTagName("time")[0].getAttribute("datetime");

        if (new Date(newsTimestamp) < targetTimestamp || allNews?.length === 60) {
          return allNews;
        }

        news.publish_date = new Date(newsTimestamp).toISOString();

        news.title = article.getElementsByTagName("h3")[0]?.textContent || article.getElementsByTagName("h2")[0]?.textContent;

        const newsLink = article.getElementsByTagName("a")[0].href;
        const newsDetails = await getDom(newsLink);

        news.image = newsDetails.getElementsByTagName("picture")[0].getElementsByTagName("img")[0].src
          ? newsDetails.getElementsByTagName("picture")[0].getElementsByTagName("img")[0].src
          : "https://img.freepik.com/premium-vector/modern-design-concept-no-image-found-design_637684-247.jpg?w=826";
        news.description = extractNewsDetails(newsDetails);
        news.slug = `${getSlugify(news.title)}`;
        // news.source_type = "others";
        // news.source_name = "90min";
        // news.categoryId = category?.id;
        // news.category = category?.gameCategory;
        // news.categoryImage = category?.logo;
        // news.categoryType = category?.type;
        // news.imageType = "url"
        // news.league = category?.name;
        // news.url = newsLink;
        news.status = "1";
        allNews.push(news);
      }

      currentPage++;
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = fetch90min;

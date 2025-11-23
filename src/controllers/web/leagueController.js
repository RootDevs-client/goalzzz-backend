const PopularLeague = require("../../models/PopularLeague");
const { sportMonkslUrl } = require("../../utils/getAxios");

const getTopLeagues = async () => {
  try {
    const leagues = await PopularLeague.find().sort({ position: "asc" });
    return {
      status: true,
      message:
        leagues.length === 0
          ? "No Leagues found!"
          : "Popular Leagues fetched successfully!",
      data: leagues,
    };
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

const getSelectedPointTable = async () => {
  try {
    const league = await PopularLeague.findOne({ show_point_table: 1 });

    const { data: standingsResponse } = await sportMonkslUrl.get(
      `standings/seasons/${league.current_season}?include=details.type;group;participant;rule.type&filters=standingdetailTypes:129,130,131,132,133,134,179,187,135,136,137,138,139,140,185,141,142,143,144,145,146,186`
    );

    const finalData = {
      league_name: league.name,
      league_image: league.image_path,
      standings: standingsResponse.data,
    };

    return {
      status: true,
      message: league
        ? "Selected point table or standings fetched successfully!"
        : "No Leagues found!",
      data: finalData,
    };
  } catch (error) {
    // console.log(error);
    // throw new Error("Failed to get top league data!");
    return {
      status: false,
      message: "Something went wrong!",
    };
  }
};

module.exports = {
  getTopLeagues,
  getSelectedPointTable,
};

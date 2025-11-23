const { generateFlussonicToken } = require("../../helpers/generateFlussonicToken");
const LiveMatch = require("../../models/LiveMatch");

const getAllLiveMatches = async () => {
  try {
    const liveMatches = await LiveMatch.find().sort({ position: "asc" });
    return {
      status: true,
      message: liveMatches.length === 0 ? "No live matches found!" : "Live matches fetched successfully!",
      data: liveMatches
    };
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

const getSingleLiveMatch = async matchInfo => {
  try {
    const { id, publicIP } = matchInfo;

    const liveMatch = await LiveMatch.findOne({ id }).populate("streaming_sources");

    if (liveMatch) {
      await liveMatch?.streaming_sources?.map(streams => {
        if (streams?.stream_type === "root_stream") {
          const rootStreams = streams.root_streams;

          if (rootStreams && rootStreams.length > 0) {
            // Get a random index within the bounds of the array
            const randomIndex = Math.floor(Math.random() * rootStreams.length);

            const randomRootStream = rootStreams[randomIndex];

            const embedCode = generateFlussonicToken(
              randomRootStream?.root_stream_stream_url,
              randomRootStream?.root_stream_stream_key,
              publicIP
            );
            streams.stream_url = embedCode;
          }
        }
      });

      return {
        status: true,
        message: "Live match fetched successfully!",
        data: liveMatch
      };
    } else {
      return {
        status: false,
        message: "No live match found!"
      };
    }
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

module.exports = {
  getAllLiveMatches,
  getSingleLiveMatch
};

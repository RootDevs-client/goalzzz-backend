const moment = require("moment");
const { validationResult } = require("express-validator");
const { createStreaming } = require("../../services/matchServices");
const LiveMatch = require("../../models/LiveMatch");
const Stream = require("../../models/Stream");
const { generateRandomId } = require("../../utils");
const Leagues = require("../../models/League");

async function createMatch(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const matchData = req.body;
    // const match_time = new Date(matchData.time).getTime().toString();
    // const date = moment(matchData.time);
    // const timestamp = date.valueOf() / 1000;

    const streamingData = createStreaming(matchData);

    // const league = await Leagues.findOne({ name: matchData?.league_name });
    // const sportsType = await SportsType.findOne({
    //   id: matchData?.sports_type_id,
    // });

    const newMatch = new LiveMatch({
      ...matchData,
      match_time: matchData.utcTime,
      // league_name: league.name,
      // league_image: league.image,
      sports_type_name: matchData.sports_type_name,
      streaming_sources: [],
    });

    const createdStreams = await Promise.all(
      streamingData.map(async (streamData) => {
        const newStream = new Stream({
          id: generateRandomId(15),
          matchId: newMatch._id,
          match_id: newMatch.id,
          ...streamData,
        });

        newMatch.streaming_sources.push(newStream._id);
        await newStream.save();
        return newStream;
      })
    );

    await newMatch.save();

    return res.status(200).json({
      status: true,
      message: "Match created successfully!",
      data: { match: newMatch, streams: createdStreams },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while creating the match!",
    });
  }
}

async function updateMatch(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const matchId = req.params.matchId;
    const matchData = req.body;

    const existingMatch = await LiveMatch.findOne({ id: matchId });

    if (!existingMatch) {
      return res
        .status(404)
        .json({ status: false, message: "Live Match not found!" });
    }

    await Stream.deleteMany({ match_id: existingMatch.id });

    // const date = moment(matchData.time);
    // const timestamp = date.valueOf() / 1000;
    // const match_time = new Date(matchData.time).getTime().toString();

    // Update match fields
    existingMatch.match_title = matchData.match_title;
    existingMatch.time = matchData.time;
    existingMatch.match_time = matchData.utcTime;
    existingMatch.fixture_id = matchData.fixture_id;

    existingMatch.sports_type = matchData.sports_type;
    existingMatch.sports_type_name = matchData.sports_type_name;
    existingMatch.league_name = matchData.league_name;
    existingMatch.league = matchData.league;
    existingMatch.league_image = matchData.league_image;

    existingMatch.is_hot = matchData.is_hot;
    existingMatch.status = matchData.status;
    existingMatch.team_one_name = matchData.team_one_name;
    existingMatch.team_one_image = matchData.team_one_image;
    existingMatch.team_two_name = matchData.team_two_name;
    existingMatch.team_two_image = matchData.team_two_image;
    existingMatch.streaming_sources = [];

    const streamingData = createStreaming(matchData);

    await Promise.all(
      streamingData.map(async (streamData) => {
        const newStream = new Stream({
          id: generateRandomId(15),
          matchId: existingMatch._id,
          match_id: existingMatch.id,
          ...streamData,
        });

        existingMatch.streaming_sources.push(newStream._id);
        await newStream.save();
        return newStream;
      })
    );

    await existingMatch.save();

    return res.status(200).json({
      status: true,
      message: "Live Match and Streams updated successfully!",
      match: existingMatch,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

// Get Single Match With Stream
async function getMatchWithStreams(req, res, next) {
  try {
    const matchId = req.params.matchId;

    const match = await LiveMatch.findOne({ id: matchId }).populate(
      "streaming_sources"
    );

    if (!match) {
      return res
        .status(404)
        .json({ status: false, message: "Live Match not found!" });
    }

    return res.status(200).json({ status: true, data: match });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getAllMatches(req, res, next) {
  try {
    const matches = await LiveMatch.find()
      .sort({ position: "asc" })
      .populate("streaming_sources");

    return res.status(200).json({ status: true, data: matches });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function deleteMatchWithStreams(req, res, next) {
  try {
    const matchId = req.params.matchId; // Assuming you're passing the match ID as a URL parameter

    const existingMatch = await LiveMatch.findOne({ id: matchId });

    if (!existingMatch) {
      return res
        .status(404)
        .json({ status: false, message: "Live Match not found!" });
    }

    // Delete associated streams
    await Stream.deleteMany({ match_id: matchId });

    // Delete the match
    await LiveMatch.deleteOne({ id: matchId });

    return res.status(200).json({
      status: true,
      message: "Live match deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function sortMatch(req, res, next) {
  try {
    const matchData = req.body;

    await Promise.all(
      matchData.map(async (match) => {
        const liveMatch = await LiveMatch.findById(match._id);
        liveMatch.position = match.position;
        await liveMatch.save();

        return liveMatch;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Live Match Sorted Successfully!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function sortStreamingSource(req, res, next) {
  try {
    const sourceData = req.body;

    await Promise.all(
      sourceData.map(async (source) => {
        const streamSources = await Stream.findByIdAndUpdate(source._id, {
          position: source.position,
        });
        return streamSources;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Stream Source Sorted Successfully!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = {
  createMatch,
  updateMatch,
  getMatchWithStreams,
  getAllMatches,
  deleteMatchWithStreams,
  sortStreamingSource,
  sortMatch,
};

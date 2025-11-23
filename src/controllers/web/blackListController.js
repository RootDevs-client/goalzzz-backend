const moment = require("moment");
const BlackList = require("../../models/BlackList");

const getBlackListEntries = async (req, res, next) => {
  try {
    const blackListEntries = await BlackList.find();
    res.status(200).json(blackListEntries);
  } catch (error) {
    console.error(error);
    next();
  }
};

const getBlackListEntryById = async (req, res, next) => {
  try {
    const blackListEntry = await BlackList.findOne({ ip: req.body.ip });
    if (!blackListEntry) {
      return res.status(404).json({ error: "BlackList entry not found" });
    }
    res.status(200).json(blackListEntry);
  } catch (error) {
    console.error(error);
    next();
  }
};

const createBlackListEntry = async (req, res, next) => {
  try {
    const blackListEntry = new BlackList(req.body);
    await blackListEntry.save();
    res.status(201).json(blackListEntry);
  } catch (error) {
    console.error(error);
    next();
  }
};

const updateBlackListEntry = async (req, res, next) => {
  try {
    const publicIP =
      req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    // Find the user in the BlackList
    let user = await BlackList.findOne({ ip: publicIP });

    // Check if the user exists in the BlackList
    if (!user) {
      // If the user does not exist, create a new guest user
      user = new BlackList({
        ip: publicIP, // Corrected to use the public IP
        role: "guest",
        block_period: 0,
        is_blocked: false,
        pop_up_opened: 0,
        status: 0,
        minutes_watched: 0
      });
    }

    // Increase minutes_watched with every hit
    user.minutes_watched += 1;
    user.pop_up_opened += 1;

    // Check if the user is currently blocked
    if (user.is_blocked && user.block_period > 0) {
      // Check if the blocking period has passed (24 hours)
      const currentTime = moment().unix();
      const isAfter = moment(currentTime, "X").isAfter(moment(user.block_period, "X"));

      if (isAfter) {
        // Unblock the user
        user.is_blocked = false;
        user.block_period = 0;
        user.minutes_watched = 0; // Reset minutes_watched for the next cycle
        user.pop_up_opened = 0; // Reset pop_up_opened for the next cycle

        // Save the updated user in the BlackList
        await user.save();

        return res.json({ message: "User successfully unblocked.", user });
      } else {
        return res.json({ message: "User is still blocked.", user });
      }
    }

    // Check if minutes_watched and pop_up_opened are both 5
    if (user.minutes_watched === 5 && user.pop_up_opened === 5) {
      // Block the user for 24 hours
      user.is_blocked = false;
      user.block_period = moment().add(24, "hours").unix(); // 24 hours in seconds
      user.minutes_watched = 0; // Reset minutes_watched for the next cycle
      user.pop_up_opened = 0; // Reset pop_up_opened for the next cycle
    }

    // Save the updated user in the BlackList
    await user.save();

    res.json({ message: "User updated successfully.", user });
  } catch (error) {
    console.error(error);
    next();
  }
};

// const updateBlackListEntry = async (req, res, next) => {
//   try {
//     const { ip } = req.body;

//     // const publicIP =
//     // req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

//     // Find the user in the BlackList
//     let user = await BlackList.findOne({ ip });

//     // Check if the user exists in the BlackList
//     if (!user) {
//       // If the user does not exist, create a new guest user
//       user = new BlackList({
//         ip,
//         role: "guest",
//         block_period: 0,
//         is_blocked: false,
//         pop_up_opened: 0,
//         status: 0,
//         minutes_watched: 0
//       });
//     }

//     // Increase minutes_watched with every hit
//     user.minutes_watched += 1;
//     user.pop_up_opened += 1;

//     // Check if the user is currently blocked
//     if (user.is_blocked && user.block_period > 0) {
//       // Check if the blocking period has passed (24 hours)
//       const currentTime = moment().unix();

//       const isAfter = moment(currentTime).isAfter(user.block_period);

//       if (isAfter) {
//         // Unblock the user
//         user.is_blocked = false;
//         user.block_period = 0;
//         user.minutes_watched = 0; // Reset minutes_watched for the next cycle
//         user.pop_up_opened = 0; // Reset pop_up_opened for the next cycle

//         // Save the updated user in the BlackList
//         await user.save();

//         return res.json({ message: "User successfully unblocked.", user });
//       } else {
//         return res.status(400).json({ message: "User is still blocked.", user });
//       }
//     }

//     // Check if minutes_watched and pop_up_opened are both 5
//     if (user.minutes_watched === 5 && user.pop_up_opened === 5) {
//       // Block the user for 24 hours
//       user.is_blocked = true;
//       user.block_period = moment().add(20, "s").unix(); // 24 hours in minutes
//       user.minutes_watched = 0; // Reset minutes_watched for the next cycle
//       user.pop_up_opened = 0; // Reset pop_up_opened for the next cycle
//     }

//     // Save the updated user in the BlackList
//     await user.save();

//     res.json({ message: "User updated successfully.", user });
//   } catch (error) {
//     console.error(error);
//     next();
//   }
// };

const deleteBlackListEntry = async (req, res, next) => {
  try {
    const deletedBlackListEntry = await BlackList.findByIdAndDelete(req.params.id);
    if (!deletedBlackListEntry) {
      return res.status(404).json({ error: "BlackList entry not found" });
    }
    res.status(200).json({ message: "BlackList entry deleted successfully" });
  } catch (error) {
    console.error(error);
    next();
  }
};

module.exports = {
  getBlackListEntries,
  getBlackListEntryById,
  createBlackListEntry,
  updateBlackListEntry,
  deleteBlackListEntry
};

Blocked: 1704258422680;
Current: 1704172059536;

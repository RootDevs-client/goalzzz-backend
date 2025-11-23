const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const APP_SECRET = process.env.APP_SECRET;

//Utility functions
module.exports.generateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.generatePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.validatePassword = async (enteredPassword, savedPassword, salt) => {
  return (await this.generatePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.generateSignature = async (payload, expiresIn) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.GenerateTempToken = async data => {
  try {
    return jwt.sign(payload, code, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.generateVerificationToken = async payload => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.CheckOptValidity = async (opt, hashedOtp) => {
  try {
    await bcrypt.compare(opt, hashedOtp, (err, result) => {
      if (err) {
        return false;
      } else {
        return true;
      }
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.IsTimestampSmallerThanTwoMinutesAgo = timestamp => {
  const inputDate = new Date(timestamp);
  const currentTime = new Date();
  const timeDifference = currentTime - inputDate;
  return timeDifference <= 120000;
};

module.exports.validateSignature = async req => {
  try {
    const signature = req.headers.authorization; //Taking auth token from headers
    const payload = await jwt.verify(signature.split(" ")[1], process.env.APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.excludeMany = async (array, keys) => {
  let newArray = [];
  array?.map(item => {
    for (let key of keys) {
      delete item[key];
    }
    newArray.push(item);
  });
  return newArray;
};

module.exports.exclude = (existingApp, keys) => {
  for (let key of keys) {
    delete existingApp[key];
  }
  return existingApp;
};

module.exports.formateData = data => {
  if (data) {
    return data;
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.UpdateObject = (oldObject, newObject) => {
  const newData = Object?.entries(oldObject);
  newData.forEach(item => {
    const key = item[0];
    const value = item[1];

    if (newObject.hasOwnProperty(key)) {
      oldObject[key] = newObject[key];
    }
  });
  return oldObject;
};

module.exports.deleteImagesFromArray = async array => {
  for (const item of array) {
    await deleteImage(item.image_url);
  }
};

module.exports.generateVerificationCode = length => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports.generateRandomId = length => {
  let result = "";
  const characters = "123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports.shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

module.exports.transformErrorsToMap = errors => {
  const errorMap = {};

  errors.forEach(error => {
    const { path, msg } = error;
    errorMap[path] = msg;
  });

  return errorMap;
};

module.exports.getSlugify = inputString => {
  return inputString
    .toString() // Ensure it's a string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word characters (except hyphens)
    .replace(/--+/g, "-"); // Replace multiple hyphens with a single hyphen
};

module.exports.generateUniqueID = length => {
  let counter = 0;

  const generateID = () => {
    // Get current timestamp
    const timestamp = Math.floor(new Date().getTime() / 1000);

    // Generate a random string of letters and numbers
    const randomString = Array.from({ length: 16 }, () => Math.random().toString(36).charAt(2)).join("");

    // Use a counter to ensure uniqueness
    const uniqueID = `${timestamp}${randomString}${counter}`;

    // Increment the counter to ensure the next ID is different
    counter++;

    return uniqueID.substring(0, length); // Ensure the length is exactly 32 characters
  };

  return generateID;
};

module.exports.formatDate = date => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

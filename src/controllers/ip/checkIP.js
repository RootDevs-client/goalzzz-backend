const os = require("os");

const getPublicIP = (req) => {
  const publicIP =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  return publicIP;
};

const getMacAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  const firstInterface = networkInterfaces[Object.keys(networkInterfaces)[0]];

  if (firstInterface && firstInterface.length > 0) {
    // Get the MAC address of the first network interface
    return firstInterface[0].mac;
  } else {
    return null;
  }
};

const ipHandler = async (req, res) => {
  const publicIP = getPublicIP(req);
  res.status(200).json({ ip: publicIP });
};

const ipHandlerV2 = async (req, res) => {
  const macAddress = getMacAddress();
  const networkInterfaces = os.networkInterfaces();

  if (macAddress) {
    res.status(200).json({ macAddress, networkInterfaces });
  } else {
    res.status(400).json({ error: "MAC address not found" });
  }
};

module.exports = {
  ipHandler,
  ipHandlerV2,
};

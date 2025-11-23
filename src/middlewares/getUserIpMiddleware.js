const getUserIpMiddleware = (req, res, next) => {
  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  req.userIp = userIp;
  next();
};
module.exports = getUserIpMiddleware;

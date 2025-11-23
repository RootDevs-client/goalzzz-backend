const STAR_GAMEZ_UNSUB_API = process.env.STAR_GAMEZ_UNSUB_API;
const START_GAMEZ_REGISTER_API = process.env.START_GAMEZ_REGISTER_API;
const STAR_GAMEZ_SUB_EXTENDING_API = process.env.STAR_GAMEZ_SUB_EXTENDING_API;

async function registerUserToStarGame({ phone, password, plan, expDate }) {
  try {
    const data = {
      MobileNumber: phone,
      Password: password,
      MembershipPlan: plan,
      ModeOfActivation: "SMS Platform",
      ExpiryDate: expDate,
      Platform: "XoomSports"
    };
    const res = await await fetch(START_GAMEZ_REGISTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    console.log("=> Register Request sent to StarGamez ", {
      status: res.status,
      statusText: res.statusText
    });
    return res;
  } catch (err) {
    console.log("=> Failed to send Register Request to StarGamez", {
      reason: err.message
    });
    throw new Error("Failed to register user");
  }
}

async function extendUserSubscriptionToStarGame({ phone, expDate }) {
  try {
    const data = {
      MobileNumber: phone,
      ExpiryDate: expDate,
      Platform: "XoomSports"
    };
    const res = await await fetch(STAR_GAMEZ_SUB_EXTENDING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    console.log("=> Subscription extending Request sent to StarGamez ", {
      status: res.status,
      statusText: res.statusText
    });
    return res;
  } catch (err) {
    console.log("=> Failed to send Extending Request to StarGamez", {
      reason: err.message
    });
    throw new Error("Failed to extend user subscription");
  }
}

async function unsubscribeUserFromStarGame({ phone, reference }) {
  try {
    const url = `${STAR_GAMEZ_UNSUB_API}?mobilenumber=${phone}&reference=${reference || "0000000"}&Platform=XoomSports`;

    const response = await fetch(url);
    console.log("=> Unregister Request sent to StarGamez", {
      requestUrl: url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  } catch (err) {
    console.log("=> Failed to send Unregister Request to StarGamez", {
      reason: err.message
    });
    throw new Error("Failed to unsubscribe user");
  }
}

module.exports = {
  registerUserToStarGame,
  extendUserSubscriptionToStarGame,
  unsubscribeUserFromStarGame
};

const accessController = async (req, res) => {
  try {
    const response = await fetch('https://portalapis.vclipss.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accessCode: req.body.accessCode })
    });
    const data = await response.text();
    console.log({ data });

    if (data === 'Success') {
      return res.send({ status: true });
    } else {
      return res.send({ status: false });
    }
  } catch (error) {
    return res.send({ status: false });
  }
};

module.exports = accessController;

const validKeys = (data) => {
  return (list) =>
    list
      .map((it) => {
        const key = data[it];
        return key ? false : `You need sumbit '${it}' data.`;
      })
      .filter((it) => it);
};

module.exports = {
  validKeys
};

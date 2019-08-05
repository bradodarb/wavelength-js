const humanJoin = (list) => {
  if (!list || !Array.isArray(list)) {
    throw new Error('the first argument must be of type Array');
  }
  if (list.length >= 2) {
    const [last] = list.slice(-1);
    const other = list.slice(0, -1);
    return `${other.join(', ')} and ${last}`;
  }
  return list.join('');
};

module.exports = humanJoin;

//shuffle Array
const shuffle = (array, count) => {
  const baseCount = count > array.length ? array.length : count;

  const shuffledArray = array.sort(() => 0.5 - Math.random());

  return shuffledArray.slice(0, baseCount);
};
export default shuffle;

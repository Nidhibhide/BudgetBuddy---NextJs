const expireTime = () => {
  const time = new Date();
  time.setMinutes(time.getMinutes() + 5); // expires in 5 mins
  return time;
};

export default expireTime;

const shiftUtility = {};

shiftUtility.convertTimeToRange = (time) => {
  const [hour] = time.split(':');
  let currentHour = parseInt(hour);

  // Handle the case where the input hour is "24"
  if (currentHour === 24) {
    currentHour = 0;
  }
  let nextHour = (currentHour + 1) % 24; // Ensures the hour wraps around at 23

  // Format the hours for 12-hour clock with leading zeros
  const currentHour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
  const nextHour12 = nextHour % 12 === 0 ? 12 : nextHour % 12;

  const currentHourString = currentHour12.toString().padStart(2, '0');
  const nextHourString = nextHour12.toString().padStart(2, '0');

  return `${currentHourString} - ${nextHourString}`;
};

module.exports = shiftUtility;

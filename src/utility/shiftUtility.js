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

shiftUtility.convertTimeTo12HourFormat = (time24) => {
  // Split the time string into hours, minutes, and seconds
  let [hours, minutes] = time24.split(':');

  // Convert hours to integer
  hours = parseInt(hours, 10);

  // Determine if it's AM or PM
  let period = hours >= 12 ? 'pm' : 'am';

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12;

  // Handle midnight (00:00) and noon (12:00) edge cases
  hours = hours ? hours : 12; // 0 should be converted to 12

  // Format the time in 12-hour format
  let time12 = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;

  return time12;
};

module.exports = shiftUtility;

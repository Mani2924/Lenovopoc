const todayFirstShift = {
  shift: '1st',
  startTime: '09:00:00',
  endTime: '15:00:00',
  condition: 'AND',
  duration: '6hrs',
};

const todaySecondShift = {
  shift: '2nd',
  startTime: '15:00:00',
  endTime: '21:00:00',
  condition: 'AND',
  duration: '6hrs',
};

const todayGenaralShift = {
  shift: 'general',
  startTime: '09:00:00',
  endTime: '18:00:00',
  condition: 'AND',
  duration: '8hrs',
};

const yesterdayFirstShift = {
  shift: '1st',
  startTime: '21:00:00',
  endTime: '03:00:00',
  condition: 'OR',
  duration: '6hrs',
};

const yesterdaySecondShift = {
  shift: '2nd',
  startTime: '03:00:00',
  endTime: '09:00:00',
  condition: 'AND',
  duration: '6hrs',
};

const yesterdayGenaralShift = {
  shift: 'general',
  startTime: '21:00:00',
  endTime: '06:00:00',
  condition: 'OR',
  duration: '8hrs',
};

// const shiftDuration = {};
const shiftDetails = {
  firstShift: '1st',
  secondShift: '2nd',
  generalShift: 'general',
  shiftDuration: '6hrs',
  generalShiftDuration: '8hrs',
};

const firstShift = {
  shift: '1st',
  startTime: '09:00:00',
  endTime: '18:00:00',
  condition: 'AND',
  duration: '9hrs',
};

const secondShift = {
  shift: '2nd',
  startTime: '21:00:00',
  endTime: '06:00:00',
  condition: 'AND',
  duration: '9hrs',
};

module.exports = {
  todayFirstShift,
  todaySecondShift,
  todayGenaralShift,
  yesterdayFirstShift,
  yesterdaySecondShift,
  yesterdayGenaralShift,
  //   shiftDuration,
  shiftDetails,
  firstShift,
  secondShift,
};

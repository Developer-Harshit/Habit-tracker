export function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

const second_in_ms = 1000;
const minute_in_ms = second_in_ms * 60;
const hour_in_ms = minute_in_ms * 60;
const day_in_ms = hour_in_ms * 24;

export function parseMS(time_ms) {
  console.log(second_in_ms, minute_in_ms, hour_in_ms, day_in_ms, time_ms);
  if (time_ms < second_in_ms) {
    return Math.floor(time_ms) + "ms";
  } else if (time_ms < minute_in_ms) {
    return Math.floor(time_ms / second_in_ms) + " sec";
  } else if (time_ms < hour_in_ms) {
    return Math.floor(time_ms / minute_in_ms) + " mins";
  } else if (time_ms < day_in_ms) {
    return Math.floor(time_ms / hour_in_ms) + " hours";
  } else {
    return Math.floor(time_ms / day_in_ms) + " days";
  }
}
export function generateID() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

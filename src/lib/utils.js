import { nanoid } from "nanoid";

export function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

const second_in_ms = 1000;
const minute_in_ms = 60000;
const hour_in_ms = 3600000;
export const day_in_ms = 86400000;

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
export function generateID(type = "") {
  return type + nanoid();
}
export function isValidHex(color) {
  if (!color || typeof color !== "string") return false;

  // Validate hex values
  if (color.substring(0, 1) === "#") color = color.substring(1);

  switch (color.length) {
    case 3:
      return /^[0-9A-F]{3}$/i.test(color);
    case 6:
      return /^[0-9A-F]{6}$/i.test(color);
    case 8:
      return /^[0-9A-F]{8}$/i.test(color);
    default:
      return false;
  }

  return false;
}

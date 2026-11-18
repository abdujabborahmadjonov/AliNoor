"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// mcp/handlers.ts
var handlers_exports = {};
__export(handlers_exports, {
  mcp: () => handler,
  oauthAuthorize: () => handler4,
  oauthComplete: () => handler6,
  oauthMetadata: () => handler2,
  oauthRegister: () => handler3,
  oauthToken: () => handler5
});
module.exports = __toCommonJS(handlers_exports);

// mcp/http/mcp.ts
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var import_supabase_js = require("@supabase/supabase-js");

// mcp/tools.ts
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_zod = require("zod");

// lib/cities.ts
var CITIES = [
  { name: "Tashkent", country: "Uzbekistan", lat: 41.31, lng: 69.28, tz: "Asia/Tashkent", aliases: ["Toshkent"] },
  { name: "Samarkand", country: "Uzbekistan", lat: 39.65, lng: 66.96, tz: "Asia/Samarkand", aliases: ["Samarqand"] },
  { name: "Bukhara", country: "Uzbekistan", lat: 39.77, lng: 64.42, tz: "Asia/Samarkand", aliases: ["Buxoro"] },
  { name: "Namangan", country: "Uzbekistan", lat: 41, lng: 71.67, tz: "Asia/Tashkent" },
  { name: "Andijan", country: "Uzbekistan", lat: 40.78, lng: 72.34, tz: "Asia/Tashkent", aliases: ["Andijon"] },
  { name: "Fergana", country: "Uzbekistan", lat: 40.39, lng: 71.78, tz: "Asia/Tashkent", aliases: ["Farg'ona", "Ferghana"] },
  { name: "Nukus", country: "Uzbekistan", lat: 42.46, lng: 59.6, tz: "Asia/Samarkand" },
  { name: "Edmonton", country: "Canada", lat: 53.55, lng: -113.49, tz: "America/Edmonton" },
  { name: "Calgary", country: "Canada", lat: 51.05, lng: -114.07, tz: "America/Edmonton" },
  { name: "Toronto", country: "Canada", lat: 43.65, lng: -79.38, tz: "America/Toronto" },
  { name: "Vancouver", country: "Canada", lat: 49.28, lng: -123.12, tz: "America/Vancouver" },
  { name: "Montreal", country: "Canada", lat: 45.5, lng: -73.57, tz: "America/Toronto" },
  { name: "Ottawa", country: "Canada", lat: 45.42, lng: -75.7, tz: "America/Toronto" },
  { name: "Winnipeg", country: "Canada", lat: 49.9, lng: -97.14, tz: "America/Winnipeg" },
  { name: "Halifax", country: "Canada", lat: 44.65, lng: -63.57, tz: "America/Halifax" },
  { name: "Makkah", country: "Saudi Arabia", lat: 21.42, lng: 39.83, tz: "Asia/Riyadh", aliases: ["Mecca"] },
  { name: "Madinah", country: "Saudi Arabia", lat: 24.47, lng: 39.61, tz: "Asia/Riyadh", aliases: ["Medina"] },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.71, lng: 46.68, tz: "Asia/Riyadh" },
  { name: "Jeddah", country: "Saudi Arabia", lat: 21.49, lng: 39.19, tz: "Asia/Riyadh", aliases: ["Jiddah"] },
  { name: "Istanbul", country: "T\xFCrkiye", lat: 41.01, lng: 28.98, tz: "Europe/Istanbul" },
  { name: "Ankara", country: "T\xFCrkiye", lat: 39.93, lng: 32.86, tz: "Europe/Istanbul" },
  { name: "Dubai", country: "UAE", lat: 25.2, lng: 55.27, tz: "Asia/Dubai" },
  { name: "Abu Dhabi", country: "UAE", lat: 24.45, lng: 54.38, tz: "Asia/Dubai" },
  { name: "Doha", country: "Qatar", lat: 25.29, lng: 51.53, tz: "Asia/Qatar" },
  { name: "Kuwait City", country: "Kuwait", lat: 29.38, lng: 47.98, tz: "Asia/Kuwait" },
  { name: "Manama", country: "Bahrain", lat: 26.23, lng: 50.59, tz: "Asia/Bahrain" },
  { name: "Muscat", country: "Oman", lat: 23.59, lng: 58.41, tz: "Asia/Muscat" },
  { name: "Amman", country: "Jordan", lat: 31.95, lng: 35.93, tz: "Asia/Amman" },
  { name: "Beirut", country: "Lebanon", lat: 33.89, lng: 35.5, tz: "Asia/Beirut" },
  { name: "Damascus", country: "Syria", lat: 33.51, lng: 36.28, tz: "Asia/Damascus" },
  { name: "Baghdad", country: "Iraq", lat: 33.31, lng: 44.37, tz: "Asia/Baghdad" },
  { name: "Tehran", country: "Iran", lat: 35.69, lng: 51.39, tz: "Asia/Tehran" },
  { name: "Cairo", country: "Egypt", lat: 30.04, lng: 31.24, tz: "Africa/Cairo" },
  { name: "Casablanca", country: "Morocco", lat: 33.57, lng: -7.59, tz: "Africa/Casablanca" },
  { name: "Algiers", country: "Algeria", lat: 36.75, lng: 3.06, tz: "Africa/Algiers" },
  { name: "Tunis", country: "Tunisia", lat: 36.81, lng: 10.18, tz: "Africa/Tunis" },
  { name: "Khartoum", country: "Sudan", lat: 15.5, lng: 32.56, tz: "Africa/Khartoum" },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.03, lng: 38.74, tz: "Africa/Addis_Ababa" },
  { name: "Mogadishu", country: "Somalia", lat: 2.05, lng: 45.32, tz: "Africa/Mogadishu" },
  { name: "Nairobi", country: "Kenya", lat: -1.29, lng: 36.82, tz: "Africa/Nairobi" },
  { name: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.38, tz: "Africa/Lagos" },
  { name: "Dakar", country: "Senegal", lat: 14.72, lng: -17.47, tz: "Africa/Dakar" },
  { name: "Johannesburg", country: "South Africa", lat: -26.2, lng: 28.05, tz: "Africa/Johannesburg" },
  { name: "Cape Town", country: "South Africa", lat: -33.92, lng: 18.42, tz: "Africa/Johannesburg" },
  { name: "London", country: "UK", lat: 51.51, lng: -0.13, tz: "Europe/London" },
  { name: "Birmingham", country: "UK", lat: 52.49, lng: -1.89, tz: "Europe/London" },
  { name: "Paris", country: "France", lat: 48.86, lng: 2.35, tz: "Europe/Paris" },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.4, tz: "Europe/Berlin" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.37, lng: 4.9, tz: "Europe/Amsterdam" },
  { name: "Brussels", country: "Belgium", lat: 50.85, lng: 4.35, tz: "Europe/Brussels" },
  { name: "Madrid", country: "Spain", lat: 40.42, lng: -3.7, tz: "Europe/Madrid" },
  { name: "Rome", country: "Italy", lat: 41.9, lng: 12.5, tz: "Europe/Rome" },
  { name: "Vienna", country: "Austria", lat: 48.21, lng: 16.37, tz: "Europe/Vienna" },
  { name: "Stockholm", country: "Sweden", lat: 59.33, lng: 18.07, tz: "Europe/Stockholm" },
  { name: "Sarajevo", country: "Bosnia and Herzegovina", lat: 43.86, lng: 18.41, tz: "Europe/Sarajevo" },
  { name: "Moscow", country: "Russia", lat: 55.76, lng: 37.62, tz: "Europe/Moscow" },
  { name: "Kazan", country: "Russia", lat: 55.79, lng: 49.12, tz: "Europe/Moscow" },
  { name: "New York", country: "USA", lat: 40.71, lng: -74.01, tz: "America/New_York", aliases: ["NYC"] },
  { name: "Washington DC", country: "USA", lat: 38.91, lng: -77.04, tz: "America/New_York" },
  { name: "Detroit", country: "USA", lat: 42.33, lng: -83.05, tz: "America/Detroit" },
  { name: "Chicago", country: "USA", lat: 41.88, lng: -87.63, tz: "America/Chicago" },
  { name: "Houston", country: "USA", lat: 29.76, lng: -95.37, tz: "America/Chicago" },
  { name: "Dallas", country: "USA", lat: 32.78, lng: -96.8, tz: "America/Chicago" },
  { name: "Denver", country: "USA", lat: 39.74, lng: -104.99, tz: "America/Denver" },
  { name: "Phoenix", country: "USA", lat: 33.45, lng: -112.07, tz: "America/Phoenix" },
  { name: "Los Angeles", country: "USA", lat: 34.05, lng: -118.24, tz: "America/Los_Angeles", aliases: ["LA"] },
  { name: "San Francisco", country: "USA", lat: 37.77, lng: -122.42, tz: "America/Los_Angeles" },
  { name: "Mexico City", country: "Mexico", lat: 19.43, lng: -99.13, tz: "America/Mexico_City" },
  { name: "S\xE3o Paulo", country: "Brazil", lat: -23.55, lng: -46.63, tz: "America/Sao_Paulo" },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6, lng: -58.38, tz: "America/Argentina/Buenos_Aires" },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.14, lng: 101.69, tz: "Asia/Kuala_Lumpur", aliases: ["KL"] },
  { name: "Singapore", country: "Singapore", lat: 1.35, lng: 103.82, tz: "Asia/Singapore" },
  { name: "Jakarta", country: "Indonesia", lat: -6.21, lng: 106.85, tz: "Asia/Jakarta" },
  { name: "Surabaya", country: "Indonesia", lat: -7.25, lng: 112.75, tz: "Asia/Jakarta" },
  { name: "Makassar", country: "Indonesia", lat: -5.15, lng: 119.43, tz: "Asia/Makassar" },
  { name: "Bandar Seri Begawan", country: "Brunei", lat: 4.89, lng: 114.94, tz: "Asia/Brunei" },
  { name: "Bangkok", country: "Thailand", lat: 13.76, lng: 100.5, tz: "Asia/Bangkok" },
  { name: "Manila", country: "Philippines", lat: 14.6, lng: 120.98, tz: "Asia/Manila" },
  { name: "Hong Kong", country: "Hong Kong SAR", lat: 22.32, lng: 114.17, tz: "Asia/Hong_Kong", aliases: ["HK"] },
  { name: "Macau", country: "Macau SAR", lat: 22.2, lng: 113.54, tz: "Asia/Macau", aliases: ["Macao"] },
  { name: "Guangzhou", country: "China", lat: 23.13, lng: 113.26, tz: "Asia/Shanghai", aliases: ["Canton"] },
  { name: "Shanghai", country: "China", lat: 31.23, lng: 121.47, tz: "Asia/Shanghai" },
  { name: "Beijing", country: "China", lat: 39.9, lng: 116.41, tz: "Asia/Shanghai", aliases: ["Peking"] },
  { name: "Taipei", country: "Taiwan", lat: 25.03, lng: 121.57, tz: "Asia/Taipei" },
  { name: "Seoul", country: "South Korea", lat: 37.57, lng: 126.98, tz: "Asia/Seoul" },
  { name: "Tokyo", country: "Japan", lat: 35.68, lng: 139.69, tz: "Asia/Tokyo" },
  { name: "Perth", country: "Australia", lat: -31.95, lng: 115.86, tz: "Australia/Perth" },
  { name: "Melbourne", country: "Australia", lat: -37.81, lng: 144.96, tz: "Australia/Melbourne" },
  { name: "Sydney", country: "Australia", lat: -33.87, lng: 151.21, tz: "Australia/Sydney" },
  { name: "Auckland", country: "New Zealand", lat: -36.85, lng: 174.76, tz: "Pacific/Auckland" },
  { name: "Karachi", country: "Pakistan", lat: 24.86, lng: 67.01, tz: "Asia/Karachi" },
  { name: "Lahore", country: "Pakistan", lat: 31.55, lng: 74.34, tz: "Asia/Karachi" },
  { name: "Islamabad", country: "Pakistan", lat: 33.68, lng: 73.05, tz: "Asia/Karachi" },
  { name: "Kabul", country: "Afghanistan", lat: 34.53, lng: 69.17, tz: "Asia/Kabul" },
  { name: "Delhi", country: "India", lat: 28.61, lng: 77.21, tz: "Asia/Kolkata", aliases: ["New Delhi"] },
  { name: "Mumbai", country: "India", lat: 19.08, lng: 72.88, tz: "Asia/Kolkata", aliases: ["Bombay"] },
  { name: "Dhaka", country: "Bangladesh", lat: 23.81, lng: 90.41, tz: "Asia/Dhaka" },
  { name: "Kathmandu", country: "Nepal", lat: 27.72, lng: 85.32, tz: "Asia/Kathmandu" },
  { name: "Colombo", country: "Sri Lanka", lat: 6.93, lng: 79.86, tz: "Asia/Colombo" },
  { name: "Mal\xE9", country: "Maldives", lat: 4.18, lng: 73.51, tz: "Indian/Maldives" },
  { name: "Almaty", country: "Kazakhstan", lat: 43.24, lng: 76.89, tz: "Asia/Almaty" },
  { name: "Astana", country: "Kazakhstan", lat: 51.17, lng: 71.45, tz: "Asia/Almaty", aliases: ["Nur-Sultan"] },
  { name: "Bishkek", country: "Kyrgyzstan", lat: 42.87, lng: 74.59, tz: "Asia/Bishkek" },
  { name: "Dushanbe", country: "Tajikistan", lat: 38.56, lng: 68.79, tz: "Asia/Dushanbe" },
  { name: "Ashgabat", country: "Turkmenistan", lat: 37.95, lng: 58.38, tz: "Asia/Ashgabat" },
  { name: "Baku", country: "Azerbaijan", lat: 40.41, lng: 49.87, tz: "Asia/Baku" }
];
var findCity = (name) => CITIES.find((c) => c.name === name) || CITIES[0];
var COUNTRY_ALIASES = {
  UAE: ["United Arab Emirates", "Emirates"],
  UK: ["United Kingdom", "England", "Britain"],
  USA: ["United States", "America"],
  T\u00FCrkiye: ["Turkey"],
  "Hong Kong SAR": ["China"],
  "Macau SAR": ["China"]
};
var norm = (s) => {
  let out = s;
  try {
    out = out.normalize("NFD").replace(/[̀-ͯ]/g, "");
  } catch {
  }
  return out.toLowerCase().replace(/['’ʻ`]/g, "").replace(/[_/,]+/g, " ").replace(/\s+/g, " ").trim();
};
var NAMES = new Map(
  CITIES.map((c) => [c.name, [c.name, ...c.aliases || []].map(norm)])
);
var HAYSTACKS = new Map(
  CITIES.map((c) => [
    c.name,
    [
      ...NAMES.get(c.name),
      norm(c.country),
      ...(COUNTRY_ALIASES[c.country] || []).map(norm),
      norm(c.tz)
    ].join(" | ")
  ])
);

// lib/dates.ts
var dateInTz = (tz, d = /* @__PURE__ */ new Date()) => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return fmt.format(d);
};
var addDays = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};

// lib/day-start.ts
var dayStart = (settings) => settings.dayStart === "maghrib" ? "maghrib" : "midnight";
var anchorOrder = (settings) => dayStart(settings) === "maghrib" ? ["Maghrib", "Isha", "Fajr", "Dhuhr", "Asr"] : ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
var dayRule = (settings) => dayStart(settings) === "maghrib" ? `The user's day runs from Maghrib to Maghrib, as the Islamic day does, and is named by the date it ends on: the tasks "after Maghrib" and "after Isha" for 2026-03-10 happen on the evening of 2026-03-09.` : `The user's day is the calendar day, 00:00 to 23:59: the tasks "after Maghrib" and "after Isha" for 2026-03-10 happen on the evening of 2026-03-10.`;

// node_modules/adhan/lib/esm/Madhab.js
var Madhab = {
  Shafi: "shafi",
  Hanafi: "hanafi"
};
function shadowLength(madhab) {
  switch (madhab) {
    case Madhab.Shafi:
      return 1;
    case Madhab.Hanafi:
      return 2;
    default:
      throw "Invalid Madhab";
  }
}

// node_modules/adhan/lib/esm/HighLatitudeRule.js
var HighLatitudeRule = {
  MiddleOfTheNight: "middleofthenight",
  SeventhOfTheNight: "seventhofthenight",
  TwilightAngle: "twilightangle",
  recommended(coordinates) {
    if (coordinates.latitude > 48) {
      return HighLatitudeRule.SeventhOfTheNight;
    } else {
      return HighLatitudeRule.MiddleOfTheNight;
    }
  }
};
var HighLatitudeRule_default = HighLatitudeRule;

// node_modules/adhan/lib/esm/Coordinates.js
var Coordinates = class {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
};

// node_modules/adhan/lib/esm/Rounding.js
var Rounding = {
  Nearest: "nearest",
  Up: "up",
  None: "none"
};

// node_modules/adhan/lib/esm/DateUtils.js
function dateByAddingDays(date, days) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate() + days;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return new Date(year, month, day, hours, minutes, seconds);
}
function dateByAddingMinutes(date, minutes) {
  return dateByAddingSeconds(date, minutes * 60);
}
function dateByAddingSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1e3);
}
function roundedMinute(date, rounding = Rounding.Nearest) {
  const seconds = date.getUTCSeconds();
  let offset = seconds >= 30 ? 60 - seconds : -1 * seconds;
  if (rounding === Rounding.Up) {
    offset = 60 - seconds;
  } else if (rounding === Rounding.None) {
    offset = 0;
  }
  return dateByAddingSeconds(date, offset);
}
function isLeapYear(year) {
  if (year % 4 !== 0) {
    return false;
  }
  if (year % 100 === 0 && year % 400 !== 0) {
    return false;
  }
  return true;
}
function dayOfYear(date) {
  let returnedDayOfYear = 0;
  const feb = isLeapYear(date.getFullYear()) ? 29 : 28;
  const months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let i = 0; i < date.getMonth(); i++) {
    returnedDayOfYear += months[i];
  }
  returnedDayOfYear += date.getDate();
  return returnedDayOfYear;
}
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.valueOf());
}

// node_modules/adhan/lib/esm/MathUtils.js
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}
function normalizeToScale(num, max) {
  return num - max * Math.floor(num / max);
}
function unwindAngle(angle) {
  return normalizeToScale(angle, 360);
}
function quadrantShiftAngle(angle) {
  if (angle >= -180 && angle <= 180) {
    return angle;
  }
  return angle - 360 * Math.round(angle / 360);
}

// node_modules/adhan/lib/esm/Shafaq.js
var Shafaq = {
  // General is a combination of Ahmer and Abyad.
  General: "general",
  // Ahmer means the twilight is the red glow in the sky. Used by the Shafi, Maliki, and Hanbali madhabs.
  Ahmer: "ahmer",
  // Abyad means the twilight is the white glow in the sky. Used by the Hanafi madhab.
  Abyad: "abyad"
};

// node_modules/adhan/lib/esm/Astronomical.js
var Astronomical = {
  /* The geometric mean longitude of the sun in degrees. */
  meanSolarLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 280.4664567;
    const term2 = 36000.76983 * T;
    const term3 = 3032e-7 * Math.pow(T, 2);
    const L0 = term1 + term2 + term3;
    return unwindAngle(L0);
  },
  /* The geometric mean longitude of the moon in degrees. */
  meanLunarLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 218.3165;
    const term2 = 481267.8813 * T;
    const Lp = term1 + term2;
    return unwindAngle(Lp);
  },
  ascendingLunarNodeLongitude(julianCentury) {
    const T = julianCentury;
    const term1 = 125.04452;
    const term2 = 1934.136261 * T;
    const term3 = 20708e-7 * Math.pow(T, 2);
    const term4 = Math.pow(T, 3) / 45e4;
    const Omega = term1 - term2 + term3 + term4;
    return unwindAngle(Omega);
  },
  /* The mean anomaly of the sun. */
  meanSolarAnomaly(julianCentury) {
    const T = julianCentury;
    const term1 = 357.52911;
    const term2 = 35999.05029 * T;
    const term3 = 1537e-7 * Math.pow(T, 2);
    const M = term1 + term2 - term3;
    return unwindAngle(M);
  },
  /* The Sun's equation of the center in degrees. */
  solarEquationOfTheCenter(julianCentury, meanAnomaly) {
    const T = julianCentury;
    const Mrad = degreesToRadians(meanAnomaly);
    const term1 = (1.914602 - 4817e-6 * T - 14e-6 * Math.pow(T, 2)) * Math.sin(Mrad);
    const term2 = (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad);
    const term3 = 289e-6 * Math.sin(3 * Mrad);
    return term1 + term2 + term3;
  },
  /* The apparent longitude of the Sun, referred to the
        true equinox of the date. */
  apparentSolarLongitude(julianCentury, meanLongitude) {
    const T = julianCentury;
    const L0 = meanLongitude;
    const longitude = L0 + Astronomical.solarEquationOfTheCenter(T, Astronomical.meanSolarAnomaly(T));
    const Omega = 125.04 - 1934.136 * T;
    const Lambda = longitude - 569e-5 - 478e-5 * Math.sin(degreesToRadians(Omega));
    return unwindAngle(Lambda);
  },
  /* The mean obliquity of the ecliptic, formula
        adopted by the International Astronomical Union.
        Represented in degrees. */
  meanObliquityOfTheEcliptic(julianCentury) {
    const T = julianCentury;
    const term1 = 23.439291;
    const term2 = 0.013004167 * T;
    const term3 = 1639e-10 * Math.pow(T, 2);
    const term4 = 5036e-10 * Math.pow(T, 3);
    return term1 - term2 - term3 + term4;
  },
  /* The mean obliquity of the ecliptic, corrected for
        calculating the apparent position of the sun, in degrees. */
  apparentObliquityOfTheEcliptic(julianCentury, meanObliquityOfTheEcliptic) {
    const T = julianCentury;
    const Epsilon0 = meanObliquityOfTheEcliptic;
    const O = 125.04 - 1934.136 * T;
    return Epsilon0 + 256e-5 * Math.cos(degreesToRadians(O));
  },
  /* Mean sidereal time, the hour angle of the vernal equinox, in degrees. */
  meanSiderealTime(julianCentury) {
    const T = julianCentury;
    const JD = T * 36525 + 2451545;
    const term1 = 280.46061837;
    const term2 = 360.98564736629 * (JD - 2451545);
    const term3 = 387933e-9 * Math.pow(T, 2);
    const term4 = Math.pow(T, 3) / 3871e4;
    const Theta = term1 + term2 + term3 - term4;
    return unwindAngle(Theta);
  },
  nutationInLongitude(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
    const L0 = solarLongitude;
    const Lp = lunarLongitude;
    const Omega = ascendingNode;
    const term1 = -17.2 / 3600 * Math.sin(degreesToRadians(Omega));
    const term2 = 1.32 / 3600 * Math.sin(2 * degreesToRadians(L0));
    const term3 = 0.23 / 3600 * Math.sin(2 * degreesToRadians(Lp));
    const term4 = 0.21 / 3600 * Math.sin(2 * degreesToRadians(Omega));
    return term1 - term2 - term3 + term4;
  },
  nutationInObliquity(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
    const L0 = solarLongitude;
    const Lp = lunarLongitude;
    const Omega = ascendingNode;
    const term1 = 9.2 / 3600 * Math.cos(degreesToRadians(Omega));
    const term2 = 0.57 / 3600 * Math.cos(2 * degreesToRadians(L0));
    const term3 = 0.1 / 3600 * Math.cos(2 * degreesToRadians(Lp));
    const term4 = 0.09 / 3600 * Math.cos(2 * degreesToRadians(Omega));
    return term1 + term2 + term3 - term4;
  },
  altitudeOfCelestialBody(observerLatitude, declination, localHourAngle) {
    const Phi = observerLatitude;
    const delta = declination;
    const H = localHourAngle;
    const term1 = Math.sin(degreesToRadians(Phi)) * Math.sin(degreesToRadians(delta));
    const term2 = Math.cos(degreesToRadians(Phi)) * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(H));
    return radiansToDegrees(Math.asin(term1 + term2));
  },
  approximateTransit(longitude, siderealTime, rightAscension) {
    const L = longitude;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const Lw = L * -1;
    const m0 = normalizeToScale((a2 + Lw - Theta0) / 360, 1);
    const expectedTransit = normalizeToScale((12 - L / 15) / 24, 1);
    if (m0 - expectedTransit > 0.5) {
      return m0 - 1;
    } else if (expectedTransit - m0 > 0.5) {
      return m0 + 1;
    } else {
      return m0;
    }
  },
  /* The time at which the sun is at its highest point in the sky (in universal time) */
  correctedTransit(approximateTransit, longitude, siderealTime, rightAscension, previousRightAscension, nextRightAscension) {
    const m0 = approximateTransit;
    const L = longitude;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const a1 = previousRightAscension;
    const a3 = nextRightAscension;
    const Lw = L * -1;
    const Theta = unwindAngle(Theta0 + 360.985647 * m0);
    const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m0));
    const H = quadrantShiftAngle(Theta - Lw - a);
    const dm = H / -360;
    return (m0 + dm) * 24;
  },
  correctedHourAngle(approximateTransit, angle, coordinates, afterTransit, siderealTime, rightAscension, previousRightAscension, nextRightAscension, declination, previousDeclination, nextDeclination) {
    const m0 = approximateTransit;
    const h0 = angle;
    const Theta0 = siderealTime;
    const a2 = rightAscension;
    const a1 = previousRightAscension;
    const a3 = nextRightAscension;
    const d2 = declination;
    const d1 = previousDeclination;
    const d3 = nextDeclination;
    const Lw = coordinates.longitude * -1;
    const term1 = Math.sin(degreesToRadians(h0)) - Math.sin(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(d2));
    const term2 = Math.cos(degreesToRadians(coordinates.latitude)) * Math.cos(degreesToRadians(d2));
    const H0 = radiansToDegrees(Math.acos(term1 / term2));
    const m = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
    const Theta = unwindAngle(Theta0 + 360.985647 * m);
    const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m));
    const delta = Astronomical.interpolate(d2, d1, d3, m);
    const H = Theta - Lw - a;
    const h = Astronomical.altitudeOfCelestialBody(coordinates.latitude, delta, H);
    const term3 = h - h0;
    const term4 = 360 * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(H));
    const dm = term3 / term4;
    return (m + dm) * 24;
  },
  /* Interpolation of a value given equidistant
        previous and next values and a factor
        equal to the fraction of the interpolated
        point's time over the time between values. */
  interpolate(y2, y1, y3, n) {
    const a = y2 - y1;
    const b = y3 - y2;
    const c = b - a;
    return y2 + n / 2 * (a + b + n * c);
  },
  /* Interpolation of three angles, accounting for
        angle unwinding. */
  interpolateAngles(y2, y1, y3, n) {
    const a = unwindAngle(y2 - y1);
    const b = unwindAngle(y3 - y2);
    const c = b - a;
    return y2 + n / 2 * (a + b + n * c);
  },
  /* The Julian Day for the given Gregorian date components. */
  julianDay(year, month, day, hours = 0) {
    const trunc = Math.trunc;
    const Y = trunc(month > 2 ? year : year - 1);
    const M = trunc(month > 2 ? month : month + 12);
    const D = day + hours / 24;
    const A = trunc(Y / 100);
    const B = trunc(2 - A + trunc(A / 4));
    const i0 = trunc(365.25 * (Y + 4716));
    const i1 = trunc(30.6001 * (M + 1));
    return i0 + i1 + D + B - 1524.5;
  },
  /* Julian century from the epoch. */
  julianCentury(julianDay) {
    return (julianDay - 2451545) / 36525;
  },
  seasonAdjustedMorningTwilight(latitude, dayOfYear2, year, sunrise) {
    const a = 75 + 28.65 / 55 * Math.abs(latitude);
    const b = 75 + 19.44 / 55 * Math.abs(latitude);
    const c = 75 + 32.74 / 55 * Math.abs(latitude);
    const d = 75 + 48.1 / 55 * Math.abs(latitude);
    const adjustment = (function() {
      const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
      if (dyy < 91) {
        return a + (b - a) / 91 * dyy;
      } else if (dyy < 137) {
        return b + (c - b) / 46 * (dyy - 91);
      } else if (dyy < 183) {
        return c + (d - c) / 46 * (dyy - 137);
      } else if (dyy < 229) {
        return d + (c - d) / 46 * (dyy - 183);
      } else if (dyy < 275) {
        return c + (b - c) / 46 * (dyy - 229);
      } else {
        return b + (a - b) / 91 * (dyy - 275);
      }
    })();
    return dateByAddingSeconds(sunrise, Math.round(adjustment * -60));
  },
  seasonAdjustedEveningTwilight(latitude, dayOfYear2, year, sunset, shafaq) {
    let a, b, c, d;
    if (shafaq === Shafaq.Ahmer) {
      a = 62 + 17.4 / 55 * Math.abs(latitude);
      b = 62 - 7.16 / 55 * Math.abs(latitude);
      c = 62 + 5.12 / 55 * Math.abs(latitude);
      d = 62 + 19.44 / 55 * Math.abs(latitude);
    } else if (shafaq === Shafaq.Abyad) {
      a = 75 + 25.6 / 55 * Math.abs(latitude);
      b = 75 + 7.16 / 55 * Math.abs(latitude);
      c = 75 + 36.84 / 55 * Math.abs(latitude);
      d = 75 + 81.84 / 55 * Math.abs(latitude);
    } else {
      a = 75 + 25.6 / 55 * Math.abs(latitude);
      b = 75 + 2.05 / 55 * Math.abs(latitude);
      c = 75 - 9.21 / 55 * Math.abs(latitude);
      d = 75 + 6.14 / 55 * Math.abs(latitude);
    }
    const adjustment = (function() {
      const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
      if (dyy < 91) {
        return a + (b - a) / 91 * dyy;
      } else if (dyy < 137) {
        return b + (c - b) / 46 * (dyy - 91);
      } else if (dyy < 183) {
        return c + (d - c) / 46 * (dyy - 137);
      } else if (dyy < 229) {
        return d + (c - d) / 46 * (dyy - 183);
      } else if (dyy < 275) {
        return c + (b - c) / 46 * (dyy - 229);
      } else {
        return b + (a - b) / 91 * (dyy - 275);
      }
    })();
    return dateByAddingSeconds(sunset, Math.round(adjustment * 60));
  },
  daysSinceSolstice(dayOfYear2, year, latitude) {
    let daysSinceSolstice;
    const northernOffset = 10;
    const southernOffset = isLeapYear(year) ? 173 : 172;
    const daysInYear = isLeapYear(year) ? 366 : 365;
    if (latitude >= 0) {
      daysSinceSolstice = dayOfYear2 + northernOffset;
      if (daysSinceSolstice >= daysInYear) {
        daysSinceSolstice = daysSinceSolstice - daysInYear;
      }
    } else {
      daysSinceSolstice = dayOfYear2 - southernOffset;
      if (daysSinceSolstice < 0) {
        daysSinceSolstice = daysSinceSolstice + daysInYear;
      }
    }
    return daysSinceSolstice;
  }
};
var Astronomical_default = Astronomical;

// node_modules/adhan/lib/esm/SolarCoordinates.js
var SolarCoordinates = class {
  constructor(julianDay) {
    const T = Astronomical_default.julianCentury(julianDay);
    const L0 = Astronomical_default.meanSolarLongitude(T);
    const Lp = Astronomical_default.meanLunarLongitude(T);
    const Omega = Astronomical_default.ascendingLunarNodeLongitude(T);
    const Lambda = degreesToRadians(Astronomical_default.apparentSolarLongitude(T, L0));
    const Theta0 = Astronomical_default.meanSiderealTime(T);
    const dPsi = Astronomical_default.nutationInLongitude(T, L0, Lp, Omega);
    const dEpsilon = Astronomical_default.nutationInObliquity(T, L0, Lp, Omega);
    const Epsilon0 = Astronomical_default.meanObliquityOfTheEcliptic(T);
    const EpsilonApparent = degreesToRadians(Astronomical_default.apparentObliquityOfTheEcliptic(T, Epsilon0));
    this.declination = radiansToDegrees(Math.asin(Math.sin(EpsilonApparent) * Math.sin(Lambda)));
    this.rightAscension = unwindAngle(radiansToDegrees(Math.atan2(Math.cos(EpsilonApparent) * Math.sin(Lambda), Math.cos(Lambda))));
    this.apparentSiderealTime = Theta0 + dPsi * 3600 * Math.cos(degreesToRadians(Epsilon0 + dEpsilon)) / 3600;
  }
};

// node_modules/adhan/lib/esm/SolarTime.js
var SolarTime = class {
  constructor(date, coordinates) {
    const julianDay = Astronomical_default.julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0);
    this.observer = coordinates;
    this.solar = new SolarCoordinates(julianDay);
    this.prevSolar = new SolarCoordinates(julianDay - 1);
    this.nextSolar = new SolarCoordinates(julianDay + 1);
    const m0 = Astronomical_default.approximateTransit(coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension);
    const solarAltitude = -50 / 60;
    this.approxTransit = m0;
    this.transit = Astronomical_default.correctedTransit(m0, coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension);
    this.sunrise = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, false, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
    this.sunset = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, true, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
  }
  hourAngle(angle, afterTransit) {
    return Astronomical_default.correctedHourAngle(this.approxTransit, angle, this.observer, afterTransit, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
  }
  afternoon(shadowLength2) {
    const tangent = Math.abs(this.observer.latitude - this.solar.declination);
    const inverse = shadowLength2 + Math.tan(degreesToRadians(tangent));
    const angle = radiansToDegrees(Math.atan(1 / inverse));
    return this.hourAngle(angle, true);
  }
};

// node_modules/adhan/lib/esm/PolarCircleResolution.js
var PolarCircleResolution = {
  AqrabBalad: "AqrabBalad",
  AqrabYaum: "AqrabYaum",
  Unresolved: "Unresolved"
};
var LATITUDE_VARIATION_STEP = 0.5;
var UNSAFE_LATITUDE = 65;
var isValidSolarTime = (solarTime) => !isNaN(solarTime.sunrise) && !isNaN(solarTime.sunset);
var aqrabYaumResolver = (coordinates, date, daysAdded = 1, direction = 1) => {
  if (daysAdded > Math.ceil(365 / 2)) {
    return null;
  }
  const testDate = new Date(date.getTime());
  testDate.setDate(testDate.getDate() + direction * daysAdded);
  const tomorrow = dateByAddingDays(testDate, 1);
  const solarTime = new SolarTime(testDate, coordinates);
  const tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
  if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
    return aqrabYaumResolver(coordinates, date, daysAdded + (direction > 0 ? 0 : 1), -direction);
  }
  return {
    date,
    tomorrow,
    coordinates,
    solarTime,
    tomorrowSolarTime
  };
};
var aqrabBaladResolver = (coordinates, date, latitude) => {
  const solarTime = new SolarTime(date, {
    ...coordinates,
    latitude
  });
  const tomorrow = dateByAddingDays(date, 1);
  const tomorrowSolarTime = new SolarTime(tomorrow, {
    ...coordinates,
    latitude
  });
  if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
    return Math.abs(latitude) >= UNSAFE_LATITUDE ? aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) : null;
  }
  return {
    date,
    tomorrow,
    coordinates: new Coordinates(latitude, coordinates.longitude),
    solarTime,
    tomorrowSolarTime
  };
};
var polarCircleResolvedValues = (resolver, date, coordinates) => {
  const defaultReturn = {
    date,
    tomorrow: dateByAddingDays(date, 1),
    coordinates,
    solarTime: new SolarTime(date, coordinates),
    tomorrowSolarTime: new SolarTime(dateByAddingDays(date, 1), coordinates)
  };
  switch (resolver) {
    case PolarCircleResolution.AqrabYaum: {
      return aqrabYaumResolver(coordinates, date) || defaultReturn;
    }
    case PolarCircleResolution.AqrabBalad: {
      const {
        latitude
      } = coordinates;
      return aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) || defaultReturn;
    }
    default: {
      return defaultReturn;
    }
  }
};

// node_modules/adhan/lib/esm/CalculationParameters.js
var CalculationParameters = class {
  // Madhab to determine how Asr is calculated.
  madhab = Madhab.Shafi;
  // Rule to determine the earliest time for Fajr and latest time for Isha
  // needed for high latitude locations where Fajr and Isha may not truly exist
  // or may present a hardship unless bound to a reasonable time.
  highLatitudeRule = HighLatitudeRule_default.MiddleOfTheNight;
  // Manual adjustments (in minutes) to be added to each prayer time.
  adjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  };
  // Adjustments set by a calculation method. This value should not be manually modified.
  methodAdjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  };
  // Rule to determine how to resolve prayer times inside the Polar Circle
  // where daylight or night may persist for more than 24 hours depending
  // on the season
  polarCircleResolution = PolarCircleResolution.Unresolved;
  // How seconds are rounded when calculating prayer times
  rounding = Rounding.Nearest;
  // Used by the MoonsightingCommittee method to determine how to calculate Isha
  shafaq = Shafaq.General;
  constructor(method, fajrAngle = 0, ishaAngle = 0, ishaInterval = 0, maghribAngle = 0) {
    this.method = method;
    this.fajrAngle = fajrAngle;
    this.ishaAngle = ishaAngle;
    this.ishaInterval = ishaInterval;
    this.maghribAngle = maghribAngle;
    if (this.method === null) {
      this.method = "Other";
    }
  }
  nightPortions() {
    switch (this.highLatitudeRule) {
      case HighLatitudeRule_default.MiddleOfTheNight:
        return {
          fajr: 1 / 2,
          isha: 1 / 2
        };
      case HighLatitudeRule_default.SeventhOfTheNight:
        return {
          fajr: 1 / 7,
          isha: 1 / 7
        };
      case HighLatitudeRule_default.TwilightAngle:
        return {
          fajr: this.fajrAngle / 60,
          isha: this.ishaAngle / 60
        };
      default:
        throw `Invalid high latitude rule found when attempting to compute night portions: ${this.highLatitudeRule}`;
    }
  }
};

// node_modules/adhan/lib/esm/CalculationMethod.js
var CalculationMethod = {
  // Muslim World League
  MuslimWorldLeague() {
    const params = new CalculationParameters("MuslimWorldLeague", 18, 17);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Egyptian General Authority of Survey
  Egyptian() {
    const params = new CalculationParameters("Egyptian", 19.5, 17.5);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // University of Islamic Sciences, Karachi
  Karachi() {
    const params = new CalculationParameters("Karachi", 18, 18);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Umm al-Qura University, Makkah
  UmmAlQura() {
    return new CalculationParameters("UmmAlQura", 18.5, 0, 90);
  },
  // Dubai
  Dubai() {
    const params = new CalculationParameters("Dubai", 18.2, 18.2);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      sunrise: -3,
      dhuhr: 3,
      asr: 3,
      maghrib: 3
    };
    return params;
  },
  // Moonsighting Committee
  MoonsightingCommittee() {
    const params = new CalculationParameters("MoonsightingCommittee", 18, 18);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      dhuhr: 5,
      maghrib: 3
    };
    return params;
  },
  // ISNA
  NorthAmerica() {
    const params = new CalculationParameters("NorthAmerica", 15, 15);
    params.methodAdjustments.dhuhr = 1;
    return params;
  },
  // Kuwait
  Kuwait() {
    return new CalculationParameters("Kuwait", 18, 17.5);
  },
  // Qatar
  Qatar() {
    return new CalculationParameters("Qatar", 18, 0, 90);
  },
  // Singapore
  Singapore() {
    const params = new CalculationParameters("Singapore", 20, 18);
    params.methodAdjustments.dhuhr = 1;
    params.rounding = Rounding.Up;
    return params;
  },
  // Institute of Geophysics, University of Tehran
  Tehran() {
    const params = new CalculationParameters("Tehran", 17.7, 14, 0, 4.5);
    return params;
  },
  // Dianet
  Turkey() {
    const params = new CalculationParameters("Turkey", 18, 17);
    params.methodAdjustments = {
      ...params.methodAdjustments,
      sunrise: -7,
      dhuhr: 5,
      asr: 4,
      maghrib: 7
    };
    return params;
  },
  // Other
  Other() {
    return new CalculationParameters("Other", 0, 0);
  }
};
var CalculationMethod_default = CalculationMethod;

// node_modules/adhan/lib/esm/Prayer.js
var Prayer = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
  None: "none"
};
var Prayer_default = Prayer;

// node_modules/adhan/lib/esm/TimeComponents.js
var TimeComponents = class {
  constructor(num) {
    this.hours = Math.floor(num);
    this.minutes = Math.floor((num - this.hours) * 60);
    this.seconds = Math.floor((num - (this.hours + this.minutes / 60)) * 60 * 60);
    return this;
  }
  utcDate(year, month, date) {
    return new Date(Date.UTC(year, month, date, this.hours, this.minutes, this.seconds));
  }
};

// node_modules/adhan/lib/esm/PrayerTimes.js
var PrayerTimes = class {
  constructor(coordinates, date, calculationParameters) {
    this.coordinates = coordinates;
    this.date = date;
    this.calculationParameters = calculationParameters;
    let solarTime = new SolarTime(date, coordinates);
    let fajrTime;
    let sunriseTime;
    let dhuhrTime;
    let asrTime;
    let sunsetTime;
    let maghribTime;
    let ishaTime;
    let nightFraction;
    dhuhrTime = new TimeComponents(solarTime.transit).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    sunsetTime = new TimeComponents(solarTime.sunset).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    const tomorrow = dateByAddingDays(date, 1);
    let tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
    const polarCircleResolver = calculationParameters.polarCircleResolution;
    if ((!isValidDate(sunriseTime) || !isValidDate(sunsetTime) || isNaN(tomorrowSolarTime.sunrise)) && polarCircleResolver !== PolarCircleResolution.Unresolved) {
      const resolved = polarCircleResolvedValues(polarCircleResolver, date, coordinates);
      solarTime = resolved.solarTime;
      tomorrowSolarTime = resolved.tomorrowSolarTime;
      const dateComponents = [date.getFullYear(), date.getMonth(), date.getDate()];
      dhuhrTime = new TimeComponents(solarTime.transit).utcDate(...dateComponents);
      sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(...dateComponents);
      sunsetTime = new TimeComponents(solarTime.sunset).utcDate(...dateComponents);
    }
    asrTime = new TimeComponents(solarTime.afternoon(shadowLength(calculationParameters.madhab))).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    const tomorrowSunrise = new TimeComponents(tomorrowSolarTime.sunrise).utcDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const night = (Number(tomorrowSunrise) - Number(sunsetTime)) / 1e3;
    fajrTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.fajrAngle, false)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
    if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
      nightFraction = night / 7;
      fajrTime = dateByAddingSeconds(sunriseTime, -nightFraction);
    }
    const safeFajr = (function() {
      if (calculationParameters.method === "MoonsightingCommittee") {
        return Astronomical_default.seasonAdjustedMorningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunriseTime);
      } else {
        const portion = calculationParameters.nightPortions().fajr;
        nightFraction = portion * night;
        return dateByAddingSeconds(sunriseTime, -nightFraction);
      }
    })();
    if (isNaN(fajrTime.getTime()) || safeFajr > fajrTime) {
      fajrTime = safeFajr;
    }
    if (calculationParameters.ishaInterval > 0) {
      ishaTime = dateByAddingMinutes(sunsetTime, calculationParameters.ishaInterval);
    } else {
      ishaTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.ishaAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
        nightFraction = night / 7;
        ishaTime = dateByAddingSeconds(sunsetTime, nightFraction);
      }
      const safeIsha = (function() {
        if (calculationParameters.method === "MoonsightingCommittee") {
          return Astronomical_default.seasonAdjustedEveningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunsetTime, calculationParameters.shafaq);
        } else {
          const portion = calculationParameters.nightPortions().isha;
          nightFraction = portion * night;
          return dateByAddingSeconds(sunsetTime, nightFraction);
        }
      })();
      if (isNaN(ishaTime.getTime()) || safeIsha < ishaTime) {
        ishaTime = safeIsha;
      }
    }
    maghribTime = sunsetTime;
    if (calculationParameters.maghribAngle) {
      const angleBasedMaghrib = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.maghribAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      if (sunsetTime < angleBasedMaghrib && ishaTime > angleBasedMaghrib) {
        maghribTime = angleBasedMaghrib;
      }
    }
    const fajrAdjustment = (calculationParameters.adjustments.fajr || 0) + (calculationParameters.methodAdjustments.fajr || 0);
    const sunriseAdjustment = (calculationParameters.adjustments.sunrise || 0) + (calculationParameters.methodAdjustments.sunrise || 0);
    const dhuhrAdjustment = (calculationParameters.adjustments.dhuhr || 0) + (calculationParameters.methodAdjustments.dhuhr || 0);
    const asrAdjustment = (calculationParameters.adjustments.asr || 0) + (calculationParameters.methodAdjustments.asr || 0);
    const maghribAdjustment = (calculationParameters.adjustments.maghrib || 0) + (calculationParameters.methodAdjustments.maghrib || 0);
    const ishaAdjustment = (calculationParameters.adjustments.isha || 0) + (calculationParameters.methodAdjustments.isha || 0);
    this.fajr = roundedMinute(dateByAddingMinutes(fajrTime, fajrAdjustment), calculationParameters.rounding);
    this.sunrise = roundedMinute(dateByAddingMinutes(sunriseTime, sunriseAdjustment), calculationParameters.rounding);
    this.dhuhr = roundedMinute(dateByAddingMinutes(dhuhrTime, dhuhrAdjustment), calculationParameters.rounding);
    this.asr = roundedMinute(dateByAddingMinutes(asrTime, asrAdjustment), calculationParameters.rounding);
    this.sunset = roundedMinute(sunsetTime, calculationParameters.rounding);
    this.maghrib = roundedMinute(dateByAddingMinutes(maghribTime, maghribAdjustment), calculationParameters.rounding);
    this.isha = roundedMinute(dateByAddingMinutes(ishaTime, ishaAdjustment), calculationParameters.rounding);
  }
  timeForPrayer(prayer) {
    if (prayer === Prayer_default.Fajr) {
      return this.fajr;
    } else if (prayer === Prayer_default.Sunrise) {
      return this.sunrise;
    } else if (prayer === Prayer_default.Dhuhr) {
      return this.dhuhr;
    } else if (prayer === Prayer_default.Asr) {
      return this.asr;
    } else if (prayer === Prayer_default.Maghrib) {
      return this.maghrib;
    } else if (prayer === Prayer_default.Isha) {
      return this.isha;
    } else {
      return null;
    }
  }
  currentPrayer(date = /* @__PURE__ */ new Date()) {
    if (date >= this.isha) {
      return Prayer_default.Isha;
    } else if (date >= this.maghrib) {
      return Prayer_default.Maghrib;
    } else if (date >= this.asr) {
      return Prayer_default.Asr;
    } else if (date >= this.dhuhr) {
      return Prayer_default.Dhuhr;
    } else if (date >= this.sunrise) {
      return Prayer_default.Sunrise;
    } else if (date >= this.fajr) {
      return Prayer_default.Fajr;
    } else {
      return Prayer_default.None;
    }
  }
  nextPrayer(date = /* @__PURE__ */ new Date()) {
    if (date >= this.isha) {
      return Prayer_default.None;
    } else if (date >= this.maghrib) {
      return Prayer_default.Isha;
    } else if (date >= this.asr) {
      return Prayer_default.Maghrib;
    } else if (date >= this.dhuhr) {
      return Prayer_default.Asr;
    } else if (date >= this.sunrise) {
      return Prayer_default.Dhuhr;
    } else if (date >= this.fajr) {
      return Prayer_default.Sunrise;
    } else {
      return Prayer_default.Fajr;
    }
  }
};

// lib/prayer.ts
var methodParams = (method) => {
  switch (method) {
    case "ISNA":
      return CalculationMethod_default.NorthAmerica();
    case "Egyptian":
      return CalculationMethod_default.Egyptian();
    case "UmmAlQura":
      return CalculationMethod_default.UmmAlQura();
    case "Karachi":
      return CalculationMethod_default.Karachi();
    default:
      return CalculationMethod_default.MuslimWorldLeague();
  }
};
var ymdParts = (tz, date) => {
  const [y, m, d] = dateInTz(tz, date).split("-").map(Number);
  return [y, m, d];
};
var timesForYmd = (settings, y, m, d) => {
  const city = findCity(settings.city);
  const params = methodParams(settings.method);
  params.madhab = settings.madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const pt = new PrayerTimes(
    new Coordinates(city.lat, city.lng),
    new Date(y, m - 1, d, 12),
    params
  );
  return [
    { name: "Fajr", time: pt.fajr },
    { name: "Sunrise", time: pt.sunrise },
    { name: "Dhuhr", time: pt.dhuhr },
    { name: "Asr", time: pt.asr },
    { name: "Maghrib", time: pt.maghrib },
    { name: "Isha", time: pt.isha }
  ];
};
var planningDayTimes = (settings, ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  if (dayStart(settings) === "midnight") return timesForYmd(settings, y, m, d);
  const eve = timesForYmd(settings, y, m, d - 1).filter(
    (p) => p.name === "Maghrib" || p.name === "Isha"
  );
  const day = timesForYmd(settings, y, m, d).filter((p) => p.name !== "Isha");
  return [...eve, ...day];
};
var fmtPlanningDayTimes = (settings, ymd) => {
  const tz = findCity(settings.city).tz;
  const times = planningDayTimes(settings, ymd);
  return times.map((p, i) => {
    const note = dayStart(settings) === "midnight" ? "" : i < 2 ? " (evening before)" : i === times.length - 1 ? " (day ends)" : "";
    return `${p.name}${note} ${fmtTime(p.time, tz)}`;
  }).join(", ");
};
var maghribDay = (settings, now = /* @__PURE__ */ new Date()) => {
  const city = findCity(settings.city);
  const [y, m, d] = ymdParts(city.tz, now);
  const all = [
    ...timesForYmd(settings, y, m, d - 1),
    ...timesForYmd(settings, y, m, d),
    ...timesForYmd(settings, y, m, d + 1)
  ].sort((a, b) => a.time.getTime() - b.time.getTime());
  const maghribs = all.filter((p) => p.name === "Maghrib");
  let startIdx = -1;
  for (let i = 0; i < maghribs.length; i++) {
    if (maghribs[i].time <= now) startIdx = i;
  }
  if (startIdx < 0 || startIdx + 1 >= maghribs.length) return null;
  const start = maghribs[startIdx];
  const end = maghribs[startIdx + 1];
  const sequence = all.filter((p) => p.name !== "Sunrise").filter((p) => p.time >= start.time && p.time < end.time);
  const next = all.filter((p) => p.name !== "Sunrise").find((p) => p.time > now) || sequence[0];
  const current = [...sequence].reverse().find((p) => p.time <= now) || sequence[0];
  return { sequence, next, current, start: start.time, end: end.time };
};
var planningDay = (settings, now = /* @__PURE__ */ new Date()) => {
  const city = findCity(settings.city);
  if (dayStart(settings) === "midnight") return dateInTz(city.tz, now);
  const day = maghribDay(settings, now);
  return dateInTz(city.tz, day ? day.end : now);
};
var fmtTime = (d, tz) => new Intl.DateTimeFormat("en-GB", {
  timeZone: tz,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).format(d);

// lib/schedule.ts
var ANCHORS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
var uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
var YMD = /^\d{4}-\d{2}-\d{2}$/;
var isYmd = (v) => typeof v === "string" && YMD.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
var isAnchor = (v) => typeof v === "string" && ANCHORS.includes(v);
var cleanTitle = (v) => typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 200) : "";
var tasksForDay = (tasks, date, order = ANCHORS) => tasks.filter((t) => t.date === date).sort((a, b) => order.indexOf(a.anchor) - order.indexOf(b.anchor));
var describeDay = (tasks, date, order = ANCHORS) => {
  const day = tasksForDay(tasks, date, order);
  if (day.length === 0) return `${date}: no tasks yet.`;
  const lines = order.flatMap((a) => {
    const at = day.filter((t) => t.anchor === a);
    if (at.length === 0) return [];
    return [
      `After ${a}:`,
      ...at.map((t) => `  - [${t.done ? "x" : " "}] ${t.title} (id: ${t.id})`)
    ];
  });
  return [`${date}:`, ...lines].join("\n");
};
var SCHEDULE_TOOLS = [
  {
    name: "list_tasks",
    description: "List the tasks planned for one day, grouped by the prayer they follow, with each task's id. Call this before changing a day you haven't read yet.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "The day, as yyyy-mm-dd." }
      },
      required: ["date"],
      additionalProperties: false
    }
  },
  {
    name: "add_task",
    description: 'Add one task to a day, placed after the given prayer. Keep titles short, like a to-do item ("Read 10 pages of Riyad as-Salihin"); put a duration in the title when one was asked for.',
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "The day, as yyyy-mm-dd." },
        anchor: {
          type: "string",
          enum: [...ANCHORS],
          description: "The prayer the task comes after."
        },
        title: { type: "string", description: "What to do." }
      },
      required: ["date", "anchor", "title"],
      additionalProperties: false
    }
  },
  {
    name: "update_task",
    description: "Change an existing task by id: rename it, move it to another prayer or day, or mark it done or not done. Only the fields given change.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        anchor: { type: "string", enum: [...ANCHORS] },
        date: { type: "string", description: "Move to this day (yyyy-mm-dd)." },
        done: { type: "boolean" }
      },
      required: ["id"],
      additionalProperties: false
    }
  },
  {
    name: "delete_task",
    description: "Remove a task by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false
    }
  }
];
var fail = (tasks, result) => ({
  tasks,
  result,
  isError: true
});
var applyScheduleTool = (tasks, name, input, order = ANCHORS) => {
  switch (name) {
    case "list_tasks": {
      if (!isYmd(input.date)) return fail(tasks, "date must be yyyy-mm-dd");
      return { tasks, result: describeDay(tasks, input.date, order), isError: false };
    }
    case "add_task": {
      const title = cleanTitle(input.title);
      if (!isYmd(input.date)) return fail(tasks, "date must be yyyy-mm-dd");
      if (!isAnchor(input.anchor))
        return fail(tasks, `anchor must be one of ${ANCHORS.join(", ")}`);
      if (!title) return fail(tasks, "title is empty");
      const task = {
        id: uid(),
        date: input.date,
        anchor: input.anchor,
        title,
        done: false
      };
      return {
        tasks: [...tasks, task],
        result: `Added "${title}" after ${task.anchor} on ${task.date} (id: ${task.id}).`,
        isError: false,
        change: { kind: "added", task }
      };
    }
    case "update_task": {
      const before = tasks.find((t) => t.id === input.id);
      if (!before) return fail(tasks, `no task with id ${String(input.id)}`);
      const after = { ...before };
      if (input.title !== void 0) {
        const title = cleanTitle(input.title);
        if (!title) return fail(tasks, "title is empty");
        after.title = title;
      }
      if (input.anchor !== void 0) {
        if (!isAnchor(input.anchor))
          return fail(tasks, `anchor must be one of ${ANCHORS.join(", ")}`);
        after.anchor = input.anchor;
      }
      if (input.date !== void 0) {
        if (!isYmd(input.date)) return fail(tasks, "date must be yyyy-mm-dd");
        after.date = input.date;
      }
      if (input.done !== void 0) {
        if (typeof input.done !== "boolean")
          return fail(tasks, "done must be true or false");
        after.done = input.done;
      }
      return {
        tasks: tasks.map((t) => t.id === before.id ? after : t),
        result: `Updated: "${after.title}" after ${after.anchor} on ${after.date}${after.done ? ", done" : ""}.`,
        isError: false,
        change: { kind: "updated", before, after }
      };
    }
    case "delete_task": {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) return fail(tasks, `no task with id ${String(input.id)}`);
      return {
        tasks: tasks.filter((t) => t.id !== task.id),
        result: `Deleted "${task.title}".`,
        isError: false,
        change: { kind: "deleted", task }
      };
    }
    default:
      return fail(tasks, `unknown tool ${name}`);
  }
};

// mcp/tools.ts
var SUPABASE_URL = process.env.SUPABASE_URL || "https://cgtetucceocbldqthgiw.supabase.co";
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndGV0dWNjZW9jYmxkcXRoZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njc1NzYsImV4cCI6MjA4NTE0MzU3Nn0.NGJ4sSE3kA1KPzTnUokEObM7EB-_okf3O_KRd7KFJ1s";
var DEFAULT_SETTINGS = {
  city: "Tashkent",
  method: "MuslimWorldLeague",
  madhab: "Hanafi",
  displayName: "",
  adhanEnabled: false,
  adhanVoice: "a1",
  adhanPrayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
};
var createAliNoorServer = (supabase, userId) => {
  const readKey = async (key2, fallback) => {
    const uid2 = await userId();
    const { data, error } = await supabase.from("user_data").select("value").eq("user_id", uid2).eq("key", key2).maybeSingle();
    if (error) throw new Error(`Couldn't read ${key2}: ${error.message}`);
    return data ? data.value : fallback;
  };
  const writeKey = async (key2, value) => {
    const uid2 = await userId();
    const { error } = await supabase.from("user_data").upsert(
      { user_id: uid2, key: key2, value, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { onConflict: "user_id,key" }
    );
    if (error) throw new Error(`Couldn't save ${key2}: ${error.message}`);
  };
  const loadSettings = async () => {
    const stored = await readKey("alinoor_settings", {});
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      adhanPrayers: { ...DEFAULT_SETTINGS.adhanPrayers, ...stored.adhanPrayers || {} }
    };
  };
  const loadTasks = () => readKey("alinoor_tasks", []);
  const text = (t, isError = false) => ({
    content: [{ type: "text", text: t }],
    isError
  });
  const guard = (fn) => async (args) => {
    try {
      return text(await fn(args));
    } catch (err) {
      return text(err instanceof Error ? err.message : String(err), true);
    }
  };
  const dateArg = import_zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("The planning day as yyyy-mm-dd. Defaults to today.");
  const resolveDate = async (date) => date ?? planningDay(await loadSettings());
  const server = new import_mcp.McpServer({ name: "alinoor", version: "1.0.0" });
  server.registerTool(
    "get_today",
    {
      title: "Today in AliNoor",
      description: "Today's planning day in AliNoor, how the user's days run (calendar days, or Maghrib to Maghrib), their city, prayer times and planned tasks.",
      inputSchema: {},
      annotations: { readOnlyHint: true }
    },
    guard(async () => {
      const settings = await loadSettings();
      const city = findCity(settings.city);
      const date = planningDay(settings);
      const times = fmtPlanningDayTimes(settings, date);
      return [
        `Planning day: ${date} (tomorrow: ${addDays(date, 1)})`,
        dayRule(settings),
        `City: ${city.name}, ${city.country} (${city.tz})`,
        `Prayer times: ${times}`,
        "",
        describeDay(await loadTasks(), date, anchorOrder(settings))
      ].join("\n");
    })
  );
  server.registerTool(
    "get_prayer_times",
    {
      title: "Prayer times",
      description: "Prayer times for a planning day in the user's city and local time. With Maghrib days, the day opens with the Maghrib and Isha of the evening before.",
      inputSchema: { date: dateArg },
      annotations: { readOnlyHint: true }
    },
    guard(async ({ date }) => {
      const settings = await loadSettings();
      const day = date ?? planningDay(settings);
      return `${day}: ${fmtPlanningDayTimes(settings, day)}`;
    })
  );
  const describe = (name) => SCHEDULE_TOOLS.find((t) => t.name === name).description;
  const edit = async (name, input) => {
    const out = applyScheduleTool(
      await loadTasks(),
      name,
      input,
      anchorOrder(await loadSettings())
    );
    if (out.isError) throw new Error(out.result);
    if (out.change) await writeKey("alinoor_tasks", out.tasks);
    return out.result;
  };
  server.registerTool(
    "list_tasks",
    {
      title: "List tasks",
      description: describe("list_tasks"),
      inputSchema: { date: dateArg },
      annotations: { readOnlyHint: true }
    },
    guard(
      async ({ date }) => describeDay(
        await loadTasks(),
        await resolveDate(date),
        anchorOrder(await loadSettings())
      )
    )
  );
  server.registerTool(
    "add_task",
    {
      title: "Add task",
      description: describe("add_task"),
      inputSchema: {
        date: dateArg,
        anchor: import_zod.z.enum(ANCHORS).describe("The prayer the task comes after."),
        title: import_zod.z.string().min(1).describe("What to do.")
      }
    },
    guard(
      async ({ date, anchor, title }) => edit("add_task", { date: await resolveDate(date), anchor, title })
    )
  );
  server.registerTool(
    "update_task",
    {
      title: "Update task",
      description: describe("update_task"),
      inputSchema: {
        id: import_zod.z.string(),
        title: import_zod.z.string().min(1).optional(),
        anchor: import_zod.z.enum(ANCHORS).optional(),
        date: import_zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Move to this day (yyyy-mm-dd)."),
        done: import_zod.z.boolean().optional()
      }
    },
    guard(async (args) => edit("update_task", args))
  );
  server.registerTool(
    "delete_task",
    {
      title: "Delete task",
      description: describe("delete_task"),
      inputSchema: { id: import_zod.z.string() },
      annotations: { destructiveHint: true }
    },
    guard(async ({ id }) => edit("delete_task", { id }))
  );
  return server;
};

// mcp/oauth.ts
var import_crypto = require("crypto");
var CODE_TTL_MS = 5 * 60 * 1e3;
var key = () => {
  const secret = process.env.MCP_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("MCP_SECRET is not set on this deployment.");
  return (0, import_crypto.createHash)("sha256").update(secret).digest();
};
var b64url = (b) => b.toString("base64url");
var seal = (payload) => {
  const iv = (0, import_crypto.randomBytes)(12);
  const c = (0, import_crypto.createCipheriv)("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(JSON.stringify(payload), "utf8"), c.final()]);
  return b64url(Buffer.concat([iv, c.getAuthTag(), body]));
};
var unseal = (token) => {
  try {
    const raw = Buffer.from(token, "base64url");
    const d = (0, import_crypto.createDecipheriv)("aes-256-gcm", key(), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    const out = Buffer.concat([d.update(raw.subarray(28)), d.final()]);
    return JSON.parse(out.toString("utf8"));
  } catch {
    return null;
  }
};
var s256 = (verifier) => (0, import_crypto.createHash)("sha256").update(verifier).digest("base64url");
var origin = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto.split(",")[0]}://${host}`;
};
var json = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...headers
  });
  res.end(JSON.stringify(body));
};
var readBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = typeof req.body === "string" ? req.body : "";
  if (!raw) for await (const chunk of req) raw += chunk;
  const type = String(req.headers["content-type"] || "");
  if (type.includes("application/json")) {
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
};
var queryOf = (req) => ({
  ...Object.fromEntries(new URL(req.url || "/", "http://x").searchParams),
  ...Object.fromEntries(
    Object.entries(req.query || {}).flatMap(
      ([k, v]) => typeof v === "string" ? [[k, v]] : []
    )
  )
});
var parseClient = (clientId) => unseal(clientId);
var metadata = (base) => ({
  issuer: base,
  authorization_endpoint: `${base}/api/oauth/authorize`,
  token_endpoint: `${base}/api/oauth/token`,
  registration_endpoint: `${base}/api/oauth/register`,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  code_challenge_methods_supported: ["S256"],
  token_endpoint_auth_methods_supported: ["none"],
  scopes_supported: ["schedule"]
});
var resourceMetadata = (base) => ({
  resource: `${base}/api/mcp`,
  authorization_servers: [base],
  scopes_supported: ["schedule"],
  bearer_methods_supported: ["header"],
  resource_name: "AliNoor"
});
var PENDING_TTL_MS = 15 * 60 * 1e3;
var codeRedirect = (p, session) => {
  const code = seal({
    t: "code",
    at: session.access_token,
    rt: session.refresh_token,
    exp: session.expires_at,
    cc: p.code_challenge,
    ru: p.redirect_uri,
    cid: p.client_id,
    iat: Date.now()
  });
  const back = new URL(p.redirect_uri);
  back.searchParams.set("code", code);
  if (p.state) back.searchParams.set("state", p.state);
  return back.toString();
};

// mcp/http/mcp.ts
async function handler(req, res) {
  const unauthorized = (why) => json(res, 401, { error: "invalid_token", error_description: why }, {
    "www-authenticate": `Bearer resource_metadata="${origin(req)}/.well-known/oauth-protected-resource"`
  });
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return unauthorized("Sign in to AliNoor to use this connector.");
  const supabase = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return unauthorized("Session expired. Reconnect AliNoor.");
  const uid2 = data.user.id;
  if (req.method !== "POST")
    return json(res, 405, { jsonrpc: "2.0", error: { code: -32e3, message: "Method not allowed." }, id: null });
  const server = createAliNoorServer(supabase, async () => uid2);
  const transport = new import_streamableHttp.StreamableHTTPServerTransport({ sessionIdGenerator: void 0, enableJsonResponse: true });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, await readBody(req));
}

// mcp/http/metadata.ts
function handler2(req, res) {
  const base = origin(req);
  if (queryOf(req).kind === "resource") return json(res, 200, resourceMetadata(base));
  return json(res, 200, metadata(base));
}

// mcp/http/register.ts
async function handler3(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
  const body = await readBody(req);
  const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u) => typeof u === "string" && /^https:\/\/|^http:\/\/localhost[:/]/.test(u)) : [];
  if (uris.length === 0)
    return json(res, 400, { error: "invalid_redirect_uri", error_description: "redirect_uris must be https URLs" });
  const name = typeof body.client_name === "string" ? body.client_name.slice(0, 100) : void 0;
  return json(res, 201, {
    client_id: seal({ redirect_uris: uris, name }),
    client_id_issued_at: Math.floor(Date.now() / 1e3),
    redirect_uris: uris,
    client_name: name,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none"
  });
}

// mcp/http/authorize.ts
var import_supabase_js2 = require("@supabase/supabase-js");
var esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var page = (p, clientHost, googleHref, error = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect AliNoor</title>
<style>
:root{--bg:#fafaf7;--panel:#fff;--ink:#1a1916;--ink3:#6a675e;--line:#e3e1da;--ember:#b34a3a}
@media (prefers-color-scheme:dark){:root{--bg:#16140f;--panel:#1c1a16;--ink:#f5f4ef;--ink3:#a8a397;--line:#2d2a24;--ember:#d97560}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,sans-serif;padding:16px}
form{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:28px}
h1{font-size:20px;margin:0 0 6px}p{color:var(--ink3);margin:0 0 20px;font-size:14px}
label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin:14px 0 6px}
input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--ink);font:inherit}
button{margin-top:20px;width:100%;padding:11px;border:0;border-radius:9px;background:var(--ink);color:var(--bg);font:inherit;font-weight:600;cursor:pointer}
.err{color:var(--ember);font-size:14px;margin-top:14px}.note{font-size:12px;margin-top:16px}
.google{display:block;text-align:center;padding:11px;border:1px solid var(--line);border-radius:9px;color:var(--ink);text-decoration:none;font-weight:600}
.or{display:flex;align-items:center;gap:10px;color:var(--ink3);font-size:12px;margin:18px 0 0}.or::before,.or::after{content:'';flex:1;border-top:1px solid var(--line)}
</style></head><body>
<form method="post">
<h1>Connect AliNoor</h1>
<p><strong>${esc(clientHost)}</strong> wants to read and edit your AliNoor daily schedule.</p>
<a class="google" href="${esc(googleHref)}">Continue with Google</a>
<div class="or">or with email</div>
${Object.entries(p).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("")}
<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required>
<label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
${error ? `<div class="err">${esc(error)}</div>` : ""}
<button type="submit">Allow access</button>
</form></body></html>`;
var PARAMS = ["response_type", "client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method", "scope", "resource"];
async function handler4(req, res) {
  const src = req.method === "POST" ? await readBody(req) : queryOf(req);
  const p = {};
  for (const k of PARAMS) if (typeof src[k] === "string") p[k] = src[k];
  const fail2 = (status, msg) => {
    res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
    res.end(msg);
  };
  const client = p.client_id ? parseClient(p.client_id) : null;
  if (!client) return fail2(400, "Unknown client_id.");
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri))
    return fail2(400, "redirect_uri was not registered for this client.");
  if (p.response_type !== "code") return fail2(400, "Only response_type=code is supported.");
  if (!p.code_challenge || p.code_challenge_method !== "S256")
    return fail2(400, "PKCE with S256 is required.");
  const clientHost = new URL(p.redirect_uri).host;
  const googleHref = `/connect/?r=${encodeURIComponent(
    seal({ t: "pending", p, host: clientHost, iat: Date.now() })
  )}`;
  const html = (error2 = "", status = 200) => {
    res.writeHead(status, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-frame-options": "DENY",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"
    });
    res.end(page(p, clientHost, googleHref, error2));
  };
  if (req.method !== "POST") return html();
  const email = typeof src.email === "string" ? src.email.trim() : "";
  const password = typeof src.password === "string" ? src.password : "";
  const supabase = (0, import_supabase_js2.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return html("That email and password didn\u2019t match an AliNoor account.", 401);
  const location = codeRedirect(p, data.session);
  res.writeHead(302, { location, "cache-control": "no-store" });
  res.end();
}

// mcp/http/token.ts
var import_supabase_js3 = require("@supabase/supabase-js");
var tokens = (at, rt, cid, exp) => ({
  access_token: at,
  token_type: "Bearer",
  expires_in: exp ? Math.max(60, exp - Math.floor(Date.now() / 1e3)) : 3600,
  refresh_token: seal({ t: "refresh", rt, cid }),
  scope: "schedule"
});
async function handler5(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "invalid_request" });
  const b = await readBody(req);
  const bad = (error, error_description) => json(res, 400, { error, error_description });
  if (b.grant_type === "authorization_code") {
    const c = b.code ? unseal(b.code) : null;
    if (!c || c.t !== "code") return bad("invalid_grant", "Unknown code.");
    if (Date.now() - c.iat > CODE_TTL_MS) return bad("invalid_grant", "Code expired.");
    if (b.redirect_uri && b.redirect_uri !== c.ru) return bad("invalid_grant", "redirect_uri mismatch.");
    if (b.client_id && b.client_id !== c.cid) return bad("invalid_grant", "client_id mismatch.");
    if (!b.code_verifier || s256(b.code_verifier) !== c.cc)
      return bad("invalid_grant", "PKCE verification failed.");
    return json(res, 200, tokens(c.at, c.rt, c.cid, c.exp));
  }
  if (b.grant_type === "refresh_token") {
    const r = b.refresh_token ? unseal(b.refresh_token) : null;
    if (!r || r.t !== "refresh") return bad("invalid_grant", "Unknown refresh token.");
    const supabase = (0, import_supabase_js3.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: r.rt });
    if (error || !data.session)
      return bad("invalid_grant", "Session expired. Reconnect AliNoor.");
    return json(res, 200, tokens(data.session.access_token, data.session.refresh_token, r.cid, data.session.expires_at));
  }
  return bad("unsupported_grant_type", "Use authorization_code or refresh_token.");
}

// mcp/http/complete.ts
var import_supabase_js4 = require("@supabase/supabase-js");
var pendingFrom = (r) => {
  const pending = typeof r === "string" ? unseal(r) : null;
  if (!pending || pending.t !== "pending") return null;
  if (Date.now() - pending.iat > PENDING_TTL_MS) return null;
  return pending;
};
async function handler6(req, res) {
  if (req.method === "GET") {
    const pending2 = pendingFrom(queryOf(req).r);
    if (!pending2) return json(res, 400, { error: "This sign-in link expired. Start again from Claude." });
    return json(res, 200, { host: pending2.host });
  }
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
  const b = await readBody(req);
  const pending = pendingFrom(b.r);
  if (!pending) return json(res, 400, { error: "This sign-in link expired. Start again from Claude." });
  if (!b.access_token || !b.refresh_token)
    return json(res, 400, { error: "Missing session." });
  const supabase = (0, import_supabase_js4.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabase.auth.getUser(b.access_token);
  if (error || !data.user) return json(res, 401, { error: "Google sign-in didn\u2019t produce a valid AliNoor session." });
  const exp = Number(b.expires_at);
  return json(res, 200, {
    redirect: codeRedirect(pending.p, {
      access_token: b.access_token,
      refresh_token: b.refresh_token,
      expires_at: Number.isFinite(exp) ? exp : void 0
    })
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mcp,
  oauthAuthorize,
  oauthComplete,
  oauthMetadata,
  oauthRegister,
  oauthToken
});

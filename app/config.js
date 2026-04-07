import { DateTime } from "app/types/dateTime.js";

export const MOTIS_URL = "http://192.168.178.36:8080";
//export const MOTIS_URL = "https://api.transitous.org/api";

export const URL_DEFAULTS = {
  mapZoom: 7.3,
  mapCenter: [11.75685, 54.0443],
  calDate: DateTime.now().startOf("day").plus({ days: 30 }),
};

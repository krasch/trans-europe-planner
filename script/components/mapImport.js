// https://github.com/maplibre/maplibre-gl-js/issues/3855#issuecomment-2005948403
// @ts-nocheck
import "external/maplibre-gl@5.15.0/maplibre-gl.js";

export const maplibre = {
  Map: maplibregl.Map,
  AttributionControl: maplibregl.AttributionControl,
  NavigationControl: maplibregl.NavigationControl,
};

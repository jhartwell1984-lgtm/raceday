const EARTH_RADIUS_MILES = 3958.7613;
const METERS_TO_FEET = 3.28084;
const MAX_STORED_POINTS = 2000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export function parseGpx(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('That file could not be read as GPX. Please check the export and try again.');
  }

  const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
  if (trkpts.length === 0) {
    throw new Error('No track points found in this GPX file.');
  }

  const rawPoints = trkpts.map((pt) => {
    const lat = parseFloat(pt.getAttribute('lat'));
    const lon = parseFloat(pt.getAttribute('lon'));
    const eleEl = pt.getElementsByTagName('ele')[0];
    const eleFt = eleEl ? parseFloat(eleEl.textContent) * METERS_TO_FEET : null;
    return { lat, lon, eleFt };
  });

  let cumulativeMiles = 0;
  let elevationGainFt = 0;
  let elevationLossFt = 0;
  const points = [];

  rawPoints.forEach((point, i) => {
    if (i > 0) {
      const prev = rawPoints[i - 1];
      cumulativeMiles += haversineMiles(prev, point);
      if (point.eleFt !== null && prev.eleFt !== null) {
        const delta = point.eleFt - prev.eleFt;
        if (delta > 0) elevationGainFt += delta;
        else elevationLossFt += Math.abs(delta);
      }
    }
    points.push([
      Math.round(point.lat * 1e6) / 1e6,
      Math.round(point.lon * 1e6) / 1e6,
      point.eleFt !== null ? Math.round(point.eleFt) : null,
      Math.round(cumulativeMiles * 1000) / 1000,
    ]);
  });

  let sampled = points;
  if (points.length > MAX_STORED_POINTS) {
    const step = points.length / MAX_STORED_POINTS;
    sampled = [];
    for (let i = 0; i < MAX_STORED_POINTS; i++) {
      sampled.push(points[Math.floor(i * step)]);
    }
    sampled.push(points[points.length - 1]);
  }

  return {
    points: sampled,
    totalDistanceMiles: Math.round(cumulativeMiles * 100) / 100,
    elevationGainFt: Math.round(elevationGainFt),
    elevationLossFt: Math.round(elevationLossFt),
  };
}

export interface SanitizedCoordinate {
  latitude: number;
  longitude: number;
  isReconstructed: boolean;
  raw: string;
  isValidIndonesianBbox: boolean;
}

const INDONESIA_BOUNDS = {
  minLat: -11.0,
  maxLat: 6.5,
  minLng: 95.0,
  maxLng: 141.0,
};

export function isInsideIndonesia(lat: number, lng: number): boolean {
  return (
    lat >= INDONESIA_BOUNDS.minLat &&
    lat <= INDONESIA_BOUNDS.maxLat &&
    lng >= INDONESIA_BOUNDS.minLng &&
    lng <= INDONESIA_BOUNDS.maxLng
  );
}

export function sanitizeCoordinate(raw: string | null | undefined): SanitizedCoordinate | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let latStr = "";
  let lngStr = "";
  let isReconstructed = false;

  const parts = trimmed.split(/,\s*/);
  if (parts.length === 2) {
    [latStr, lngStr] = parts;
  } else if (parts.length === 3) {
    // Comma used as decimal separator in latitude: e.g. "1,078611, 04.134472"
    latStr = `${parts[0]}.${parts[1]}`;
    lngStr = parts[2];
    isReconstructed = true;
  } else if (parts.length === 4) {
    // Comma used as decimal separator in both latitude and longitude
    latStr = `${parts[0]}.${parts[1]}`;
    lngStr = `${parts[2]}.${parts[3]}`;
    isReconstructed = true;
  } else {
    return null;
  }

  latStr = latStr.replace(",", ".").trim();
  lngStr = lngStr.replace(",", ".").trim();

  let lat = parseFloat(latStr);
  let lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) return null;

  // Restore truncated longitude leading digits for Indonesian bounding box
  if (lng < 95.0) {
    const rawLngStr = lngStr.trim();
    if (
      rawLngStr.startsWith("0") ||
      rawLngStr.startsWith("1") ||
      rawLngStr.startsWith("24") ||
      rawLngStr.startsWith("25") ||
      rawLngStr.startsWith("26") ||
      rawLngStr.startsWith("27") ||
      rawLngStr.startsWith("28") ||
      rawLngStr.startsWith("29") ||
      rawLngStr.startsWith("3") ||
      rawLngStr.startsWith("4")
    ) {
      lng = parseFloat(`1${rawLngStr}`);
      isReconstructed = true;
    } else if (
      rawLngStr.startsWith("5") ||
      rawLngStr.startsWith("6") ||
      rawLngStr.startsWith("7") ||
      rawLngStr.startsWith("8") ||
      rawLngStr.startsWith("9")
    ) {
      lng = parseFloat(`9${rawLngStr}`);
      isReconstructed = true;
    }
  }

  const validBbox = isInsideIndonesia(lat, lng);

  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    isReconstructed,
    raw: trimmed,
    isValidIndonesianBbox: validBbox,
  };
}

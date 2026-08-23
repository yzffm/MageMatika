/**
 * Pure, deterministic mathematical formulas for MageMatika.
 * These functions calculate areas, perimeters, volumes, and surface areas
 * based on dimensions. They should remain independent of React/R3F.
 */

export function rectangleArea(panjang, lebar) {
  return panjang * lebar;
}

export function rectanglePerimeter(panjang, lebar) {
  return 2 * (panjang + lebar);
}

export function triangleArea(alas, tinggi) {
  return 0.5 * alas * tinggi;
}

export function cylinderVolume(radius, height) {
  return Math.PI * radius * radius * height;
}

export function cuboidVolume(panjang, lebar, tinggi) {
  return panjang * lebar * tinggi;
}

export function cuboidSurfaceArea(panjang, lebar, tinggi) {
  return 2 * (panjang * lebar + panjang * tinggi + lebar * tinggi);
}

/**
 * Format a number to string with a specific number of decimal places if necessary.
 * Removes trailing zeros if it's an integer.
 */
export function formatNumber(value, maxDecimals = 2) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Number(value).toLocaleString('id-ID', {
    maximumFractionDigits: maxDecimals,
  });
}

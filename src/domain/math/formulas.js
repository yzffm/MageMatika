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

// ==========================================
// VS7 SMP Curriculum Extensions
// ==========================================

/**
 * 2D Transformation: Translation
 * @param {number} x - original X
 * @param {number} y - original Y
 * @param {number} tx - translation X
 * @param {number} ty - translation Y
 * @returns {Object} { x, y }
 */
export function translate2D(x, y, tx, ty) {
  return { x: x + tx, y: y + ty };
}

/**
 * 2D Transformation: Scaling (Kesebangunan)
 * from the origin (0,0)
 * @param {number} x 
 * @param {number} y 
 * @param {number} k - scale factor
 * @returns {Object} { x, y }
 */
export function scale2D(x, y, k) {
  return { x: x * k, y: y * k };
}

/**
 * Arithmetic Sequence: nth term
 * Un = a + (n - 1)b
 * @param {number} a - first term
 * @param {number} b - common difference
 * @param {number} n - term number
 */
export function arithmeticNthTerm(a, b, n) {
  return a + (n - 1) * b;
}

/**
 * Statistics: Average (Mean)
 * @param {number[]} data - array of numerical values
 */
export function calculateMean(data) {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * Scale / Perbandingan
 * Real distance = Map distance * Scale denominator
 */
export function realDistance(mapDistanceCm, scaleDenominator) {
  // Returns real distance in cm
  return mapDistanceCm * scaleDenominator;
}

/**
 * Pure, deterministic evaluation logic for challenge answers.
 * This file must not contain any React, Supabase, or DOM logic.
 */

/**
 * Evaluates a numeric answer against an expected value.
 * 
 * @param {Object} params
 * @param {number} params.expected - The expected correct numeric value.
 * @param {string|number} params.actual - The student's input value.
 * @param {number} [params.tolerance=0] - Accepted variance (e.g. for floating point answers).
 * @returns {Object} { isCorrect: boolean, difference: number, parsedActual: number|null }
 */
export function evaluateNumericAnswer({ expected, actual, tolerance = 0 }) {
  if (expected === undefined || expected === null) {
    return { isCorrect: false, difference: null, parsedActual: null }
  }

  // Normalize string inputs (handle commas as decimals, trim whitespace)
  let normalizedStr = String(actual).trim()
  
  // Basic numeric extraction: removes non-numeric characters EXCEPT . - and ,
  // E.g., "600 cm2" -> "600"
  const cleanStr = normalizedStr.replace(/[^0-9.,-]/g, '')
  
  // Handle Indonesian comma decimals (e.g., "3078,76")
  const formattedStr = cleanStr.replace(',', '.')

  const parsedActual = parseFloat(formattedStr)

  if (isNaN(parsedActual)) {
    return { isCorrect: false, difference: null, parsedActual: null }
  }

  const difference = Math.abs(expected - parsedActual)
  const isCorrect = difference <= tolerance

  return {
    isCorrect,
    difference,
    parsedActual
  }
}

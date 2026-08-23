/**
 * Pure, deterministic functions for progress calculations.
 * Does NOT access React, sessionStorage, or Supabase.
 */

/**
 * Returns the number of completed challenge IDs that belong to the current level's available challenge set.
 * 
 * @param {Array<string>} completedIds - List of all completed challenge IDs (from storage)
 * @param {Array<Object>} allLevelChallenges - List of challenge objects available for the current level
 * @returns {number} The count of valid completed challenges for this level
 */
export function getCompletedChallengesForLevel(completedIds = [], allLevelChallenges = []) {
  if (!Array.isArray(completedIds) || !Array.isArray(allLevelChallenges)) {
    return 0
  }

  // A completed ID is valid for the current level if it exists in the allLevelChallenges array
  const validIds = new Set(allLevelChallenges.map(c => c.id))
  
  let validCount = 0
  for (const id of completedIds) {
    if (validIds.has(id)) {
      validCount++
    }
  }

  return validCount
}

/**
 * Calculates the completion percentage safely.
 * 
 * @param {number} completedCount 
 * @param {number} totalCount 
 * @returns {number} Percentage between 0 and 100
 */
export function calculateCompletionPercentage(completedCount, totalCount) {
  if (typeof totalCount !== 'number' || totalCount <= 0) return 0
  if (typeof completedCount !== 'number' || completedCount < 0) return 0

  const rawPercentage = (completedCount / totalCount) * 100
  
  // Clamp between 0 and 100
  if (rawPercentage < 0) return 0
  if (rawPercentage > 100) return 100
  
  return Math.round(rawPercentage)
}

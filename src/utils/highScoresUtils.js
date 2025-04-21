// Constants
const HIGH_SCORES_KEY = 'tetrisHighScores';
const MAX_HIGH_SCORES = 10;

// Get high scores from localStorage
export const getHighScores = () => {
  try {
    const highScores = localStorage.getItem(HIGH_SCORES_KEY);
    return highScores ? JSON.parse(highScores) : [];
  } catch (error) {
    console.error('Error retrieving high scores:', error);
    return [];
  }
};

// Save high scores to localStorage
export const saveHighScore = (playerName, score) => {
  try {
    // Get current high scores
    let highScores = getHighScores();
    
    // Add new score
    highScores.push({ playerName, score, date: new Date().toISOString() });
    
    // Sort by score (highest first)
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only top scores
    highScores = highScores.slice(0, MAX_HIGH_SCORES);
    
    // Save back to localStorage
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    
    return highScores;
  } catch (error) {
    console.error('Error saving high score:', error);
    return [];
  }
};

// Clear all high scores (for testing)
export const clearHighScores = () => {
  try {
    localStorage.removeItem(HIGH_SCORES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing high scores:', error);
    return false;
  }
};

// Check if a score qualifies for the high scores list
export const isHighScore = (score) => {
  const highScores = getHighScores();
  
  // If we have fewer than MAX_HIGH_SCORES, any score qualifies
  if (highScores.length < MAX_HIGH_SCORES) {
    return true;
  }
  
  // Otherwise, check if the score is higher than the lowest score
  const lowestScore = highScores[highScores.length - 1]?.score || 0;
  return score > lowestScore;
};

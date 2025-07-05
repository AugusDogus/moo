/**
 * Game utilities for the moo deduction puzzle game
 */

// Available emojis for the game
export const GAME_EMOJIS = ["🐮", "🥛", "🍄", "🌸", "🌿", "🧺"] as const;

// Convert emoji to index for storage
export const emojiToIndex = (emoji: string): number => {
  const index = GAME_EMOJIS.indexOf(emoji as typeof GAME_EMOJIS[number]);
  return index === -1 ? 0 : index;
};

// Convert index to emoji for display
export const indexToEmoji = (index: number): string => {
  return GAME_EMOJIS[index] ?? GAME_EMOJIS[0];
};

// Convert code string to emoji array
export const codeToEmojis = (code: string): string[] => {
  return code.split("").map((char) => indexToEmoji(parseInt(char)));
};

// Convert emoji array to code string
export const emojisToCode = (emojis: string[]): string => {
  return emojis.map(emojiToIndex).join("");
};

// Generate a random 4-letter room code
export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calculate bulls and cows for a guess against the secret code
export const calculateBullsAndCows = (guess: string, secret: string): { bulls: number; cows: number } => {
  if (guess.length !== 4 || secret.length !== 4) {
    return { bulls: 0, cows: 0 };
  }

  const guessArray = guess.split("");
  const secretArray = secret.split("");
  
  let bulls = 0;
  let cows = 0;
  
  // Count bulls (correct position)
  const guessRemaining: string[] = [];
  const secretRemaining: string[] = [];
  
  for (let i = 0; i < 4; i++) {
    const guessChar = guessArray[i];
    const secretChar = secretArray[i];
    
    if (guessChar && secretChar && guessChar === secretChar) {
      bulls++;
    } else {
      if (guessChar) guessRemaining.push(guessChar);
      if (secretChar) secretRemaining.push(secretChar);
    }
  }
  
  // Count cows (correct emoji, wrong position)
  for (const guessChar of guessRemaining) {
    const secretIndex = secretRemaining.indexOf(guessChar);
    if (secretIndex !== -1) {
      cows++;
      secretRemaining.splice(secretIndex, 1);
    }
  }
  
  return { bulls, cows };
};

// Check if a guess is a winning guess (4 bulls)
export const isWinningGuess = (bulls: number): boolean => {
  return bulls === 4;
};

// Validate that a code uses only valid emojis and has 4 characters
export const isValidCode = (code: string): boolean => {
  if (code.length !== 4) return false;
  
  return code.split("").every((char) => {
    const index = parseInt(char);
    return !isNaN(index) && index >= 0 && index < GAME_EMOJIS.length;
  });
};

// Generate a random code for testing
export const generateRandomCode = (): string => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * GAME_EMOJIS.length).toString();
  }
  return code;
};
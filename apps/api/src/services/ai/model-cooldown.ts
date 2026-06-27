// In-memory cooldown tracker for specific model endpoints to prevent spamming 429 errors.
const cooldowns = new Map<string, number>();

function getCooldownKey(provider: string, model: string): string {
  return `${provider.toLowerCase()}:${model.toLowerCase()}`;
}

/**
 * Sets a cooldown for a specific provider model
 * @param provider Name of the AI provider
 * @param model Name of the model
 * @param seconds Duration of cooldown in seconds
 */
export function setModelCooldown(provider: string, model: string, seconds: number): void {
  const key = getCooldownKey(provider, model);
  const cooldownDuration = Math.max(seconds, 0) * 1000;
  cooldowns.set(key, Date.now() + cooldownDuration);
}

/**
 * Checks if a model is currently cooling down
 * @param provider Name of the AI provider
 * @param model Name of the model
 */
export function isModelCoolingDown(provider: string, model: string): boolean {
  const key = getCooldownKey(provider, model);
  const availableAt = cooldowns.get(key);
  if (!availableAt) return false;

  if (Date.now() >= availableAt) {
    cooldowns.delete(key); // Cleanup expired cooldown
    return false;
  }
  return true;
}

/**
 * Returns remaining cooldown in milliseconds
 * @param provider Name of the AI provider
 * @param model Name of the model
 */
export function getCooldownRemainingMs(provider: string, model: string): number {
  const key = getCooldownKey(provider, model);
  const availableAt = cooldowns.get(key);
  if (!availableAt) return 0;

  const remaining = availableAt - Date.now();
  return Math.max(remaining, 0);
}
/**
 * Clears all active cooldowns. Intended for use in testing only.
 */
export function clearAllCooldowns(): void {
  cooldowns.clear();
}

/**
 * Returns the provided avatar image URL if valid, 
 * or falls back to a personalized Dicebear SVG avatar based on the user's name.
 * 
 * @param {string} avatarImg - The submitted avatar image URL.
 * @param {string} name - The user's name to use as a seed.
 * @returns {string}
 */
export const getAvatarUrl = (avatarImg, name) => {
  if (avatarImg && avatarImg.trim()) {
    return avatarImg.trim();
  }
  const seed = name ? encodeURIComponent(name.trim()) : 'User';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * An onError event handler that replaces a broken image src with a 
 * personalized Dicebear SVG fallback matching the user's name.
 * 
 * @param {Event} e - The image loading error event.
 * @param {string} name - The user's name to use as a seed.
 */
export const handleAvatarError = (e, name) => {
  const seed = name ? encodeURIComponent(name.trim()) : 'User';
  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

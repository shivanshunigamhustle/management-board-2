export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter.";
  return null;
}

export const PASSWORD_POLICY_HINT = "At least 8 characters, including a letter and a number.";

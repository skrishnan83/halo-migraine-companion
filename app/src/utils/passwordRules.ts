// Halo's password rules: 15+ characters, with at least one
// uppercase letter, lowercase letter, number, and special character.

export const MIN_PASSWORD_LENGTH = 15;

type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (pw) => pw.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (pw) => /[a-z]/.test(pw),
  },
  { id: "number", label: "One number (0–9)", test: (pw) => /[0-9]/.test(pw) },
  {
    id: "special",
    label: "One special character (e.g. ! @ # $ %)",
    test: (pw) => /[^A-Za-z0-9\s]/.test(pw),
  },
];

// Checks a password against every rule.
// Returns each rule with passed: true/false, and isValid: true only if all pass.
export function checkPassword(password: string) {
  const results = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  return { results, isValid: results.every((r) => r.passed) };
}

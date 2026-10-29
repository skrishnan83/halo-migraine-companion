// While a new account is being created, Firebase signs the person in for a moment.
// This flag tells the app to ignore that moment, so it goes to Log In instead of Home.
export const signupState = { creating: false };


// function to genarate a new username
export function generateUsername(fullName: string): string {
  const firstName = fullName.split(' ')[0].toLowerCase();
  // Generate 4 random alphanumeric characters
  const randomChars = Math.random().toString(36).substring(2, 6); // Generate a random string and take the first 4 characters

  // Combine the first name with the random alphanumeric characters
  return `${firstName}-${randomChars}`;
}
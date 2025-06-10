// This is a simple user model using an in-memory array.
// Later we can replace this with MongoDB.

const users = []; // ← temporary "database" array

export const addUser = (userData) => {
  users.push(userData); // store the user
  return userData; // return stored user
};

export const findUserByEmail = (email) => {
  return users.find((user) => user.email === email); // lookup
};

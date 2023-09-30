const httpError = require("http-errors");
const database = require("../services/database.service");
const jwtService = require("../services/jwt.service");
const { COLLECTION_NAMES } = require("../config");
const { buildUser, encryptPassword } = require("./auth.utils");

async function register(username, password) {
  const existingUser = await database
    .getCollection(COLLECTION_NAMES.USERS)
    .findOne({
      username,
    });

  if (existingUser) {
    throw new httpError.UnprocessableEntity(
      `Username '${username}' is already taken`
    );
  }

  const userDetails = buildUser(username, password);
  console.log("userDetails", userDetails);
  await database.getCollection(COLLECTION_NAMES.USERS).insertOne(userDetails);
}

async function login(username, password) {
  const user = await database.getCollection(COLLECTION_NAMES.USERS).findOne({
    username,
    password: encryptPassword(password),
  });

  if (!user) {
    throw new httpError.Unauthorized("Username/Password combo incorrect");
  }

  const token = jwtService.createToken({ username });

  return token;
}

async function getUserFromToken(token) {
  const payload = jwtService.decodeToken(token);

  if (!payload) {
    return null;
  }

  const username = payload.username;
  const user = await database
    .getCollection(COLLECTION_NAMES.USERS)
    .findOne({ username }, { projection: { _id: false, password: false } });

  return user;
}

async function findUsers(criteria) {
  return database
    .getCollection(COLLECTION_NAMES.USERS)
    .find(criteria)
    .toArray();
}

async function changePassword(username, password, newPassword) {
  const user = await database.getCollection(COLLECTION_NAMES.USERS).findOne({
    username,
    password: encryptPassword(password),
  });

  if (!user) {
    throw new httpError.Unauthorized("Username/Password combo incorrect");
  }

  let updatedUser = buildUser(username, newPassword);

  await database
    .getCollection(COLLECTION_NAMES.USERS)
    .updateOne({ username }, { $set: { password: updatedUser.password } });

  const token = jwtService.createToken({ username });

  return token;
}

async function retrieveUserDetails(username) {
  return database
    .getCollection(COLLECTION_NAMES.USERS)
    .findOne({ username: username });
}

async function updatePassword(userDetails, username, password, newPassword) {
  if (userDetails.username !== username) {
    throw new httpError.Unauthorized(
      "Username provided does not match with the username stored in the database."
    );
  }

  if (userDetails.password !== encryptPassword(password)) {
    throw new httpError.Unauthorized(
      "Password doesnot match with the user Password saved in the database."
    );
  }

  await database
    .getCollection(COLLECTION_NAMES.USERS)
    .updateOne(
      { username: userDetails.username },
      { $set: { password: encryptPassword(newPassword) } }
    );
}

module.exports = {
  register,
  login,
  getUserFromToken,
  findUsers,
  changePassword,
  retrieveUserDetails,
  updatePassword,
};

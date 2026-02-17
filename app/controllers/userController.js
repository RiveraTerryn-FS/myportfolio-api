// Get all users
// This is used to return every user in the database
export const getAllUsers = async (req, res, next) => {
  try {
    res.status(200).json(res.results);
  } catch (err) {
    next(err);
  }
};
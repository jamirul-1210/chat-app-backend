import { IUser, User } from "../models/user.model";

/**
 * Create a new user.
 */
export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
  return User.create(data);
};

/**
 * Get a user by ID.
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  return User.findById(userId).select("-password").exec();
};

/**
 * Get a user by Email. with password for authentication
 */
export const findUserByEmailWithPass = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).select("+password");
};

/**
 * Get user by id and update lastseen status
 */

export const updateLastSeen = async (userId: string) => {
  return User.findByIdAndUpdate(
    userId,
    { lastSeen: new Date() },
    { new: true, fields: "-password" } // Exclude the password field
  )
}

/**
 * Get user by id and update avater
 */

export const updateAvatar = async (userId: string, imageName: string) => {
  return User.findByIdAndUpdate(
    userId,
    { avatar: imageName },
    { new: true, fields: "-password" } // Exclude the password field
  )
}


/**
 * Get list of users by name 
 */
export const findUsersByName = async (name:string) => {
  return User.find({ name: { $regex: new RegExp(name, "i") } })
  .select("name _id avatar username") 
  .exec();
};

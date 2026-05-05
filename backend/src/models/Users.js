import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  given_name: {
    type: String,
  },
  family_name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true, // no duplicate emails
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: false, // Optional for social login users
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
  auth0_id: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls
  }
}, { timestamps: true });

const Users = mongoose.model("UsersData", userSchema);

export default Users;

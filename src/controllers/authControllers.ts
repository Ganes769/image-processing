import { generateToken } from "../utils/jwt";
import { comparePasswords, hashPassword } from "../utils/password";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.send({ message: "user cerdentials is required" });
    }

    const hashpassword = await hashPassword(password);
    console.log(hashpassword);

    const token = await generateToken({
      username: username,
      password: hashpassword,
    });
    res.status(200).send({
      message: "user created successfully",
      status: "success",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username)
      return res.status(401).json({ message: "username not found" });

    const isValidPassword = await comparePasswords(password, password);
    if (!isValidPassword)
      return res.status(402).json({ message: "Password is invalid" });
    const token = await generateToken({
      username: username,
    });
  } catch (error) {
    console.log(error);
  }
};

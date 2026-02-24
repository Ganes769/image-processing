import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { users } from "../schema/userSchema";
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

    const exsistingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (exsistingUser) {
      return res.status(400).json({ message: "username already exsist" });
    }
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashpassword,
      })
      .returning();
    const token = await generateToken({
      username: username,
      password: hashpassword,
    });

    return res.status(201).json({
      message: "User created successfully",
      status: "success",
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (!user) {
      return res.status(401).json({ message: "user doen't exsist" });
    }

    if (!username)
      return res.status(401).json({ message: "username not found" });

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword)
      return res.status(402).json({ message: "Password is invalid" });
    const token = await generateToken({
      id: user.id,
      username: user.username,
    });
    return res.json({
      message: "login success",
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: any,
  res: Response,
  next: NextFunction
) => {

  try {

    const authHeader = req.headers.authorization;

    console.log("HEADER =>", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token Missing"
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN =>", token);
    console.log("SECRET =>", process.env.JWT_SECRET);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;

    next();

  } catch (error: any) {

    console.log("JWT ERROR =>", error);

    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};
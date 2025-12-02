/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";

export const formDataParser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body.data === "string") {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in 'data' field" });
    }
  }
  next();
};

import jwt from "jsonwebtoken"; 
export const generateToken = (user) => {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });


  return token;
};

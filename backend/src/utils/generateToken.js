import jwt from "jsonwebtoken"; 
export const generateToken = (user, res) => {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });


  return token;
};

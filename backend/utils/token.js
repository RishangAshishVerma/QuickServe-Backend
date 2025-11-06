import jwt from "jsonwebtoken";

const genToken = (userId, role) => {
    try {
        const token = jwt.sign(
            { userId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return token;
    } catch (error) {
        console.error(`Error while generating the token: ${error}`);
        throw new Error("Failed to generate token");
    }
};

export default genToken;

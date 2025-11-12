const authorizeRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({
                    success: false,
                    message: "User role not found. Please log in again.",
                });
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this .",
                });
            }

            next();
        } catch (error) {
            console.error("Error in authorizeRole middleware:", error);
            res.status(500).json({
                success: false,
                message: "Server error during authorization.",
            });
        }
    };
};

export default authorizeRole;

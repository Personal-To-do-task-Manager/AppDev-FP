const jsonWebToken = require('jsonwebtoken');

module.exports = (incomingRequest, serverResponse, proceedToNextLogic) => {
    const authorizationHeader = incomingRequest.header('Authorization');
    const sessionToken = authorizationHeader && authorizationHeader.split(" ")[1];

    if (!sessionToken) {
        return serverResponse.status(401).json({ 
            message: 'Authentication failed: No token provided.' 
        });
    }

    try {
        const decodedTokenData = jsonWebToken.verify(sessionToken, process.env.JWT_SECRET);
        incomingRequest.user = decodedTokenData;
        proceedToNextLogic();
    } catch (tokenValidationError) { 
        serverResponse.status(401).json({ 
            message: 'Security Alert: Invalid or expired session.' 
        }); 
    }
};
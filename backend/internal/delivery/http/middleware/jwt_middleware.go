package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rafif/healy-backend/pkg/jwt"
)

// JWTAuth returns a Gin middleware that validates Bearer tokens.
// On success, it injects "user_id" and "username" into the context.
func JWTAuth(tokenGenerator jwt.TokenGenerator) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Extract Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "missing Authorization header",
			})
			return
		}

		// 2. Expect "Bearer <token>" format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid Authorization format, expected: Bearer <token>",
			})
			return
		}

		tokenStr := parts[1]

		// 3. Validate token using the existing pkg/jwt.ValidateToken
		claims, err := tokenGenerator.ValidateToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired token",
			})
			return
		}

		// 4. Extract claims and inject into Gin context
		if userID, ok := (*claims)["user_id"]; ok {
			c.Set("user_id", userID)
		}
		if username, ok := (*claims)["username"]; ok {
			c.Set("username", username)
		}

		c.Next()
	}
}

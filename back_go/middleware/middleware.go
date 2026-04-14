package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"untamo_server.zzz/database"
	"untamo_server.zzz/models/user"
)

type AuthMiddleware struct {
	DB *database.Database
}

func NewAuthMiddleware(db *database.Database) *AuthMiddleware {
	return &AuthMiddleware{DB: db}
}

func (m *AuthMiddleware) RequireSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		sess, _ := (*m.DB).GetSessionFromHeader(c.Request)
		if sess == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}
		c.Set("session", sess)
		c.Next()
	}
}

func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		adminSession, userInSession := (*m.DB).GetAdminSessionFromHeader(c.Request)
		if adminSession == nil || userInSession == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}
		c.Set("adminSession", adminSession)
		c.Set("user", userInSession)
		c.Next()
	}
}

func (m *AuthMiddleware) RequireOwner() gin.HandlerFunc {
	return func(c *gin.Context) {
		adminSession, userInSession := (*m.DB).GetAdminSessionFromHeader(c.Request)
		if adminSession == nil || userInSession == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}
		if !userInSession.Owner {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}
		c.Set("adminSession", adminSession)
		c.Set("user", userInSession)
		c.Next()
	}
}

func GetUserFromContext(c *gin.Context) *user.User {
	usr, exists := c.Get("user")
	if !exists {
		return nil
	}
	return usr.(*user.User)
}


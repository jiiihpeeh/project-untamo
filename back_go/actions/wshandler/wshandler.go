package wshandler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/db/mongoDB"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Action(c *gin.Context, client *mongo.Client) {
	token := c.Param("token")
	//get session from db
	session, user := mongoDB.GetSession(token, client)
	// if action is not found, return
	if session == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}
	fmt.Println("session found")
	// if user is not found, return
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	conn, err := wsupgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set websocket upgrade"})
		return
	}
	//defer conn.Close()
	fmt.Println("websocket connection established")
	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read message"})
			return
		}
		if string(msg) == "ping" {
			msg = []byte("pong")
		}
		err = conn.WriteMessage(mt, msg)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write message"})
			return
		}
	}
}

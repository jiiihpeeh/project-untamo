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
	CheckOrigin: func(r *http.Request) bool {
		fmt.Println("check origin")
		origin := r.Header.Get("Origin")
		fmt.Println("origin: ", origin)
		//check if origin is localhost or not

		return true
	},
}

func Action(c *gin.Context, client *mongo.Client) {
	fmt.Println("websocket handler")
	wsToken := c.Param("token")
	fmt.Println("wsToken: ", wsToken)
	//get session from db
	session, user := mongoDB.GetUserAndSessionFromWsToken(wsToken, client)
	// if action is not found, return
	if session == nil {
		//c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		fmt.Println("session not found")
		return
	}
	fmt.Println("session found")

	// if user is not found, return
	if user == nil {
		//c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		fmt.Println("user not found")
		return
	}
	fmt.Println("user found")
	origin := c.Request.Header.Get("Origin")
	fmt.Println("origin: ", origin)
	conn, err := wsupgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println(err)
		//c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set websocket upgrade"})
		return
	}
	defer conn.Close()
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
		fmt.Printf("message received: %s\n", msg)
		err = conn.WriteMessage(mt, msg)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write message"})
			return
		}
	}
}

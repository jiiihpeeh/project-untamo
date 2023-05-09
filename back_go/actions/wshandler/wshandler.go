package wshandler

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/db/mongoDB"
)

// var upgrader = websocket.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool {
// 		return true // Accepting all requests
// 	},
// }

type WsServer struct {
	tokenConnection map[string]*websocket.Conn
	userTokens      map[string][]string
	clients         map[*websocket.Conn]bool
	//handleMessage   func(message []byte) // New message handler
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Accepting all requests
	},
}

var WsServing = WsServer{
	tokenConnection: make(map[string]*websocket.Conn),
	userTokens:      make(map[string][]string),
	clients:         make(map[*websocket.Conn]bool),
	//handleMessage: messageHandler,
}

var hashMapMutex = &sync.Mutex{}

func (server *WsServer) echo(w http.ResponseWriter, r *http.Request, token string, userID string) {

	connection, _ := upgrader.Upgrade(w, r, nil)
	//mutex.Lock()
	hashMapMutex.Lock()
	//close  token connection
	if server.tokenConnection[token] != nil {
		server.tokenConnection[token].Close()
	}

	server.tokenConnection[token] = connection
	server.userTokens[userID] = unique(append(server.userTokens[userID], token))
	server.clients[connection] = true // Save the connection using it as a key
	//fmt.Println(server.userTokens[userID])
	hashMapMutex.Unlock()
	for {
		mt, _, err := connection.ReadMessage()

		if err != nil || mt == websocket.CloseMessage {
			break // Exit the loop if the client tries to close the connection or the connection is interrupted
		}
		if mt == websocket.PingMessage {
			hashMapMutex.Lock()
			connection.WriteMessage(websocket.PongMessage, []byte{})
			hashMapMutex.Unlock()
		}

	}

}

// uniques items in array
func unique(items []string) []string {
	encountered := map[string]bool{}
	result := []string{}

	for v := range items {
		if encountered[items[v]] == true {
			// Do not add duplicate item
		} else {
			// Record this element as an encountered element.
			encountered[items[v]] = true
			// Append to result slice.
			result = append(result, items[v])
		}
	}
	// Return the new slice.
	return result
}

func (server *WsServer) ServeMessage(userId string, token string, message []byte) {
	//fmt.Println("sending message: ", message)
	hashMapMutex.Lock()
	tokens := WsServing.userTokens[userId]
	//unique tokens
	tokens = unique(tokens)
	//set user tokens
	server.userTokens[userId] = tokens

	for _, tokenM := range tokens {
		//fmt.Println("loop token: ", tokenM)
		if tokenM != token {
			conn := server.tokenConnection[tokenM]
			if conn == nil {
				fmt.Println("conn is nil")
				continue
			}
			conn.WriteMessage(websocket.TextMessage, message)
		}
	}
	hashMapMutex.Unlock()
}

// func messageHandler(message []byte) {
// 	fmt.Println(string(message))
// 	//WsServing.WriteMessage(message)
// }

func Action(c *gin.Context, client *mongo.Client) {
	//fmt.Println("websocket handler CALLED")
	//sleep 15 milliseconds
	time.Sleep(15 * time.Millisecond)
	//cons := wsConnections.WsConnectionsMutex

	//fmt.Println("websocket handler")
	wsToken := c.Param("token")

	//fmt.Println("wsToken: ", wsToken)
	//get session from db
	session, user := mongoDB.GetUserAndSessionFromWsToken(wsToken, client)
	// if action is not found, return
	if session == nil {
		//	fmt.Println("session not found")
		return
	}
	//fmt.Println("session found")

	if user == nil {
		//	fmt.Println("user not found")
		return
	}
	WsServing.echo(c.Writer, c.Request, wsToken, user.ID.Hex())

}

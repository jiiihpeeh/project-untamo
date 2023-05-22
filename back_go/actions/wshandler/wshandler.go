package wshandler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/thoas/go-funk"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/models/register"
	"untamo_server.zzz/utils/token"
)

type WsServer struct {
	tokenConnection map[string]*websocket.Conn
	userTokens      map[string][]string
	tokenReady      map[string]bool
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Accepting all requests
	},
}

var WsServing = WsServer{
	tokenConnection: make(map[string]*websocket.Conn),
	userTokens:      make(map[string][]string),
	tokenReady:      make(map[string]bool),
}

var hashMapMutex = &sync.Mutex{}

func (server *WsServer) echo(w http.ResponseWriter, r *http.Request, token string, userID string, wsPair string) {
	connection, _ := upgrader.Upgrade(w, r, nil)
	hashMapMutex.Lock()
	if server.tokenConnection[token] != nil {
		server.tokenConnection[token].Close()
	}

	server.tokenConnection[token] = connection
	server.userTokens[userID] = funk.UniqString(append(server.userTokens[userID], token))
	server.tokenReady[token] = false
	//server.clients[connection] = true // Save the connection using it as a key
	//log.Println(server.userTokens[userID])
	hashMapMutex.Unlock()
	for {
		mt, msg, err := connection.ReadMessage()
		if err != nil || mt == websocket.CloseMessage {
			break // Exit the loop if the client tries to close the connection or the connection is interrupted
		}
		if mt == websocket.PingMessage {
			hashMapMutex.Lock()
			connection.WriteMessage(websocket.PongMessage, []byte{})
			hashMapMutex.Unlock()
		}
		if mt == websocket.TextMessage {
			hashMapMutex.Lock()
			if string(msg) == wsPair {
				server.tokenReady[token] = true
			}
			hashMapMutex.Unlock()
		}
	}
	hashMapMutex.Lock()
	//delete(server.clients, connection)
	delete(server.tokenConnection, token)
	//remove token from userTokens
	tokens := server.userTokens[userID]
	//remove token from tokens
	tokens = funk.FilterString(tokens, func(tokenM string) bool {
		return token != tokenM
	})
	//set user tokens
	server.userTokens[userID] = tokens
	//remove tokenScrambler
	delete(server.tokenReady, token)
	hashMapMutex.Unlock()
}

// send ping to all clients every 8 seconds
func Ping() {
	for {
		hashMapMutex.Lock()
		//get all tokens

		for _, conn := range WsServing.tokenConnection {
			go func() {
				hashMapMutex.Lock()
				conn.WriteMessage(websocket.PingMessage, []byte{})
				hashMapMutex.Unlock()
			}()
		}
		hashMapMutex.Unlock()
		time.Sleep(8 * time.Second)
	}
}

func (server *WsServer) ServeMessage(userId string, token string, message []byte) {
	//fmt.Println("sending message: ", message)
	hashMapMutex.Lock()

	tokens := WsServing.userTokens[userId]
	//unique tokens
	tokens = funk.UniqString(tokens)
	//set user tokens
	server.userTokens[userId] = tokens
	for _, tokenM := range tokens {
		if tokenM != token && server.tokenReady[tokenM] {
			conn := server.tokenConnection[tokenM]
			if conn == nil {
				log.Println("conn is nil")
				continue
			}
			go func() {
				hashMapMutex.Lock()
				conn.WriteMessage(websocket.TextMessage, message)
				hashMapMutex.Unlock()
			}()
		}
	}
	hashMapMutex.Unlock()
}

func (server *WsServer) Disconnect(token string) {
	hashMapMutex.Lock()
	conn := server.tokenConnection[token]
	if conn != nil {
		conn.Close()
	}
	//get userID from token from userTokens by iterating over userTokens
	for userID, tokens := range server.userTokens {
		for _, tokenM := range tokens {
			if tokenM == token {
				//remove token from userTokens
				tokens = funk.FilterString(tokens, func(tokenM string) bool {
					return token != tokenM
				})
				//set user tokens
				server.userTokens[userID] = tokens
				break
			}
		}
	}

	delete(server.tokenConnection, token)
	hashMapMutex.Unlock()
}

func Action(c *gin.Context, client *mongo.Client) {
	//log.Println("websocket handler CALLED")
	//sleep 15 milliseconds
	time.Sleep(15 * time.Millisecond)
	wsToken := c.Param("token")
	//check that token is long enough
	if len(wsToken) < int(token.WsTokenStringLength) {
		return
	}
	//get session from db
	session, user := mongoDB.GetUserAndSessionFromWsToken(wsToken, client)
	// if action is not found, return
	if session == nil {
		return
	}
	if user == nil {
		return
	}
	WsServing.echo(c.Writer, c.Request, wsToken, user.ID.Hex(), session.WsPair)

}

func Register(c *gin.Context, client *mongo.Client) {
	//log.Println("websocket handler CALLED")
	//sleep 15 milliseconds
	time.Sleep(15 * time.Millisecond)
	connection, _ := upgrader.Upgrade(c.Writer, c.Request, nil)
	for {
		mt, msg, err := connection.ReadMessage()
		if err != nil || mt == websocket.CloseMessage {
			break // Exit the loop if the client tries to close the connection or the connection is interrupted
		}
		if mt == websocket.PingMessage {
			connection.WriteMessage(websocket.PongMessage, []byte{})
		}
		if mt == websocket.TextMessage {
			registerRequest := register.FromJsonWs(msg)
			//check email using CheckEmail
			registerMsg := registerRequest.HandleMessage()
			emailRegEx := registerRequest.CheckEmail()
			if !emailRegEx {
				registerMsg.FormPass = false
				registerMsg.FeedBack = append(registerMsg.FeedBack, "Email is not valid")
			}
			if registerMsg.FormPass {
				if mongoDB.CheckEmail(registerRequest.Email, client) {
					registerMsg.FormPass = false
					registerMsg.FeedBack = append(registerMsg.FeedBack, "Email is already in use")
				}
			}
			msgOut, _ := json.Marshal(registerMsg)

			connection.WriteMessage(websocket.TextMessage, msgOut)
		}
	}
}

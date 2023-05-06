package wsConnections

import (
	"sync"

	"github.com/gorilla/websocket"
)

type WsConnectionStruct struct {
	//hashmap of connections
	TokenConnections map[string]*websocket.Conn
	//hashmap of tokens
	UserToken map[string][]string
	TokenUser map[string]string
}

// AddConnection adds connection to hashmap
func (ws *WsConnectionStruct) AddConnection(token string, user string, conn *websocket.Conn) {
	//add connection to hashmap
	ws.TokenConnections[token] = conn
	//add token to hashmap
	ws.TokenUser[token] = user
	//add user to hashmap
	ws.UserToken[user] = append(ws.UserToken[user], token)
}

// RemoveConnection removes connection from hashmap
func (ws *WsConnectionStruct) RemoveConnection(token string) {
	//remove connection from hashmap
	delete(ws.TokenConnections, token)
	//remove token from hashmap
	delete(ws.TokenUser, token)
	//remove user from hashmap
	delete(ws.UserToken, ws.TokenUser[token])
}

// get  user connections exclude token //as  iterator
func (ws *WsConnectionStruct) GetUserConnectionsExcludeToken(token string) []*websocket.Conn {
	var connections []*websocket.Conn
	for _, conn := range ws.TokenConnections {
		if conn != ws.TokenConnections[token] {
			connections = append(connections, conn)
		}
	}
	return connections
}

// check if connection exits per token
func (ws *WsConnectionStruct) IsTokenConnected(token string) bool {
	_, ok := ws.TokenConnections[token]
	return ok
}

var WsConnections = WsConnectionStruct{}

// mutex for connections
var WsConnectionsMutex = &sync.Mutex{}

// var tokenSocket = make(map[string]*websocket.Conn)
// var userToken = make(map[string]string)

// // mutex for connections
// var ConnectionsMutex = &sync.Mutex{}

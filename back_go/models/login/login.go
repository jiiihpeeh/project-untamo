package login

type LogInResponse struct {
	Token      string `json:"token"`
	WsToken    string `json:"wsToken"`
	Email      string `json:"email"`
	ScreenName string `json:"screenName"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	Admin      bool   `json:"admin"`
	Owner      bool   `json:"owner"`
	Active     bool   `json:"active"`
	Time       int64  `json:"time"`
	WsPair     string `json:"wsPair"`
}

type LogInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshToken struct {
	Token   string `json:"token"`
	Time    int64  `json:"time"`
	WsToKen string `json:"wsToken"`
	WsPair  string `json:"wsPair"`
}

package login

type LogInResponse struct {
	Token      string `json:"token"`
	Email      string `json:"email"`
	ScreenName string `json:"screenName"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	Admin      bool   `json:"admin"`
	Owner      bool   `json:"owner"`
	Time       int64  `json:"time"`
}

type LogInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshToken struct {
	Token string `json:"token"`
	Time  int64  `json:"time"`
}

package register

import (
	"encoding/json"
	"log"
	"regexp"
	"strings"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"github.com/trustelem/zxcvbn"
)

var EmailRegexp = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

const (
	MaxPasswordSimilarity = 0.8
)

const (
	MinimumGuesses = 1e9
)

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Question  string `json:"question"`
}

type RegisterWsResponse struct {
	FormPass      bool     `json:"formPass"`
	ServerMinimum float64  `json:"serverMinimum"`
	Guesses       float64  `json:"guesses"`
	Score         int      `json:"score"`
	FeedBack      []string `json:"feedBack"`
}

type ZXVBN struct {
	Guesses       float64 `json:"guesses"`
	Score         int     `json:"score"`
	ServerMinimum float64 `json:"serverMinimum"`
}

type ActivationRequest struct {
	Verification string `json:"verification"`
	Accepted     bool   `json:"accepted"`
	Captcha      string `json:"captcha"`
}

func (r *RegisterRequest) FormScreenName() string {
	if r.FirstName == "" && r.LastName == "" {
		split := r.Email[:strings.Index(r.Email, "@")]
		return split
	}
	return r.FirstName + " " + r.LastName
}

// check using regex that email is valid
func (r *RegisterRequest) CheckEmail() bool {
	//use regex library to check r.Email using emailRegexp
	return EmailRegexp.MatchString(r.Email)
}

// convert leet speak string to normal string
func LeetSpeak(s string) string {
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case '0':
			s = s[:i] + "o" + s[i+1:]
		case '1':
			s = s[:i] + "i" + s[i+1:]
		case '3':
			s = s[:i] + "e" + s[i+1:]
		case '4':
			s = s[:i] + "a" + s[i+1:]
		case '5':
			s = s[:i] + "s" + s[i+1:]
		case '7':
			s = s[:i] + "t" + s[i+1:]
		case '8':
			s = s[:i] + "b" + s[i+1:]
		case '9':
			s = s[:i] + "g" + s[i+1:]
		}
	}
	return s
}

// using fuzzy string matching to check that password is strong
func (r *RegisterRequest) CheckPassword() bool {
	password := strings.ToLower(r.Password)
	passwordLeet := LeetSpeak(password)
	//lowercase fields into an array
	lowerFields := []string{strings.ToLower(r.Email), strings.ToLower(r.FirstName), strings.ToLower(r.LastName)}
	//split email at @ and append to lowerFields by lowercasing
	split := strings.Split(r.Email, "@")
	lowerFields = append(lowerFields, strings.ToLower(split[0]))
	//combine first and last name and append to lowerFields by lowercasing
	lowerFields = append(lowerFields, strings.ToLower(r.FirstName+r.LastName))
	//combine last and first name and append to lowerFields by lowercasing
	lowerFields = append(lowerFields, strings.ToLower(r.LastName+" "+r.FirstName))
	//loop through array and check similarity
	for _, field := range lowerFields {
		scoreNorm := strutil.Similarity(password, field, metrics.NewLevenshtein())
		if scoreNorm > MaxPasswordSimilarity {
			return false
		}
		scoreLeet := strutil.Similarity(passwordLeet, field, metrics.NewLevenshtein())
		if scoreLeet > MaxPasswordSimilarity {
			return false
		}
	}
	return true
}

//func demarshal RegisterWsRequest

func Estimate(password string) ZXVBN {
	estimate := zxcvbn.PasswordStrength(password, nil)
	zxvbn := ZXVBN{
		Guesses:       estimate.Guesses,
		Score:         estimate.Score,
		ServerMinimum: MinimumGuesses,
	}
	return zxvbn
}
func FromJsonWs(msg []byte) RegisterRequest {
	var r RegisterRequest
	err := json.Unmarshal([]byte(msg), &r)
	if err != nil {
		log.Println(err)
	}
	return r
}

func (message *RegisterRequest) HandleMessage() RegisterWsResponse {

	//log.Println("HandleMessage: ", message)
	messageResponse := RegisterWsResponse{}

	//convert to registerRequest
	registerRequest := RegisterRequest{
		Email:     message.Email,
		Password:  message.Password,
		FirstName: message.FirstName,
		LastName:  message.LastName,
	}
	//check password using CheckPassword
	passwordCheck := registerRequest.CheckPassword()
	//form RegisterWsFormResponse
	messageResponse.FormPass = passwordCheck

	//zxcvbn password strength from Password field
	estimate := Estimate(message.Password)
	//form RegisterWsPasswordResponse
	messageResponse.Guesses = estimate.Guesses
	messageResponse.Score = estimate.Score
	messageResponse.ServerMinimum = estimate.ServerMinimum
	if len(message.Password) < 6 {
		messageResponse.FeedBack = append(messageResponse.FeedBack, "Password must be at least 6 characters long")
		messageResponse.FormPass = false
	}
	if messageResponse.Guesses < messageResponse.ServerMinimum {
		messageResponse.FeedBack = append(messageResponse.FeedBack, "Password is too weak")
		messageResponse.FormPass = false
	}
	if messageResponse.Score < 3 {
		messageResponse.FeedBack = append(messageResponse.FeedBack, "Password is too weak")
		messageResponse.FormPass = false
	}

	return messageResponse
}

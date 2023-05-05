package register

import (
	"regexp"
	"strings"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
)

var emailRegexp = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

func (r *RegisterRequest) FormScreenName() string {
	if r.FirstName == "" && r.LastName == "" {
		// split email at @
		split := r.Email[:strings.Index(r.Email, "@")]
		//take the first part
		return split
	}
	return r.FirstName + " " + r.LastName
}

// check using regex that email is valid
func (r *RegisterRequest) CheckEmail() bool {
	//use regex library to check r.Email using emailRegexp
	return emailRegexp.MatchString(r.Email)
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
		if scoreNorm > 0.8 {
			return false
		}
		scoreLeet := strutil.Similarity(passwordLeet, field, metrics.NewLevenshtein())
		if scoreLeet > 0.8 {
			return false
		}
	}
	return true
}

package user

import (
	"strings"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"untamo_server.zzz/models/register"
)

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Email      string             `bson:"email,omitempty"`
	FirstName  string             `bson:"first_name,omitempty"`
	LastName   string             `bson:"last_name,omitempty"`
	ScreenName string             `bson:"screen_name,omitempty"`
	Admin      bool               `bson:"admin,omitempty"`
	Owner      bool               `bson:"owner,omitempty"`
	Active     bool               `bson:"active,omitempty"`
	Password   string             `bson:"password,omitempty"`
}

type UserOut struct {
	User   string `json:"user"`
	Email  string `json:"email"`
	Active bool   `json:"active"`
	Admin  bool   `json:"admin"`
	Owner  bool   `json:"owner"`
}

func (u *User) ToUserOut() *UserOut {
	return &UserOut{
		User:   u.ID.Hex(),
		Email:  u.Email,
		Active: u.Active,
		Admin:  u.Admin,
		Owner:  u.Owner,
	}
}

type EditUser struct {
	Email           string `json:"email"`
	FirstName       string `json:"firstName"`
	LastName        string `json:"lastName"`
	ScreenName      string `json:"screenName"`
	Password        string `json:"password:omitempty"`
	ConfirmPassword string `json:"confirmPassword"`
}

// email is valid
func (u *EditUser) CheckEmail() bool {
	return register.EmailRegexp.MatchString(u.Email)
}

func (r *EditUser) CheckPassword() bool {
	password := strings.ToLower(r.Password)
	passwordLeet := register.LeetSpeak(password)
	//lowercase fields into an array
	lowerFields := []string{strings.ToLower(r.Email), strings.ToLower(r.FirstName), strings.ToLower(r.LastName), strings.ToLower(r.ScreenName)}
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
		if scoreNorm > register.MaxPasswordSimilarity {
			return false
		}
		scoreLeet := strutil.Similarity(passwordLeet, field, metrics.NewLevenshtein())
		if scoreLeet > register.MaxPasswordSimilarity {
			return false
		}
	}
	return true
}

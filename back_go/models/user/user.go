package user

import (
	"strings"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"github.com/oklog/ulid"
	"untamo_server.zzz/models/register"
)

type User struct {
	ID                       ulid.ULID `bson:"_id,omitempty" json:"-"`
	Email                    string    `bson:"email" json:"email"`
	FirstName                string    `bson:"first_name,omitempty" json:"firstName"`
	LastName                 string    `bson:"last_name,omitempty" json:"lastName"`
	ScreenName               string    `bson:"screen_name" json:"screenName"`
	Admin                    bool      `bson:"admin" json:"admin"`
	Owner                    bool      `bson:"owner" json:"owner"`
	Active                   bool      `bson:"active" json:"active"`
	Password                 string    `bson:"password" json:"password"`
	Activate                 string    `bson:"activate,omitempty" json:"activate"`
	Registered               int64     `bson:"registered,omitempty" json:"registered"`
	PasswordResetRequestTime int64     `bson:"password_reset_request_time,omitempty" json:"passwordResetRequestTime"`
	PasswordResetToken       string    `bson:"password_reset_token,omitempty" json:"passwordResetToken"`
}

type UserOut struct {
	User       string `json:"user"`
	Email      string `json:"email"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	ScreenName string `json:"screenName"`
	Active     bool   `json:"active"`
	Admin      bool   `json:"admin"`
	Owner      bool   `json:"owner"`
	Registered int64  `json:"registered"`
}

func (u *User) ToUserOut() UserOut {
	return UserOut{
		User:       u.ID.String(),
		Email:      u.Email,
		FirstName:  u.FirstName,
		LastName:   u.LastName,
		ScreenName: u.ScreenName,
		Active:     u.Active,
		Admin:      u.Admin,
		Owner:      u.Owner,
		Registered: u.Registered,
	}
}

type EditUser struct {
	Email          string `json:"email"`
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	ScreenName     string `json:"screenName"`
	Password       string `json:"password"`
	ChangePassword string `json:"changePassword:omitempty"`
}

type ResetPasswordRequest struct {
	PasswordResetToken string `json:"passwordResetToken"`
	Email              string `json:"email"`
	Password           string `json:"password"`
	ConfirmPassword    string `json:"confirmPassword"`
}

type CardColors struct {
	Inactive   string `json:"inactive"`
	Even       string `json:"even"`
	Odd        string `json:"odd"`
	Background string `json:"background"`
}

type WebColors map[string]CardColors

func (u *EditUser) CheckEmail() bool {
	return register.EmailRegexp.MatchString(u.Email)
}

func (r *EditUser) CheckPassword() bool {
	password := strings.ToLower(r.Password)
	passwordLeet := register.LeetSpeak(password)
	lowerFields := []string{strings.ToLower(r.Email), strings.ToLower(r.FirstName), strings.ToLower(r.LastName), strings.ToLower(r.ScreenName)}
	split := strings.Split(r.Email, "@")
	lowerFields = append(lowerFields, strings.ToLower(split[0]))
	lowerFields = append(lowerFields, strings.ToLower(r.FirstName+r.LastName))
	lowerFields = append(lowerFields, strings.ToLower(r.LastName+" "+r.FirstName))
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

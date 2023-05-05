package user

import "go.mongodb.org/mongo-driver/bson/primitive"

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

// convery user to userout
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

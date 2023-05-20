package email

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Email struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	User    string             `bson:"user"`
	Success bool               `bson:"success"`
	Time    int64              `bson:"time"`
	Subject string             `bson:"subject"`
	Body    string             `bson:"body"`
}

// type loginAuth struct {
// 	username, password string
// }

// func LoginAuth(username, password string) smtp.Auth {
// 	return &loginAuth{username, password}
// }

// func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
// 	return "LOGIN", []byte{}, nil
// }

// func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
// 	if more {
// 		switch string(fromServer) {
// 		case "Username:":
// 			return []byte(a.username), nil
// 		case "Password:":
// 			return []byte(a.password), nil
// 		default:
// 			return nil, errors.New("unknown fromServer")
// 		}
// 	}
// 	return nil, nil
// }

// func SendEmail(subject string, body string, to []string) {
// 	// Choose auth method and set it up
// 	//get appConfigMutex
// 	mut := appconfig.AppConfigurationMutex
// 	mut.Lock()
// 	config := appconfig.AppConfiguration
// 	mut.Unlock()
// 	var auth smtp.Auth
// 	if config.EmailPlainAuth {
// 		auth = smtp.PlainAuth(config.EmailIdentity, config.Email, config.Password, config.EmailServer)
// 	} else {
// 		auth = LoginAuth(config.Email, config.Password)
// 	}
// 	address := config.EmailServer + ":" + fmt.Sprint(config.EmailPort)
// 	// Here we do it all: connect to our server, set up a message and send it
// 	msg := []byte("Subject:" + subject + "\n" + body)
// 	err := smtp.SendMail(address, auth, config.EmailServer, to, msg)
// 	if err != nil {
// 		log.Println(err)
// 	}
// }

// func (email *Email) SendEmail() {
// 	// Choose auth method and set it up
// 	//get appConfigMutex
// 	// mut := appconfig.AppConfigurationMutex
// 	// mut.Lock()
// 	// config := appconfig.AppConfiguration
// 	// mut.Unlock()
// 	// var auth smtp.Auth
// 	// if config.EmailPlainAuth {
// 	// 	auth = smtp.PlainAuth(config.EmailIdentity, config.Email, config.Password, config.EmailServer)
// 	// } else {
// 	// 	auth = LoginAuth(config.Email, config.Password)
// 	// }
// 	// address := config.EmailServer + ":" + fmt.Sprint(config.EmailPort)
// 	// // Here we do it all: connect to our server, set up a message and send it
// 	// msg := []byte("Subject:" + email.Subject + "\n" + email.Body)
// 	// err := smtp.SendMail(address, auth, config.EmailServer, []string{email.User}, msg)
// 	// email.Success = err == nil
// 	emailer.SendEmail(email.Subject, email.Body, []string{email.User})
// }

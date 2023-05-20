package emailer

import (
	"errors"
	"fmt"
	"net/smtp"

	"untamo_server.zzz/models/email"
	"untamo_server.zzz/utils/appconfig"
)

type loginAuth struct {
	username, password string
}

func LoginAuth(username, password string) smtp.Auth {
	return &loginAuth{username, password}
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", []byte{}, nil
}

func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
	if more {
		switch string(fromServer) {
		case "Username:":
			return []byte(a.username), nil
		case "Password:":
			return []byte(a.password), nil
		default:
			return nil, errors.New("unknown fromServer")
		}
	}
	return nil, nil
}

func SendEmail(email *email.Email) bool {
	// Choose auth method and set it up
	//get appConfigMutex
	mut := appconfig.AppConfigurationMutex
	mut.Lock()
	config := appconfig.AppConfiguration
	mut.Unlock()
	var auth smtp.Auth
	if config.EmailPlainAuth {
		auth = smtp.PlainAuth(config.EmailIdentity, config.Email, config.Password, config.EmailServer)
	} else {
		auth = LoginAuth(config.Email, config.Password)
	}
	address := config.EmailServer + ":" + fmt.Sprint(config.EmailPort)
	// Here we do it all: connect to our server, set up a message and send it
	msg := []byte("Subject:" + email.Subject + "\n" + email.Body)
	err := smtp.SendMail(address, auth, config.EmailServer, []string{email.User}, msg)
	return err == nil
}

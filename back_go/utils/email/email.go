package email

import (
	"log"
	"net/smtp"
)

// send email using smtp
func SendEmail(email string, subject string, body string) {
	from := "email address"
	pass := "email password"
	to := email
	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body
	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))
	if err != nil {
		log.Printf("smtp error: %s", err)
		return
	}
	log.Printf("sent, visit %s\n", email)
}

package checkers

import (
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/utils/emailer"
)

//send unsent emails to users every 5 minutes

func sendDelete(email *email.Email, client *mongo.Client) {
	result := emailer.SendEmail(email)
	//if email sent, remove email from db
	if result {
		mongoDB.DeleteEmail(email.ID, client)
	}
}

func SendUnsentEmails(client *mongo.Client) {
	//loop every 5 minutes
	for {
		emails := mongoDB.GetEmails(client)
		//send emails
		for _, email := range emails {
			go sendDelete(email, client)
		}
		time.Sleep(5 * time.Minute)
	}
}

func RemoveOldSessions(client *mongo.Client) {
	for {
		time.Sleep(30 * time.Minute)
		mongoDB.RemoveOldSessions(client)
		time.Sleep(24 * time.Hour)
	}
}

func RemoveAlarmsWithNoDevices(client *mongo.Client) {
	for {
		time.Sleep(15 * time.Minute)
		mongoDB.RemoveAlarmsWithNoDevices(client)
		time.Sleep(24 * time.Hour)
	}
}

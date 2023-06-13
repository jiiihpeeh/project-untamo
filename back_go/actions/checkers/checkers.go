package checkers

import (
	"time"

	"untamo_server.zzz/database"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/utils/emailer"
)

//send unsent emails to users every 5 minutes

func sendDelete(email *email.Email, db *database.Database) {
	result := emailer.SendEmail(email)
	//if email sent, remove email from db
	if result {
		(*db).DeleteEmail(email.MongoID.Hex())
	}
}

func SendUnsentEmails(db *database.Database) {
	//loop every 5 minutes
	for {
		emails := (*db).GetEmails()
		//send emails
		for _, email := range emails {
			go sendDelete(email, db)
		}
		time.Sleep(5 * time.Minute)
	}
}

func RemoveOldSessions(db *database.Database) {
	for {
		time.Sleep(30 * time.Minute)
		(*db).RemoveOldSessions()
		time.Sleep(24 * time.Hour)
	}
}

func RemoveAlarmsWithNoDevices(db *database.Database) {
	for {
		time.Sleep(15 * time.Minute)
		(*db).RemoveAlarmsWithNoDevices()
		time.Sleep(24 * time.Hour)
	}
}

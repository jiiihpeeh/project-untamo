package appconfig

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"sync"

	"github.com/denisbrodbeck/machineid"
	"github.com/manifoldco/promptui"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/sha3"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/models/register"
	"untamo_server.zzz/models/user"

	"untamo_server.zzz/utils/hash"
)

const AppKey = "Untamo-AlarmClock"

var AppConfiguration *AppConfig
var AppConfigurationMutex = &sync.Mutex{}

type LaunchConfig struct {
	OwnerID       string `json:"ownerId"`
	UserDB        string `json:"userDb"`
	PasswordDB    string `json:"passwordDb"`
	UrlDB         string `json:"urlDB"`
	CustomURI     string `json:"customUri"`
	UseCustomURI  bool   `json:"useCustomUri"`
	ActivateAuto  bool   `json:"activateAuto"`
	ActivateEmail bool   `json:"activateEmail"`
}

type OwnerConfig struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	EmailPort   string `json:"emailPort"`
	EmailServer string `json:"emailServer"`
	EmailTLS    bool   `json:"emailTLS"`
}
type AppConfig struct {
	OwnerID       string `json:"ownerId"`
	UrlDB         string `json:"urlDB"`
	CustomURI     string `json:"customUri"`
	UserDB        string `json:"userDb"`
	UseCustomURI  bool   `json:"useCustomUri"`
	PasswordDB    string `json:"passwordDb"`
	Email         string `json:"email"`
	Password      string `json:"password"`
	EmailPort     string `json:"emailPort"`
	EmailServer   string `json:"emailServer"`
	EmailTLS      bool   `json:"emailTLS"`
	ActivateAuto  bool   `json:"activateAuto"`
	ActivateEmail bool   `json:"activateEmail"`
}

func getAppMachineKey() ([]byte, error) {
	machine, err := machineid.ID()
	if err != nil {
		return []byte{}, err
	}
	hash := sha3.Sum256([]byte(AppKey + machine))
	return hash[:], nil
}

func getAppOwnerMachineKey(ownerId string) ([]byte, error) {
	machine, err := machineid.ID()

	if err != nil {
		return []byte{}, err
	}
	hash := sha3.Sum256([]byte(AppKey + machine + ownerId))
	return hash[:], nil
}

func GetConfig() (*AppConfig, error) {
	if !FoundConfig() {
		return &AppConfig{}, errors.New("config file not found")
	}
	//get encrypted owner id from config file

	//read config file to memory
	config := AppConfig{}
	contentEnc, err := ioutil.ReadFile("app.cfg")
	if err != nil {
		return &config, err
	}
	//decrypt config file using getAppMachineKey as key
	appKey, err := getAppMachineKey()
	if err != nil {
		return &config, err
	}
	content := aesDecrypt(contentEnc, appKey)
	//unmarshal config file
	var appConfig AppConfig
	err = json.Unmarshal(content, &appConfig)
	if err != nil {
		return &config, err
	}

	appOwnerKey, err := getAppOwnerMachineKey(appConfig.OwnerID)
	if err != nil {
		return &config, err
	}
	ownerConfigEnc, err := ioutil.ReadFile("owner.cfg")
	if err != nil {
		return &config, err
	}
	ownerConfigDec := aesDecrypt(ownerConfigEnc, appOwnerKey)
	err = json.Unmarshal(ownerConfigDec, &config)
	if err != nil {
		return &config, err
	}
	config = AppConfig{
		OwnerID:     appConfig.OwnerID,
		UserDB:      appConfig.UserDB,
		UrlDB:       appConfig.UrlDB,
		PasswordDB:  appConfig.PasswordDB,
		Email:       config.Email,
		Password:    config.Password,
		EmailPort:   config.EmailPort,
		EmailServer: config.EmailServer,
		EmailTLS:    config.EmailTLS,
	}
	return &config, err
}

func SetConfig(config *AppConfig) bool {
	//get encrypted owner id from config file

	//read config file to memory
	appConfig := LaunchConfig{
		OwnerID:       config.OwnerID,
		UserDB:        config.UserDB,
		PasswordDB:    config.PasswordDB,
		UrlDB:         config.UrlDB,
		ActivateAuto:  config.ActivateAuto,
		ActivateEmail: config.ActivateEmail,
	}
	content, err := json.Marshal(appConfig)
	if err != nil {
		return false
	}
	//decrypt config file using getAppMachineKey as key
	appKey, err := getAppMachineKey()
	if err != nil {
		return false
	}
	log.Println(string(content))
	contentEnc := aesEncrypt(content, appKey)
	//unmarshal config file

	appOwnerKey, err := getAppOwnerMachineKey(config.OwnerID)
	if err != nil {
		return false
	}
	ownerConfig, err := json.Marshal(config)
	if err != nil {
		return false
	}
	ownerConfigEnc := aesEncrypt(ownerConfig, appOwnerKey)
	err = ioutil.WriteFile("app.cfg", contentEnc, 0644)
	if err != nil {
		return false
	}
	err = ioutil.WriteFile("owner.cfg", ownerConfigEnc, 0644)
	return err == nil
}

// Check if config files exist
func FoundConfig() bool {
	_, err := ioutil.ReadFile("app.cfg")
	if err != nil {
		return false
	}
	_, err = ioutil.ReadFile("owner.cfg")
	return err == nil
}

func (app *AppConfig) GetUrl() string {
	//check if UseCustomURI is true
	if app.UseCustomURI {
		return app.CustomURI
	}
	return "mongodb://" + app.UserDB + ":" + app.PasswordDB + "@" + app.UrlDB +
		"/?directConnection=true&serverSelectionTimeoutMS=2000"
}

func AskDBUrl() *AppConfig {

	var dbConfig AppConfig
	//Ask if user wants to use custom uri
	fmt.Println("A machine and OS specific encrypted configuration will be created. This configuration can not be decrypted automatically on other machines without access to the original.")
	items := []bool{
		true,
		false,
	}
	prompt := promptui.Select{
		Label: "Do you want to use a custom uri? Including user + password",
		Items: items,
	}
	idx, _, _ := prompt.Run()

	dbConfig.UseCustomURI = items[idx]
	if dbConfig.UseCustomURI {
		promptURI := promptui.Prompt{
			Label:       "Enter custom uri",
			HideEntered: true,
		}
		result, _ := promptURI.Run()
		dbConfig.CustomURI = result
		return &dbConfig
	}
	promptUrl := promptui.Prompt{
		Label: "Enter database url",
	}
	dbConfig.UrlDB, _ = promptUrl.Run()
	promptUser := promptui.Prompt{
		Label: "Enter database user",
	}
	dbConfig.UserDB, _ = promptUser.Run()
	promptPassword := promptui.Prompt{
		Label:       "Enter database password",
		HideEntered: true,
	}
	dbConfig.PasswordDB, _ = promptPassword.Run()

	return &dbConfig
}

func AskActivation() LaunchConfig {
	var cfg LaunchConfig
	promptAutoActivate := promptui.Select{
		Label: "Activate users automatically?",
		Items: []string{"Yes", "No"},
	}
	_, result, _ := promptAutoActivate.Run()
	cfg.ActivateAuto = result == "Yes"
	promptEmailActivate := promptui.Select{
		Label: "Activate users by email?",
		Items: []string{"Yes", "No"},
	}
	_, result, _ = promptEmailActivate.Run()
	cfg.ActivateEmail = result == "Yes"
	return cfg
}

func OwnerConfigPrompt() *OwnerConfig {
	//ask if user wants to configure email account
	var ownerConfig OwnerConfig
	promptAskEmail := promptui.Select{
		Label: "Configure an email account?",
		Items: []string{"Yes", "No"},
	}
	_, confEmail, _ := promptAskEmail.Run()
	if confEmail == "No" {
		return &OwnerConfig{}
	}
	fmt.Println("Configuration for an email account to activate  users and reset passwords.")

	promptEmail := promptui.Prompt{
		Label: "Enter email",
	}
	ownerConfig.Email, _ = promptEmail.Run()
	promptPassword := promptui.Prompt{
		Label:       "Enter password",
		HideEntered: true,
	}
	ownerConfig.Password, _ = promptPassword.Run()
	promptEmailPort := promptui.Prompt{
		Label: "Enter email port",
	}
	ownerConfig.EmailPort, _ = promptEmailPort.Run()
	promptEmailServer := promptui.Prompt{
		Label: "Enter email server",
	}
	ownerConfig.EmailServer, _ = promptEmailServer.Run()
	promptEmailTLS := promptui.Select{
		Label: "Use TLS?",
		Items: []string{"Yes", "No"},
	}
	_, result, _ := promptEmailTLS.Run()
	ownerConfig.EmailTLS = result == "Yes"
	return &ownerConfig
}

func CreateOwnerUserPrompt(client *mongo.Client) string {
	fmt.Println("Creating an owner account. This  account can manage rights of other users. It can be used as a regular user as well. There can be only one owner.")

	var owner user.User
	owner.Owner = true
	owner.Admin = true
	owner.Active = true
	promptEmail := promptui.Prompt{
		Label: "Enter email",
	}
	owner.Email, _ = promptEmail.Run()
	//check if email is valid regex
	if !register.EmailRegexp.MatchString(owner.Email) {
		panic("invalid email")
	}
	promptPassword := promptui.Prompt{
		Label:       "Enter password",
		HideEntered: true,
	}
	confirmPromptPassword := promptui.Prompt{
		Label:       "Confirm password",
		HideEntered: true,
	}
	//check if password and confirm password match

	ownerPassword, _ := promptPassword.Run()
	ownerConfirmPassword, _ := confirmPromptPassword.Run()
	if ownerPassword != ownerConfirmPassword {
		panic("passwords do not match")
	}
	// ask first name
	promptFirstName := promptui.Prompt{
		Label: "Enter first name",
	}
	owner.FirstName, _ = promptFirstName.Run()
	// ask last name
	promptLastName := promptui.Prompt{
		Label: "Enter last name",
	}
	owner.LastName, _ = promptLastName.Run()
	// ask screen name
	promptScreenName := promptui.Prompt{
		Label: "Enter screen name",
	}
	owner.ScreenName, _ = promptScreenName.Run()

	registerRequest := register.RegisterRequest{
		Email:     owner.Email,
		Password:  ownerPassword,
		FirstName: owner.FirstName,
		LastName:  owner.LastName,
		Question:  "",
	}
	//check password using CheckPassword
	passwordCheck := registerRequest.CheckPassword()
	if !passwordCheck {
		panic("password not strong enough")
	}
	//hash password
	passHash, err := hash.HashPassword(ownerPassword)
	if err != nil {
		panic(err)
	}
	owner.Password = passHash
	//compare hashed password
	hashed := hash.ComparePasswordAndHash(ownerConfirmPassword, owner.Password)
	if !hashed {
		panic("passwords do not match")
	}
	hashed = hash.ComparePasswordAndHash(ownerPassword, owner.Password)
	if !hashed {
		panic("passwords do not match")
	}

	ownerID, err := mongoDB.AddUser(&owner, client)
	if err != nil {
		panic(err)
	}
	owner.ID = ownerID

	return owner.ID.Hex()
}

func aesEncrypt(text, key []byte) []byte {
	c, err := aes.NewCipher(key)
	if err != nil {
		fmt.Println(err)
	}

	gcm, err := cipher.NewGCM(c)
	if err != nil {
		fmt.Println(err)
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		fmt.Println(err)
	}

	return gcm.Seal(nonce, nonce, text, nil)
}

func aesDecrypt(cipherText, key []byte) []byte {

	c, err := aes.NewCipher(key)
	if err != nil {
		fmt.Println(err)
	}

	gcm, err := cipher.NewGCM(c)
	if err != nil {
		fmt.Println(err)
	}

	nonceSize := gcm.NonceSize()
	if len(cipherText) < nonceSize {
		fmt.Println(err)
	}

	nonce, cipherText := cipherText[:nonceSize], cipherText[nonceSize:]
	plainText, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		fmt.Println(err)
	}
	return plainText
}

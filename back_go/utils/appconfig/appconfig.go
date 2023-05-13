package appconfig

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/andreburgaud/crypt2go/ecb"
	"github.com/andreburgaud/crypt2go/padding"
	"github.com/denisbrodbeck/machineid"
	"golang.org/x/crypto/blowfish"
	"golang.org/x/crypto/sha3"
	"golang.org/x/term"
)

const AppKey = "Untamo-AlarmClock"

type LaunchConfig struct {
	OwnerID      string `json:"ownerId"`
	UserDB       string `json:"userDb"`
	PasswordDB   string `json:"passwordDb"`
	UrlDB        string `json:"urlDB"`
	CustomURI    string `json:"customUri"`
	UseCustomURI bool   `json:"useCustomUri"`
}

type OwnerConfig struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	EmailPort   string `json:"emailPort"`
	EmailServer string `json:"emailServer"`
	EmailTLS    bool   `json:"emailTLS"`
}
type AppConfig struct {
	OwnerID      string `json:"ownerId"`
	UrlDB        string `json:"urlDB"`
	CustomURI    string `json:"customUri"`
	UserDB       string `json:"userDb"`
	UseCustomURI bool   `json:"useCustomUri"`
	PasswordDB   string `json:"passwordDb"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	EmailPort    string `json:"emailPort"`
	EmailServer  string `json:"emailServer"`
	EmailTLS     bool   `json:"emailTLS"`
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

// encrypt string using app key and blowfish algorithm

func blowfishEncrypt(pt, key []byte) []byte {
	block, err := blowfish.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}
	mode := ecb.NewECBEncrypter(block)
	padder := padding.NewPkcs5Padding()
	pt, err = padder.Pad(pt) // pad last block of plaintext if block size less than block cipher size
	if err != nil {
		panic(err.Error())
	}
	ct := make([]byte, len(pt))
	mode.CryptBlocks(ct, pt)
	return ct
}

func blowfishDecrypt(ct, key []byte) []byte {
	block, err := blowfish.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}
	mode := ecb.NewECBDecrypter(block)
	pt := make([]byte, len(ct))
	mode.CryptBlocks(pt, ct)
	padder := padding.NewPkcs5Padding()
	pt, err = padder.Unpad(pt) // unpad plaintext after decryption
	if err != nil {
		panic(err.Error())
	}
	return pt
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
	content := blowfishDecrypt(contentEnc, appKey)
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
	ownerConfigDec := blowfishDecrypt(ownerConfigEnc, appOwnerKey)
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
		OwnerID:    config.OwnerID,
		UserDB:     config.UserDB,
		PasswordDB: config.PasswordDB,
		UrlDB:      config.UrlDB,
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
	contentEnc := blowfishEncrypt(content, appKey)
	//unmarshal config file

	appOwnerKey, err := getAppOwnerMachineKey(config.OwnerID)
	if err != nil {
		return false
	}
	ownerConfig, err := json.Marshal(config)
	if err != nil {
		return false
	}
	ownerConfigEnc := blowfishEncrypt(ownerConfig, appOwnerKey)
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
	dbConfig.UseCustomURI = false
	//Ask if user wants to use custom uri
	fmt.Println("A machine and OS specific encrypted configuration will be created. This configuration can not be decrypted automatically on other machines without access to the original.")
	fmt.Println("Do you want to use a custom uri? Including user + password (y/n)")
	var customInput string
	fmt.Scanln(&customInput)
	if customInput == "y" || customInput == "Y" || customInput == "yes" || customInput == "Yes" || customInput == "YES" {
		dbConfig.UseCustomURI = true
		fmt.Println("Enter custom uri:")
		inputURI, err := term.ReadPassword(0)
		if err != nil {
			panic(err)
		}
		dbConfig.CustomURI = string(inputURI)
		return &dbConfig
	}
	fmt.Println("Enter database url:")
	fmt.Scanln(&dbConfig.UrlDB)
	fmt.Println("Enter database user:")
	fmt.Scanln(&dbConfig.UserDB)
	fmt.Println("Enter database password:")
	input, err := term.ReadPassword(0)
	if err != nil {
		panic(err)
	}
	dbConfig.PasswordDB = string(input)

	return &dbConfig
}

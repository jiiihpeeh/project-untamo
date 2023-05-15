package hash

import (
	"crypto/rand"

	"github.com/alexedwards/argon2id"
)

func GenRandomBytes(size uint16) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	return
}

// generate hash string using argon2id
func generateFromPassword(password string, p *argon2id.Params) (encodedHash string, err error) {
	hash, err := argon2id.CreateHash(password, p)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func HashPassword(password string) (encodedHash string, err error) {
	params := &argon2id.Params{
		Memory:      96 * 1024,
		Iterations:  4,
		Parallelism: 4,
		SaltLength:  16,
		KeyLength:   32,
	}
	return generateFromPassword(password, params)
}

func ComparePasswordAndHash(password, encodedHash string) bool {
	match, err := argon2id.ComparePasswordAndHash(password, encodedHash)
	if err != nil {
		return false
	}
	return match
}

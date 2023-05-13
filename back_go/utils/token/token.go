package token

import (
	"bytes"
	rand "crypto/rand"
	"encoding/base64"
	"strconv"

	"untamo_server.zzz/utils/now"
)

const (
	letters                    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+-"
	TokenStringLength   uint16 = 64
	WsTokenStringLength uint16 = 66
	WsPairLength        uint16 = 16
)

func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}
	return b, nil
}
func randomBoolSlice(length int) ([]bool, error) {
	// calculate the number of bytes needed to generate `length` boolean values
	numBytes := (length + 7) / 8

	// generate random bytes using the crypto/rand package
	bytes := make([]byte, numBytes)
	_, err := rand.Read(bytes)
	if err != nil {
		return nil, err
	}

	// convert the bytes to a boolean slice
	bools := make([]bool, length)
	for i := 0; i < length; i++ {
		byteIndex := i / 8
		bitIndex := uint(i % 8)
		bools[i] = (bytes[byteIndex] & (1 << bitIndex)) != 0
	}

	return bools, nil
}
func GenerateRandomString(s int) (string, error) {
	b, err := GenerateRandomBytes(s)
	return base64.URLEncoding.EncodeToString(b), err
}

// generate token
func GenerateToken(n uint16) string {
	b, _ := GenerateRandomString(int(n))
	//convert now to radix 36
	nowStr := strconv.FormatUint(uint64(now.NowNano()), 36)
	//convert nowStr to rune
	t := []byte(nowStr)
	for i := range t {
		//randomly capitalize a letter in nowStr
		//check in random byte is even
		j, _ := randomBoolSlice(len(t))
		for l := range t {
			if j[l] {
				t[i] = bytes.ToUpper(t[i : i+1])[0]
			}
		}
	}
	//randomly capitalize a letter in nowStr
	return string(b) + string(t)
}

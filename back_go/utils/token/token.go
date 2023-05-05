package token

import (
	"math/rand"
	"strconv"

	"untamo_server.zzz/utils/now"
)

const (
	letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+-"
)

// generate token
func GenerateToken(n int16) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = rune(letters[rand.Intn(len(letters))])
	}
	//convert now to radix 36
	nowStr := strconv.FormatUint(uint64(now.Now()), 36)
	//randomly capitalize a letter in nowStr

	return string(b) + nowStr
}

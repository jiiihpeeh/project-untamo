package token

import (
	"bytes"
	"math/rand"
	"strconv"

	"untamo_server.zzz/utils/now"
)

const (
	letters                    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+-"
	TokenStringLength   uint16 = 64
	WsTokenStringLength uint16 = 66
	WsPairLength        uint16 = 32
)

// generate token
func GenerateToken(n uint16) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	//convert now to radix 36
	nowStr := strconv.FormatUint(uint64(now.NowNano()), 36)
	//convert nowStr to rune
	t := []byte(nowStr)
	for i := range t {
		//randomly capitalize a letter in nowStr
		if rand.Intn(2) == 1 {
			t[i] = bytes.ToUpper(t[i : i+1])[0]
		}
	}
	//randomly capitalize a letter in nowStr
	return string(b) + string(t)
}

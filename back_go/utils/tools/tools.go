package tools

import (
	"strconv"

	"github.com/goccy/go-json"
)

type intNumber interface {
	int64 | int32 | int16 | int8 | uint64 | uint32 | uint16 | uint8
}

func isStringInt64(s string) bool {
	_, err := strconv.ParseInt(s, 36, 64)
	return err == nil
}

func RadixToInt(s string) uint64 {
	if isStringInt64(s) {
		i, _ := strconv.ParseUint(s, 36, 64)
		return i
	}
	return 0
}

func IntToRadix[N intNumber](i N) string {
	return strconv.FormatInt(int64(i), 36)
}

func TimeArrayToInteger(arr [2]uint8) int16 {
	number := int16(arr[0])*100 + int16(arr[1])
	return number
}

func IntegerToTimeArray(number int16) [2]uint8 {
	hours := uint8(number / 100)
	minutes := uint8(number % 100)
	arr := [2]uint8{hours, minutes}
	return arr
}

func DateArrayToInteger(arr [3]uint16) int32 {
	number := int32(arr[0])*10000 + int32(arr[1])*100 + int32(arr[2])
	return number
}

func IntegerToDateArray(number int32) [3]uint16 {
	days := uint16(number % 100)
	months := uint16((number / 100) % 100)
	years := uint16(number / 10000)

	arr := [3]uint16{years, months, days}
	return arr
}

func DevicesArrayToString(arr []string) string {
	str, _ := json.Marshal(arr)
	return string(str)
}

func StringToDevicesArray(str string) []string {
	var arr []string
	json.Unmarshal([]byte(str), &arr)
	return arr
}

func SnoozeArrayToString(arr []int64) string {
	str, _ := json.Marshal(arr)
	return string(str)
}

func StringToSnoozeArray(str string) []int64 {
	var arr []int64
	json.Unmarshal([]byte(str), &arr)
	return arr
}

package now

import "time"

func Now() int64 {
	return time.Now().UnixMilli()
}
func NowNano() int64 {
	return time.Now().UnixNano()
}

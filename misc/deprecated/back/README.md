## PROJECT UNTAMO: backend
### Backend http requests:
```
POST /register
POST /login
POST /logout

GET /api/alarm
POST /api/alarm
DELETE /api/alarm/:id
PUT /api/alarm/:id
```
### MongoDB:
`untamodatabase`:
```
users:
{
  "username":""
  "password":""
}
```
```
sessions
{
  "user":""
  "token":""
  "ttl":""
}
```
```
alarms
{
  "alarmID":""
  "deviceID":""
  "basetime":""
}
```

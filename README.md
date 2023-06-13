# project-Untamo
This is an attempt to create a synchronized alarm clock.

Currently the web interface + desktop and the backend seems to work.

Mobile app is WIP and needs to converted from expo to React Native CLI in the end or Tauri  if it progresses enough.



### TODO
Mobile

### Project

Backend: Functional version using Go Gin (optionally either mongo or sqlite), was NodeJs (incompatible API), some beginnings of Rust actix

Web: TypeScript + React

Mobile: TODO. Possibly Tauri. Not compatible with API anymore.  TypeScript + React Native (currently uses expo)

Desktop: Modified version of the Web frontend using Tauri. NOTE:  While it has a quite similar code base it has significant changes to support desktop and workarounds to plausible issues with desktop web engines (buggy audio etc).

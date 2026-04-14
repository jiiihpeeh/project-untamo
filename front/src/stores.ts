import { useStore } from './stores/store'
import { Path, SessionStatus } from './type'

export { useStore as useServer }
export { useStore as useLogIn }
export { useStore as useDevices }
export { useStore as useAlarms }
export { useStore as useSettings }
export { useStore as useAudio }
export { useStore as useTimeouts }
export { useStore as usePopups }
export { useStore as useTask }
export { useStore as useAdmin }
export { useStore as useFetchQR }
export { useStore as useEmojiStore }

export function validSession() { return useStore.getState().sessionValid === SessionStatus.Valid }
export function fingerprint() { return useStore.getState().fingerprint }
export function extend(path: Path) { return useStore.getState().extend(path) }
export { getCommunicationInfo } from './stores/api'

import React, { useState, useEffect }  from 'preact/compat'
import { usePopups, useServer } from '../stores'
import { pingServer } from '../utils'

function ServerLocation() {
  const server = useServer((state) => state.address)
  const setServer = useServer((state) => state.setAddress)
  const setShowServerEdit = usePopups((state) => state.setShowServerEdit)
  const showServerEdit = usePopups((state) => state.showServerEdit)
  const [serverString, setServerString] = useState(server)

  function onApply() {
    setServer(serverString)
    setShowServerEdit(false)
  }

  useEffect(() => {
    if (showServerEdit) {
      setServerString(server)
    }
  }, [showServerEdit])

  if (!showServerEdit) return null
  return (
    <div className="modal modal-open" style={{ zIndex: 1000 }}>
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => setShowServerEdit(false)}
        >✕</button>
        <h3 className="font-bold text-lg mb-4">Set Server Address</h3>
        <div className="py-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                className="input input-bordered flex-1"
                type="text"
                value={serverString}
                onChange={(e) => setServerString((e.target as HTMLInputElement).value)}
              />
              <button
                className="btn btn-neutral"
                onClick={() => pingServer(serverString)}
              >
                Test
              </button>
            </div>
          </div>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowServerEdit(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={() => setShowServerEdit(false)} />
    </div>
  )
}

export default ServerLocation

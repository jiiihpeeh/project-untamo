import React from 'react'
import { usePopups } from '../stores'

function About() {
    const setShowAbout = usePopups((state) => state.setShowAbout)
    const showAbout = usePopups((state) => state.showAbout)

    if (!showAbout) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowAbout(false)}
                >✕</button>
                <h3 className="font-bold text-lg mb-4">About Untamo</h3>
                <div className="py-2">
                    <span>
                        This project aims to implement a cross device alarm clock with synchronization capabilities.
                    </span>
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAbout(false)}
                    >
                        OK
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowAbout(false)} />
        </div>
    )
}

export default About

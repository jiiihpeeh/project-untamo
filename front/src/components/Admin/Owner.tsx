import React, { useEffect, useState } from 'react'
import { useAdmin, useLogIn, useSettings } from '../../stores'
import { DatabaseType } from '../../stores/adminStore'
import { Path } from '../../type'

function Owner() {
    const inputHideShow = { passwordDb: false, passwordEmail: false, dbURI: false, ownerID: false }
    const [inputs, setInputs] = useState(inputHideShow)
    const ownerConfig = useAdmin((state) => state.ownerConfig)
    const setOwnerConfig = useAdmin((state) => state.setOwnerConfig)
    const getOwnerConfig = useAdmin((state) => state.getOwnerConfig)
    const sendConfiguration = useAdmin((state) => state.sendOwnerConfig)
    const isOwner = useLogIn((state) => state.user.owner)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    interface Timing { years: number; months: number; days: number; hours: number; minutes: number; seconds: number }

    const [timingInfo, setTimingInfo] = useState<Timing>({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })

    const defaultOwnerConfig = {
        ownerId: "", urlDB: "", customUri: "", userDb: "", useCustomUri: false,
        passwordDb: "", email: "", password: "", emailIdentity: "", emailPort: 0,
        emailServer: "", emailPlainAuth: false, activateAuto: false, activateEmail: false,
        sessionLength: 63072000000, databaseType: DatabaseType.Mongo, databasePath: ""
    }

    function msToTiming(ms: number): Timing {
        return {
            years: Math.floor(ms / 31536000000),
            months: Math.floor((ms % 31536000000) / 2592000000),
            days: Math.floor(((ms % 31536000000) % 2592000000) / 86400000),
            hours: Math.floor((((ms % 31536000000) % 2592000000) % 86400000) / 3600000),
            minutes: Math.floor(((((ms % 31536000000) % 2592000000) % 86400000) % 3600000) / 60000),
            seconds: 0,
        }
    }
    function timingToMs(t: Timing) {
        return t.years * 31536000000 + t.months * 2592000000 + t.days * 86400000 + t.hours * 3600000 + t.minutes * 60000
    }

    useEffect(() => { getOwnerConfig() }, [])
    useEffect(() => { if (!isOwner) setNavigateTo(Path.Admin) }, [])
    useEffect(() => {
        if (ownerConfig) setOwnerConfig({ ...ownerConfig, sessionLength: timingToMs(timingInfo) })
    }, [timingInfo])
    useEffect(() => {
        if (ownerConfig) setTimingInfo(msToTiming(ownerConfig.sessionLength))
    }, [ownerConfig])

    const cfg = ownerConfig ?? defaultOwnerConfig
    const set = (patch: Record<string, any>) => setOwnerConfig({ ...(ownerConfig ?? defaultOwnerConfig), ...patch })

    const inputClass = "input input-bordered w-full bg-white text-black"
    const labelClass = "label-text font-medium"

    function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
        return (
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs">{label}</span>
                <div className="flex items-center gap-0.5">
                    <button className="btn btn-xs btn-square" onClick={() => onChange(Math.max(min, value - 1))}>-</button>
                    <input className="input input-bordered input-xs w-14 text-center bg-white text-black" type="number"
                        value={value} min={min} max={max}
                        onChange={(e) => onChange(parseInt((e.target as HTMLInputElement).value) || 0)} />
                    <button className="btn btn-xs btn-square" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold">Database Type: {cfg.databaseType ?? ""}</h2>

            {/* DB Config */}
            <div className="card bg-base-200 p-4 flex flex-col gap-3">
                <div className="form-control">
                    <label className="label"><span className={labelClass}>Owner ID</span></label>
                    <div className="flex gap-2">
                        <input className={inputClass} type={inputs.ownerID ? "text" : "password"}
                            value={cfg.ownerId ?? ""} onChange={(e) => set({ ownerId: (e.target as HTMLInputElement).value })} />
                        <button className="btn btn-sm" onClick={() => setInputs({ ...inputs, ownerID: !inputs.ownerID })}>
                            {inputs.ownerID ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox" checked={cfg.useCustomUri}
                        onChange={(e) => set({ useCustomUri: (e.target as HTMLInputElement).checked })} />
                    <span>Use Custom URI</span>
                </label>
                {cfg.useCustomUri ? (
                    <div className="form-control">
                        <label className="label"><span className={labelClass}>Custom URI</span></label>
                        <div className="flex gap-2">
                            <input className={inputClass} type={inputs.dbURI ? "text" : "password"}
                                value={cfg.customUri ?? ""} onChange={(e) => set({ customUri: (e.target as HTMLInputElement).value })} />
                            <button className="btn btn-sm" onClick={() => setInputs({ ...inputs, dbURI: !inputs.dbURI })}>
                                {inputs.dbURI ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="form-control">
                            <label className="label"><span className={labelClass}>DB base URI</span></label>
                            <input className={inputClass} type="text" value={cfg.urlDB ?? ""}
                                onChange={(e) => set({ urlDB: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className={labelClass}>User for DB</span></label>
                            <input className={inputClass} type="text" value={cfg.userDb ?? ""}
                                onChange={(e) => set({ userDb: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className={labelClass}>Password</span></label>
                            <div className="flex gap-2">
                                <input className={inputClass} type={inputs.passwordDb ? "text" : "password"}
                                    value={cfg.passwordDb ?? ""} onChange={(e) => set({ passwordDb: (e.target as HTMLInputElement).value })} />
                                <button className="btn btn-sm" onClick={() => setInputs({ ...inputs, passwordDb: !inputs.passwordDb })}>
                                    {inputs.passwordDb ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
                <p className="text-sm opacity-60">DB configuration</p>
            </div>

            {/* Email Config */}
            <div className="card bg-base-200 p-4 flex flex-col gap-3">
                <div className="form-control">
                    <label className="label"><span className={labelClass}>Email Address</span></label>
                    <input className={inputClass} type="text" value={cfg.email ?? ""}
                        onChange={(e) => set({ email: (e.target as HTMLInputElement).value })} />
                </div>
                <div className="form-control">
                    <label className="label"><span className={labelClass}>Identity</span></label>
                    <input className={inputClass} type="text" value={cfg.emailIdentity ?? ""}
                        onChange={(e) => set({ emailIdentity: (e.target as HTMLInputElement).value })} />
                </div>
                <div className="flex gap-4 flex-wrap">
                    <div className="form-control flex-1">
                        <label className="label"><span className={labelClass}>Server</span></label>
                        <input className={inputClass} type="text" value={cfg.emailServer ?? ""}
                            onChange={(e) => set({ emailServer: (e.target as HTMLInputElement).value })} />
                    </div>
                    <div className="form-control w-32">
                        <label className="label"><span className={labelClass}>Port</span></label>
                        <input className={inputClass} type="number" min={0} max={9000} value={cfg.emailPort ?? 0}
                            onChange={(e) => set({ emailPort: parseInt((e.target as HTMLInputElement).value) || 0 })} />
                    </div>
                </div>
                <div className="form-control">
                    <label className="label"><span className={labelClass}>Email Password</span></label>
                    <div className="flex gap-2">
                        <input className={inputClass} type={inputs.passwordEmail ? "text" : "password"}
                            value={cfg.password ?? ""} onChange={(e) => set({ password: (e.target as HTMLInputElement).value })} />
                        <button className="btn btn-sm" onClick={() => setInputs({ ...inputs, passwordEmail: !inputs.passwordEmail })}>
                            {inputs.passwordEmail ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <div className="flex gap-6 flex-wrap mt-2">
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                        <span className="text-sm">PlainAuth</span>
                        <input type="checkbox" className="toggle" checked={cfg.emailPlainAuth ?? false}
                            onChange={(e) => set({ emailPlainAuth: (e.target as HTMLInputElement).checked })} />
                    </label>
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                        <span className="text-sm">Activate Automatically</span>
                        <input type="checkbox" className="toggle" checked={cfg.activateAuto ?? false}
                            onChange={(e) => set({ activateAuto: (e.target as HTMLInputElement).checked })} />
                    </label>
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                        <span className="text-sm">Email Activation</span>
                        <input type="checkbox" className="toggle" checked={cfg.activateEmail ?? false}
                            disabled={cfg.activateAuto}
                            onChange={(e) => set({ activateEmail: (e.target as HTMLInputElement).checked })} />
                    </label>
                </div>
                <p className="text-sm opacity-60">SMTP configuration</p>
            </div>

            {/* Session Length */}
            <div className="card bg-base-200 p-4">
                <label className="label"><span className={labelClass}>Session Length</span></label>
                <div className="flex gap-3 flex-wrap mt-2">
                    <NumberField label="Years" value={timingInfo.years} min={0} max={100} onChange={(v) => setTimingInfo({ ...timingInfo, years: v })} />
                    <NumberField label="Months" value={timingInfo.months} min={0} max={11} onChange={(v) => setTimingInfo({ ...timingInfo, months: v })} />
                    <NumberField label="Days" value={timingInfo.days} min={0} max={30} onChange={(v) => setTimingInfo({ ...timingInfo, days: v })} />
                    <NumberField label="Hours" value={timingInfo.hours} min={0} max={23} onChange={(v) => setTimingInfo({ ...timingInfo, hours: v })} />
                    <NumberField label="Minutes" value={timingInfo.minutes} min={0} max={59} onChange={(v) => setTimingInfo({ ...timingInfo, minutes: v })} />
                </div>
            </div>

            <div className="flex gap-3">
                <button className="btn btn-primary" onClick={() => { sendConfiguration(); setNavigateTo(Path.Admin) }}>Apply</button>
                <button className="btn btn-outline" onClick={() => setNavigateTo(Path.Admin)}>Cancel</button>
            </div>
        </div>
    )
}
export default Owner

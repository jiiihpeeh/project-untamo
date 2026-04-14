import { useState, useEffect, useRef } from 'preact/hooks'
import { useLogIn, usePopups } from '../../stores'
import { FormData } from '../../type'
import '../../App.css'

const emptyForm: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    screenName: '',
    password: '',
    changePassword: '',
    confirmPassword: ''
}

function EditProfile() {
    const setShowEditProfile = usePopups((state) => state.setShowEditProfile)
    const showEditProfile = usePopups((state) => state.showEditProfile)
    const editUserInfo = useLogIn((state) => state.editUser)
    const userInfo = useLogIn((state) => state.user)
    const [formData, setFormData] = useState<FormData>(emptyForm)
    const [changePassword, setChangePassword] = useState(false)
    const [formChecks, setFormChecks] = useState(true)

    function getInitForm() {
        return {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            screenName: userInfo.screenName,
            password: '',
            changePassword: '',
            confirmPassword: ''
        }
    }
    function onChange(event: Event) {
        if (!event) return
        const eventTarget = event.target as HTMLInputElement
        setFormData((fd) => ({ ...fd, [eventTarget.name]: eventTarget.value }))
    }
    async function onRegister() {
        editUserInfo(formData, changePassword)
        setShowEditProfile(false)
    }
    function onCloseFixed() {
        setChangePassword(false)
        setFormData(emptyForm)
        setShowEditProfile(false)
    }
    useEffect(() => {
        function passwordChecker() {
            if (formData?.password && formData.password.length < 6) { setFormChecks(false); return }
            if (changePassword) {
                if (formData.changePassword.length > 5 &&
                    formData.changePassword === formData.confirmPassword &&
                    formData.changePassword !== formData.password) {
                    setFormChecks(true)
                } else {
                    setFormChecks(false)
                }
            } else {
                setFormChecks(true)
            }
        }
        passwordChecker()
    }, [formData, changePassword])
    useEffect(() => {
        if (showEditProfile) setFormData(getInitForm())
    }, [showEditProfile])

    if (!showEditProfile) return null
    return (
        <div className={`modal ${showEditProfile ? 'modal-open' : ''}`} id="edit_profile_modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Edit profile</h2>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onCloseFixed}>✕</button>
                </div>
                <form id="edit-profile-form" onSubmit={(e) => { (e as Event).preventDefault(); onRegister() }}>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Profile name</span></label>
                        <input className="input input-bordered w-full" name="screenName" id="edit-screenName"
                            onChange={onChange} placeholder={formData.screenName} value={formData.screenName} />

                        <label className="label"><span className="label-text">First Name</span></label>
                        <input className="input input-bordered w-full" name="firstName" id="edit-firstName"
                            onChange={onChange} value={formData.firstName} />

                        <label className="label"><span className="label-text">Last Name</span></label>
                        <input className="input input-bordered w-full" name="lastName" id="edit-lastName"
                            onChange={onChange} value={formData.lastName} />

                        <label className="label"><span className="label-text">E-mail</span></label>
                        <input className="input input-bordered w-full" type="email" name="user" id="edit-user"
                            onChange={onChange} value={formData.email} />

                        <label className="label"><span className="label-text">Current Password</span></label>
                        <input className="input input-bordered w-full" type="password" name="password"
                            id="edit-currentPassword" onChange={onChange} value={formData.password} />

                        <div className="collapse collapse-arrow bg-base-200 mt-3">
                            <input
                                type="checkbox"
                                checked={changePassword}
                                onChange={() => setChangePassword(!changePassword)}
                            />
                            <div className="collapse-title font-medium">Change Password</div>
                            <div className="collapse-content flex flex-col gap-2">
                                <label className="label"><span className="label-text">New Password</span></label>
                                <input className="input input-bordered w-full" type="password" name="changePassword"
                                    id="edit-newPassword" onChange={onChange} value={formData.changePassword} />
                                <label className="label"><span className="label-text">Confirm new Password</span></label>
                                <input className="input input-bordered w-full" type="password" name="confirmPassword"
                                    id="edit-confirmPassword" onChange={onChange} value={formData.confirmPassword} />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-outline" onClick={onCloseFixed}>Cancel</button>
                    <button className="btn btn-success" disabled={!formChecks} onClick={onRegister}>Save</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onCloseFixed}></div>
        </div>
    )
}

export default EditProfile

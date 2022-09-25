export const formString = (form) => {
    let formmsg = Object.assign({},form);
    delete formmsg.password_confirm
    return JSON.stringify(formmsg)
}


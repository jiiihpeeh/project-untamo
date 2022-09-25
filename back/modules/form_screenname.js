const formScreenName = (body) => {
    if (body.firstname.length === 0 &&  body.lastname.length === 0){
        return body.email.split('@')[0];
    }
    return `${body.firstname} ${body.lastname}`;
}

module.exports = formScreenName
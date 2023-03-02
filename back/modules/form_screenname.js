const formScreenName = (body) => {
    if (body.firstName.length === 0 &&  body.lastName.length === 0){
        return body.email.split('@')[0];
    }
    return `${body.firstName} ${body.lastName}`;
}

module.exports = formScreenName
const fuzzy = require('fuzzy-comparison');
const { default: compare } = require('fuzzy-comparison');

const formChecker = (msg) => {
    const emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    let pass = true
    if (!msg.email.match(emailPattern)){
        pass  = false
    }
    if(pass){
        let emailParts = msg.email.split("@")
        let forbidden = [
            msg.firstName,
            msg.lastName,
            msg.email,
            msg.firstName + msg.lastName,
            msg.lastName + msg.firstName,
            emailParts[0],
            emailParts[1],
            msg.firstName + msg.lastName+emailParts[1],
            msg.lastName + msg.firstName+emailParts[1],
            msg.firstName+emailParts[1],
            msg.lastName +emailParts[1]
                        ]

        const password =  msg.password.toLowerCase()
        let  threshold = { threshold: 4 }
        for (let i =0; i<forbidden.length; i++){
            let cmp = forbidden[i].toLowerCase()
            if(cmp === password ){
                console.log(cmp)
                pass = false
                console.log(forbidden[i])
                break
            }
        }
    }
    return pass
} 

module.exports = formChecker
const fuzzy = require('fuzzy-comparison');
const { default: compare } = require('fuzzy-comparison');

const formCheckcer = (msg) => {
    const emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    let pass = true
    if (!msg.email.match(emailPattern)){
        pass  = false
    }
    if(pass){
        let emailparts = msg.email.split("@")
        let forbidden = [
            msg.firstname,
            msg.lastname,
            msg.email,
            msg.firstname + msg.lastname,
            msg.lastname + msg.firstname,
            emailparts[0],
            emailparts[1],
            msg.firstname + msg.lastname+emailparts[1],
            msg.lastname + msg.firstname+emailparts[1],
            msg.firstname+emailparts[1],
            msg.lastname +emailparts[1]
                        ]

        const password =  msg.password.toLowerCase()
        let  threshold = { threshold: 4 }
        for (let i =0; i<forbidden.length; i++){
            let cmp = forbidden[i].toLowerCase()
            if(cmp === password || compare(password, cmp, threshold) || compare(password, cmp.replace(/[^a-z0-9]/gi,''), threshold) ){
                pass = false
                console.log(forbidden[i])
                break
            }
        }
    }
    return pass
} 

module.exports = formCheckcer
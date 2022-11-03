import axios from "axios";

export const userInfoFetch = async (token,server) =>{
    try {
        let res = await axios.get(`${server}/api/user`,  {headers: {token: token}});
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        return res.data;
    }catch(err){
        return JSON.parse(localStorage.getItem('userInfo'));
    }

};


import userModel from '../model/userModel'

export default {
    CONNECT_SUCCESS(socket,msg){
        console.log("[eventCore.js CONNECT_SUCCESS] 连接成功，发送登录信息");
        socket.send("LOGIN",{});
    },
    PERMISSION_DENIED(socket,msg){
        userModel.login(()=>{
            socket.send("LOGIN",{});
        },true);
    }
}
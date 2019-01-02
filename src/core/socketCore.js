import eventCore from './eventCore'

import userModel from '../model/userModel'

import config from '../config'

export default {
    _bInitEvent:false,
    _msg:{},
    _bReconnect:false,
    _msgQueue:[],
    _callback:{},
    _tryCount:0,
    _lastTimestamp:0,
    _interval:null,
    _socket:null,
    _heartCount:0,
    connect(){
        var status = this._socket && this._socket.readyState;
        console.log("[socketCore connect] readyState:"+status);
        if(this._socket && this._socket.readyState == 1) return;
        this._socket = wx.connectSocket({
            url:config.socketDomain,
            data:{
                EIO:'4',
                transport:'websocket'
            }
        });
       
        wx.onSocketOpen((res) => {
            //console.log(this._socket);
           console.log("[socketCore.connect] onSocketOpen reconnect:"+this._bReconnect);
           this._connect = true;
           this._send();
           this._heart();
           if(this._bReconnect){
               this._onMsg("RECONNECTED");
           }
           this._tryCount = 0;
        });
        if(!this._bInitEvent){
            this._initEvent();
        }
        
    },
    send(type,data){
       var msg = {
            type:type,
            timestamp:new Date().getTime(),
            reconnect:this._bReconnect,
            session_key:userModel.getSessionKey(),
            data:data
       };
       this._msgQueue.push(msg);
       this._send();
    },
    _heart(){
        this._interval && clearInterval(this._interval);
        this._interval = setInterval(()=>{
            var status = this._socket && this._socket.readyState;
            this._heartCount++;
            if(status == 1){
                if(this._heartCount > 20){
                    console.log("[socketCore.js] 发送心跳 readyState:"+status);
                    this.send("HEART");
                    this._heartCount = 0;
                }
            }else if(status == 3){
                this._bReconnect = true;
                this._socket = {
                    readyState:4
                };
                try{
                    if(status != 3){
                        wx.closeSocket();
                    }
                }catch(e){}
                this._onMsg("RECONNECTING");
                this.connect();
            }
        },500);
    },
    _send(){
        if(!this._connect) return;
        this._msgQueue.forEach(msg => {
            wx.sendSocketMessage({
                data:JSON.stringify(msg)
            });
        });
        this._msgQueue = [];
    },
    _initEvent(){
        var self = this;
        self._bInitEvent = true;
        wx.onSocketMessage(function(res) {
            try{
                var msg = JSON.parse(res.data);
                if(self._lastTimestamp > msg.timestamp) return;
                console.log("[socketCore.js onSocketMessage]:"+res.data);
                self._lastTimestamp = msg.timestamp;
                console.log("[socketCore.js timestamp] "+self._lastTimestamp);
                //收到消息后先判断这个消息有没有被消费了
                wx.sendSocketMessage({
                    data:JSON.stringify({
                        type:"CALLBACK",
                        message_id:msg.message_id,
                        session_key:userModel.getSessionKey()
                    }),
                    success(){
                        setTimeout(function(){
                            delete self._msg[msg.message_id];
                        },20000);
                    }
                });
                if(self._msg[msg.message_id]) return;
                self._msg[msg.message_id] = true;
                eventCore[msg.type] && eventCore[msg.type](self,msg);
                self._onMsg(msg.type,msg.data);
            }catch(e){}
        });

        wx.onSocketClose(function(){
            // self._bReconnect = true;
            // self.connect();
            console.log("[SOCKET_CORE] CLOSE "+self._tryCount);
            //self._tryCount++;
        });

        wx.onSocketError(function(res){
            // self._bReconnect = true;
            // self.connect();
            // console.log("[SOCKET_CORE] ERROR "+self._tryCount);
            // self._tryCount++;
        });
    },
    on(type,cb){
        this._callback[type] = cb;
    },
    close(type){
        this._callback[type] = null;
    },
    _onMsg(type,msg){
        this._callback[type] && this._callback[type](msg);
    }
}
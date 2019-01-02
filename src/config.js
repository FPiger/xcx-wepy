export default{
    apiDomain: "https://beautiful.ding-dian.cn",
    debugApi: "https://beautiful.ding-dian.cn",
    appType: 2,
    getTitle:function () {
      return this.appType == 1 ? "觉醒原视力" : "觉醒原视力";
    },
    getPlatform:function () {
      return this.appType == 1 ? 2 : 1;
    },
    getPayInfoUrl:function () {
      return this.appType == 1 ? "/sn2/money/order/pay.do" : "/sn/money/order/pay.do"
    },
    getSysDataUrl:function () {
      return this.appType == 1 ? "/sn2/sys/data.do" : "/sn/sys/data.do"
    },
    getShareInfoUrl:function () {
      return this.appType == 1 ? "/sn2/user/share/info.do" : "/sn/user/share/info.do"
    }
}

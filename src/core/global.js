export default{
  // 软提示
  toast(text){
    wx.showToast({
      title: text,
      icon: 'none',
      duration: 2000
    });
  },
  // 弹窗提示
  showTips(msg, close) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          close && close()
        }
      }
    })
  },
  // 时间戳转换 yyyy-mm-dd
  formatDate(time){
    time = new Date(time);
    var year = time.getFullYear();
    var month = (time.getMonth() + 1).toString().length === 1 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);
    var date = time.getDate().toString().length === 1 ? '0' + time.getDate() : time.getDate();
    return year + '-' + month + '-' + date;
  }
}

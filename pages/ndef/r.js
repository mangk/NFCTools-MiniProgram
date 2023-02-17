// pages/ntag21x/nfcr.js
const ab2str = buf => {
  return String.fromCharCode.apply(null, new Uint8Array(buf)); //apply将数组参数传给方法作为分开的实参，见apply的用法
}

const ab2HexStr = arrayBuffer => {
  const byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  let nextHexByte;

  for (let i = 0; i < byteArray.byteLength; i++) {
    nextHexByte = byteArray[i].toString(16);
    if (nextHexByte.length < 2) {
      nextHexByte = '0' + nextHexByte;
    }
    hexString += nextHexByte;
  }

  return hexString;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    type: [],
    records: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  readNdef() {
    let that = this
    let nfc = wx.getNFCAdapter()
    nfc.onDiscovered(tag => {
      console.log(tag)
      let rs = []
      tag.messages[0].records.forEach(element => {
        let r = {
          tnf: element.tnf,
          type: ab2str(element.type),
          payload: ab2str(element.payload)
        }
        rs.push(r)
      });
      that.setData({
        id: ab2HexStr(tag.id).toUpperCase(),
        type: tag.techs,
        records: rs
      })
    })
    nfc.startDiscovery()
  }
})
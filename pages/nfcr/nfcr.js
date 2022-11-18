// pages/nfct/nfct.js
let nfc = require("../../utils/nfctoolsMifareClassic.js")
Page({
  nfc: null,
  /**
   * 页面的初始数据
   */
  data: {
    sectorIndex: 0,
    authKey: "FFFFFFFFFFFF",
    useAuthKey: "A",
    defaultKey: [
      "FFFFFFFFFFFF",
      "D3F7D3F7D3F7",
      "A0A1A2A3A4A5",
      "B0B1B2B3B4B5",
      "AABBCCDDEEFF",
      "A0B1C2D3E4F5",
      "B0B1B2B3B4B5",
      "000000000000",
    ],
    chekcKeyItems: [
      { value: 'A', name: '密钥A', checked: 'true' },
      { value: 'B', name: '密钥B' },
    ],
    result: [],
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
    nfc.close()
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
  read: function (e) {
    this.setData({ result: [] })
    wx.showToast({
      title: '请将标签贴近手机',
      icon: "none",
      mask: true,
    })
    nfc.read(this.data.useAuthKey, this.data.authKey, this.data.sectorIndex, this)
  },
  inputAuthKey: function (e) {
    this.setData({
      authKey: e.detail.value
    })
  },
  inputSectorIndex: function (e) {
    this.setData({
      sectorIndex: e.detail.value
    })
  },
  radioChange(e) {
    this.setData({
      useAuthKey: e.detail.value
    })
  },
  bindPickerChange(e) {
    this.setData({
      authKey: this.data.defaultKey[e.detail.value]
    })
  },
  goWrite: function () {
    wx.redirectTo({
      url: '/pages/nfcw/nfcw',
    })
  }
})
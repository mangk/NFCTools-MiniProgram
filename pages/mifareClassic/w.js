// pages/nfcw/nfcw.js
let nfc = require("../../utils/nfctoolsMifareClassic.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sectorIndex: 1,
    blockIndex: 0,
    authKey: "D3F7D3F7D3F7",
    useAuthKey: "A",
    content: "",
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
  handleNfcWrite(element) {
    let nfcId = new Int8Array(element.id)
    let authKeyA = this.data.authKeyA
    let authKeyB = this.data.authKeyB
    let sectorIndex = this.data.sectorIndex
    let useAuthKey = this.data.useAuthKey
    let nfctools = require("../../utils/nfc.js")

    let mc = this.data.nfc.getMifareClassic()
    this.setData({ mc: mc })

    // 尝试连接
    this.data.mc.connect({
      success: function (res) {
        console.log("MifareClassic 连接成功", res)
      },
      fail: function (res) {
        console.log("MifareClassic 连接失败", res)
      }
    })

    // 认证 start
    var authData = new Int8Array(12)
    authData[0] = useAuthKey == "A" ? parseInt("0x60") : parseInt("0x61")
    authData[1] = parseInt(4 * parseInt(sectorIndex), 10)
    for (let i = 0; i < nfcId.length; i++) {
      authData[i + 2] = nfcId[i]
    }
    // 填充密钥
    if (useAuthKey == "A") {
      // 使用密钥A
      authData[6] = nfctools.hex2Int(authKeyA.substring(0, 2))
      authData[7] = nfctools.hex2Int(authKeyA.substring(2, 4))
      authData[8] = nfctools.hex2Int(authKeyA.substring(4, 6))
      authData[9] = nfctools.hex2Int(authKeyA.substring(6, 8))
      authData[10] = nfctools.hex2Int(authKeyA.substring(8, 10))
      authData[11] = nfctools.hex2Int(authKeyA.substring(10, 12))
    } else {
      // 使用密钥B
      authData[6] = nfctools.hex2Int(authKeyB.substring(0, 2))
      authData[7] = nfctools.hex2Int(authKeyB.substring(2, 4))
      authData[8] = nfctools.hex2Int(authKeyB.substring(4, 6))
      authData[9] = nfctools.hex2Int(authKeyB.substring(6, 8))
      authData[10] = nfctools.hex2Int(authKeyB.substring(8, 10))
      authData[11] = nfctools.hex2Int(authKeyB.substring(10, 12))
    }
    this.data.mc.transceive({
      data: authData.buffer,
      success: function (res) {
        console.log("认证成功信息：", res)
      },
      fail: function (res) {
        console.log("认证失败信息：", res)
      }
    })
    // 认证 end

    // 尝试写入数据 start
    let that = this
    this.data.mc.isConnected({
      success: function (res) {
        console.log("标签已连接", res)
        console.log("尝试写入数据")
        var data = new Int8Array(18)
        data[0] = parseInt("0xA0")
        // if (that.data.blockIndex ==3) {
        //   console.log("暂时不允许修改密钥与控制分区")
        //   return
        // }
        data[1] = parseInt(that.data.sectorIndex * 4 + that.data.blockIndex * 1, 10)

        let content = that.data.content
        if (content.length <= 32) {
          let need = 32 - content.length
          if (need) {
            for (let index = 0; index < need; index++) {
              content = content + "0"
            }
          }
        } else {
          console.log("内容超长：", content)
          return
        }
        for (let i = 0, c = 0; c < content.length; c += 2) {
          data[i + 2] = parseInt("0x" + content.substr(c, 2))
          i++
        }
        console.log("要写入的数据（hex）:", content)
        console.log("传输的总数据（buffer）:", data.buffer)
        that.data.mc.transceive({
          data: data.buffer,
          success: function (res) {
            console.log("写入成功：", res)
          },
          fail: function (res) {
            console.log("写入失败：", res)
          }
        })
      },
      fail: function (res) {
        console.log("标签未连接", res)
      }
    })
    // 尝试读取数据 end
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
  write: function (e) {
    wx.showToast({
      title: '请将标签贴近手机',
      icon: "none",
      mask: true,
    })
    nfc.write(this.data.useAuthKey, this.data.authKey, this.data.sectorIndex, this.data.blockIndex, this.data.content)
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
  inputBlockIndex: function (e) {
    this.setData({
      blockIndex: e.detail.value
    })
  },
  inputContent: function (e) {
    this.setData({
      content: e.detail.value
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
  goRead: function () {
    wx.redirectTo({
      url: '/pages/nfcr/nfcr',
    })
  }
})
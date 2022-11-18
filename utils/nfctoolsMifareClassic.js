var closeTimeout = 2000
var nfc = null
var mc = null
var accessData = {
  key: "",
  keyType: "A",
  keyT: null,
  option: 0,
  sector: 1,
  block: 4,
  content: "",
  tagId: null,
  readRes: [],
  receiver: null,
}
const _handle = (tag) => {
  accessData.tagId = new Int8Array(tag.id)
  mc = nfc.getMifareClassic()
  // 尝试连接
  mc.connect({
    success: function (res) {
      console.log("MifareClassic 连接成功：", res)
    },
    fail: function (res) {
      console.log("MifareClassic 连接失败", res)
    }
  })
  // 认证
  _auth()
  // 读取
  if (accessData.option == 0) {
    _read()
  } else {
    _write()
  }
}
const _read = () => {
  mc.isConnected({
    success: function (res) {
      console.log("标签已连接，尝试读取： ", res)
      accessData.readRes = []
      for (let i = 0; i < 4; i++) {
        let currentReadBuffer = new Int8Array(2)
        currentReadBuffer[0] = parseInt("0x30")
        currentReadBuffer[1] = parseInt(4 * parseInt(accessData.sector) + i, 10)
        mc.transceive({
          data: currentReadBuffer.buffer,
          success: function (res) {
            console.log("读取 block 成功：", res)
            let content = ""
            for (var o = new Uint8Array(res.data), r = 0; r < o.length; r++) {
              var c = o[r].toString(16);
              c.length < 2 && (c = "0" + c), r == o.length - 1 ? content += c : content += c + ":";
            }
            console.log(content)
            accessData.readRes.push(content)
            if (accessData.receiver) {
              accessData.receiver.setData({ result: accessData.readRes })
            }
          },
          fail: function (res) {
            console.log("读取 block 失败，使用密钥", accessData.keyType, "：", accessData.key, " 返回内容：", res)
          }
        })
      }
      setTimeout(() => {
        _close()
      }, closeTimeout);
    }
  })
}
const _write = () => {
  console.log(accessData)
  mc.isConnected({
    success: function (res) {
      console.log("标签已连接：", res)
      console.log("尝试写入数据")
      let data = new Int8Array(18)
      data[0] = parseInt("0xA0")
      data[1] = parseInt(accessData.sector * 4 + accessData.block * 1, 10)
      let content = accessData.content
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
      mc.transceive({
        data: data.buffer,
        success: function (res) {
          console.log("写入成功：", res)
        },
        fail: function (res) {
          console.log("写入失败：", res)
        }
      })
      setTimeout(() => {
        _close()
      }, closeTimeout);
    }
  })
}
const _auth = () => {
  var authData = new Int8Array(12)
  authData[0] = accessData.keyT
  authData[1] = parseInt(4 * parseInt(accessData.sector), 10)
  for (let i = 0; i < accessData.tagId.length; i++) {
    authData[i + 2] = accessData.tagId[i]
  }
  // 填充密钥
  authData[6] = _hex2Int(accessData.key.substring(0, 2))
  authData[7] = _hex2Int(accessData.key.substring(2, 4))
  authData[8] = _hex2Int(accessData.key.substring(4, 6))
  authData[9] = _hex2Int(accessData.key.substring(6, 8))
  authData[10] = _hex2Int(accessData.key.substring(8, 10))
  authData[11] = _hex2Int(accessData.key.substring(10, 12))

  mc.transceive({
    data: authData.buffer,
    success: function (res) {
      console.log("认证成功信息：", res)
    },
    fail: function (res) {
      console.log("认证失败信息：", res)
    }
  })
}

const _hex2Int = (e) => {
  for (var a, r = e.length, c = new Array(r), s = 0; s < r; s++) 48 <= (a = e.charCodeAt(s)) && a < 58 ? a -= 48 : a = (223 & a) - 65 + 10,
    c[s] = a;
  return c.reduce(function (e, a) {
    return e = 16 * e + a;
  }, 0);
}

const _init = () => {
  _close()
  nfc = wx.getNFCAdapter()
  nfc.startDiscovery({
    success: function (res) {
      nfc.onDiscovered(_handle)
    }
  })
}
const _close = () => {
  mc && mc.close({
    complete: function (res) {
      console.log("MifareClassic close", res)
    }
  })
  nfc && nfc.offDiscovered(_handle)
  nfc && nfc.stopDiscovery({
    complete: function (res) {
      console.log("stopDiscovery", res)
    }
  })
  mc = null
  nfc = null
}

module.exports = {
  read: function (keyType, key, sector, receiver = null) {
    accessData.keyType = keyType
    accessData.key = key
    keyType == "A" ? accessData.keyT = parseInt("0x60") : accessData.keyT = parseInt("0x61")
    accessData.sector = sector
    accessData.option = 0
    accessData.readRes = []
    accessData.receiver = receiver
    _init()
  },
  write: function (keyType, key, sector, block, content) {
    console.log(keyType, key, sector, block)
    accessData.keyType = keyType
    accessData.key = key
    keyType == "A" ? accessData.keyT = parseInt("0x60") : accessData.keyT = parseInt("0x61")
    accessData.sector = sector
    accessData.block = block
    accessData.content = content
    accessData.option = 1
    _init()
  },
  close: function () {
    _close()
  },
  getReadRes() {
    return accessData.readRes
  }
}
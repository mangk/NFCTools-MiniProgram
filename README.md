# 一个通过小程序来读写NFC标签的项目
基于微信[小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/api/device/nfc/wx.getNFCAdapter.html)我开发了这个通过微信小程序来调用手机NFC硬件的项目，微信文档中支持的NFC标签类型有很多，暂时只针对MifareClassic标签进行了适配（因为不是专业的前端开发，所以先以实现功能为主，代码封装与规划欢迎大家建议），未完待续......
# NFC基础知识
欢迎查看我的文章[NFC基础知识与读写](https://mangk.github.io/2022/11/18/NFC基础知识与读写/)
# 支持情况
- 标签类型
  - ✅MifareClassic(read|write)
  - ❌MifareUtralight
  - ❌Ndef
  - ❌NfcA
  - ❌NfcB
  - ❌NfcF
  - ❌NfcV
- 设备
  - ✅Android（手机支持并打开NFC开关）
  - ❌iOS（微信并没有开放接口）
## 1. 重要声明
- 本项目以学习为目的，本人不承担任何责任。
- 本项目仅限学习本人使用，切勿泄露出去

## 2.使用说明
### 2.1 下载安装
```js
git clone xx.git
yarn install
```

### 2.1 获取EID和FP
- 在[京东](https://www.jd.com/)的网站添加任何商品，然后进入[结算页](https://trade.jd.com/shopping/order/getOrderInfo.action)，在控制台输入`_JdTdudfp`就可以获取到一个对象,拷贝出来EID和FP
```js
{
    eid: "QLKKDNCMZATGWEKG67UKWZEV56F7VOPUK74I6PSHKE242E4AU6TYLFOMXRTN6UPLBYTLPARIGDQ2D62NLZXVPMS6VKE", fp: "2e3ebc3e9bddb7f38990d390acfa9056d5", 
    date: 16100704100000, 
    token: "3BZ4QRLOU267HLGQW0QDYWCAZCKKQ8E3OVKYP7SGZTA24E5IKOPKCQZ4EGAWO6LKUDWQS53UKGKRMO26",
    jstub:"YKUXL6OHVZHZKLUYVBM0F2MY2LLTAZU7UWIOE634BPVIHZXY4OOE3…6BB2LBVGR4FXRBWT2ALBKGMIFGQDGQVIFNPJM66U3GWDGM5MI"}
```

### 2.2 填写 .env

```js
SEC=0
MINUTE=0
HOUR=10
DAY=7
MONTH=1
PORT=3000
PRODUCTID=100012043978
BYNUM=1
PAYPASSWORD=123456
EID=QLKKDNCMZATGWEKG2UKWZEV56F7VOPUK74I6PSHKE242E4AU6TYLFOMXRTN6UPLBYTLPARIGDQ2D62NLZXVPMS6VKE
FP=2e3ebc3e9bddb7f390d390acfa9056d5
```

SEC=0  
MINUTE=54  
HOUR=13  
DAY=6
MONTH=1

这是脚本启动时间，会自动与京东对时。比如 7 点 0 分抢且比本地比京东时间快 30 秒，那么就会在本地时间 7 点 30 秒执行脚本

PORT=3000
启动端口号

PRODUCTID=100012043978
商品 id

BYNUM=1
购买数量

PAYPASSWORD=123456
支付密码

EID='QLKKDNCMZATGWEKG2UKWZEV56F7VOPUK74I6PSHKE242E4AU6TYLFOMXRTN6UPLBYTLPARIGDQ2D62NLZXVPMS6VKE'
FP='2e3ebc3e9bddb7f390d390acfa9056d5'

### 2.3 启动项目
- 执行命令启动

```js
yarn start
```

### 2.3 登录
- 启动后会弹出二维码，用京东APP扫码登录即可,如果卡住，按回车
- 如果想重复登录，可以删除目录下面的qrcode.png,然后重新执行yarn start


### 2.4 update : 更新获取茅台股价信息
- 可以将茅台股票导出成excel
```js
import { StockModule } from './stock/stock.module'; // 获取股票信息模块
```


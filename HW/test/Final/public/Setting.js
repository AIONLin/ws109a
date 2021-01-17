/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼  
    以下有更詳細的註解  */
const Setting = {}

/* 點選商店設定後 進入的畫面 */
Setting.html = `
<table>
  <thead><tr><th>欄位</th><th>內容</th></tr></thead>
  <tbody>
    <tr><td>商店名稱</td><td><input id="shopName" type="text" value=""/></td></tr>
    <tr><td>地址</td><td><input id="shopAddress" type="text" value=""/></td></tr>
    <tr><td>電話</td><td><input id="shopTel" type="text" value=""/></td></tr>
    <tr><td>產品清單</td><td><textarea id="items"></textarea></td></tr>
    <tr><td>附加選項</td><td><textarea id="addons"></textarea></td></tr>
  </tbody>
</table>
<br/>
<button onclick="Setting.save()">儲存設定</button>
<button onclick="Shop.start()">回主選單</button>
`

Setting.start = function () { /* 點選後進入畫面 顯現商店名稱.地址電話.單品.添加物等等內容 */
    Ui.show(Setting.html)
    Ui.id('shopName').value = Shop.name
    Ui.id('shopAddress').value = Shop.address
    Ui.id('shopTel').value = Shop.tel
    Ui.id('items').value = JSON.stringify(Shop.items, null, 2)
    Ui.id('addons').value = JSON.stringify(Shop.addons, null, 2)
  }


Setting.save = function () { /* 可更改設定 並儲存 且用try catch防例外  */
    try {
      Shop.name = Ui.id('shopName').value
      Shop.address = Ui.id('shopAddress').value
      Shop.tel = Ui.id('shopTel').value
      Shop.items = JSON.parse(Ui.id('items').value)
      Shop.addons = JSON.parse(Ui.id('addons').value)
    } catch (error) {
      alert('失敗，請檢查格式是否正確！\n', error)
      return
    }
    localStorage.setItem('Shop.name', Shop.name)
    localStorage.setItem('Shop.address', Shop.address)
    localStorage.setItem('Shop.tel', Shop.tel)
    localStorage.setItem('Shop.items', Ui.id('items').value)
    localStorage.setItem('Shop.addons', Ui.id('addons').value)
    Ui.id('menuShopName').innerHTML = Shop.name
    alert('儲存成功')
  }

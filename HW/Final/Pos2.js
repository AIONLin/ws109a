/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼  
    以下有更詳細的註解  */


/* Pos初始設定 價錢、紀錄都為0或空 為未傳送狀態 */
const Pos = {
    order: {
      totalPrice: 0,
      records: [],
      submitted: false
    }
  }
const Order = Pos.order

/* 點擊新增訂單後 畫面轉至此  */
Pos.html = `
<table id="orderTable">
<thead>
  <tr>
    <td>
      <select id="items" onchange="Pos.calcPrice()"></select>
      <select id="addons" onchange="Pos.calcPrice()"></select>
    </td>
    <td><input id="price" type="number" value="0"></td>
    <td>
      <input id="quantity" type="number" value="1">
      <button onclick="Pos.addItem()">新增</button>
    </td>
  </tr>
  <tr><th>商品</th><th>單價</th><th>數量</th></tr>
</thead>
<tbody id="orderTableBody">
  <tr><td>&nbsp;</td><td></td><td></td></tr>
</tbody>
</table>
<br/>
<div>
  <label>總價:</label>
  <input id="totalPrice" type="number" value="0">
  <button id="submit" onclick="Pos.submit()">送出訂單</button>
  <button id="abort" onclick="Pos.abort()">放棄訂單</button>
  <br/><br/>
  <button id="goShop" onclick="Pos.goShop()">回主選單</button>
  <button id="newOrder" onclick="Pos.start()" disabled="disabled">新增下一筆</button>
  <br/><br/>
</div>
</div>

`
/* 如果訂單未完成要離開 出示警告 */
Pos.goShop = function(){
    if(!Order.submitted){
        if(confirm('您的訂單還沒送出，要放棄該訂單嗎?')){
            Shop.start()
            return
        }
        else { return }
    }
    Shop.start()
}

 /* 確認是否放棄訂單離開 */
Pos.abort = function () {
    if (confirm('確認要放棄此訂單？')) {
      Pos.start()
    }
  }

Pos.start = function(){
    Ui.show(Pos.html)// 顯示pos.html畫面 
    Ui.id('items').innerHTML = Pos.optionList(Shop.items)//單品選擇
    Ui.id('addons').innerHTML = Pos.optionList(Shop.addons)//添加物的選擇
    Pos.resetOrder(Order)//Reset
    Pos.calcPrice()//計算價錢

} 

/* 歸零reset 價錢紀錄 */
Pos.resetOrder = function (Order) {
    Order.totalPrice = 0
    Order.records = []
    Order.submitted = false
  }

/* 送出訂單功能  */
Pos.submit = function ()
    {
      //避免空訂單送出並跳出警告
      if (Order.records.length === 0) {
      alert('空訂單，無法送出')
      return
    }
    Shop.incCount()             /*訂單送出後執行儲存 將其他功能關閉 並顯示已送出 */
    Order.time = Date.now()
    Order.submitted = true      
    Shop.saveOrder(Order)
    Ui.id('submit').disabled = 'disabled'
    Ui.id('submit').innerHTML = '已送出'
    Ui.id('abort').disabled = 'disabled'
    Ui.id('newOrder').disabled = ''
  }
  
/* 選單 將名字價錢放入並呈現  */
Pos.optionList = function (list) { 
    let r = []
    for (let name in list) {
      let price = list[name]
      r.push('<option value="'+name+':'+price+'">'+name+':'+price+'</option>')
    }
    return r.join('\n')
  }

  Pos.list = function () {  /* 將新增項目放置新增表格   少了他 無法看見所點的也無法計算價錢 */
    let records = Order.records
    let list = []
    for (let i=0; i<records.length; i++) {
      list.push(`<tr><td>${records[i].name}</td><td class="number">${records[i].price}</td><td class="number">${records[i].quantity}</td></tr>`)
    }
    return list.join('\n')
  }

/* 將單品與添加物進行計算 並傳回值 */
Pos.calcPrice = function () {
  let [item, itemPrice] = Ui.id('items').value.split(':')
  let [addon, addonPrice] = Ui.id('addons').value.split(':')
  let price = parseInt(itemPrice) + parseInt(addonPrice)
  Ui.id('price').value = price
  return {item, addon, price}
}



Pos.addItem = function () {  /*  將值傳回orderTableBody、totalPrice紀錄 */
    let {item, addon, price} = Pos.calcPrice()
    let quantity = parseInt(Ui.id('quantity').value)
    let record = {name: item+'('+addon+')', price: price, quantity: quantity}
    /* 此程式碼仍有部分不理解 */
    Order.records.push(record)
    Ui.id('orderTableBody').innerHTML = Pos.list()
    Order.totalPrice += price * quantity
    Ui.id('totalPrice').value = Order.totalPrice
  }
var R = {}

window.onhashchange = async function () {
  var r
  var tokens = window.location.hash.split('/')
  console.log('tokens=', tokens)
  switch (tokens[0]) {
    case '#show':
      r = await window.fetch('/post/' + tokens[1])
      let post = await r.json()
      R.show(post)
      break
    case '#new':
      R.new()
      break
    default:
      r = await window.fetch('/list')
      let posts = await r.json()
      R.list(posts)
      break
  }
}

window.onload = function () {
  window.onhashchange()
}

R.layout = function (title, content) {
  document.querySelector('title').innerText = title
  document.querySelector('#content').innerHTML = content
}

R.list = function (posts) {
  let list = []
  for (let post of posts) {
    list.push(`
    <li>
      <h2>${post.title}</h2>
      <p><a id="show${post.id}" href="#show/${post.id}">Read post</a></p>
    </li>
    `)
  }
  let content = `
  <h1>Posts</h1>
  <p>You have <strong>${posts.length}</strong> posts!</p>
  <p><a id="createPost" href="#new">Create a Post</a></p>
  <ul id="posts">
    ${list.join('\n')}
  </ul>
  `
  return R.layout('Posts', content)
}

R.new = function () {
  return R.layout('New Post', `
  <h1>New Post</h1>
  <p>Create a new post.</p>
  <form>
    <p><input id="title" type="text" placeholder="Title" name="title"></p>
    <p><textarea id="body" placeholder="Contents" name="body"></textarea></p>
    <p><input id="savePost" type="button" onclick="R.savePost()" value="Create"></p>
  </form>
  `)
}

R.show = function (post) {
  return R.layout(post.title, `
    <h1>${post.title}</h1>
    <p>${post.body}</p>
  `)
}

R.savePost = async function () {
  let title = document.querySelector('#title').value
  let body = document.querySelector('#body').value
  let r = await window.fetch('/post', {
    body: JSON.stringify({title: title, body: body}),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  window.location.hash = '#list'
  return r
}

/*R.loginUi = async function () {
  return layout('Login', `
  <h1>Login</h1>
  <form action="/login" method="post">
    <p><input type="text" placeholder="username" name="username"></p>
    <p><input type="password" placeholder="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
  </form>
  `)
}*/



/* 此程式碼參照陳鍾誠老師後打出   我能完全理解此程式碼 
   以下有更詳細的註解  */
const Lib = {}

Lib.dateToString = function (date) {/* 抓取年月日並回傳 */
  return date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()
}
   
Lib.timeToString = function (date) {/* 時分秒 回傳 */
  return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
}

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

/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼   ----Report.js   Report.js   Report.js    Report.js    Report.js  
  Report.js  以下有更詳細的註解  */
const Report = {}/* 空 */
    

/* 點選報表後所進入的畫面 */
Report.html = `
  <div id="report" class="panel">
    <table>
      <thead><tr><th>代號</th><th>金額</th><th>日期</th><th>時間</th></tr></thead>
      <tbody id="reportBody"></tbody>
    </table>
    <br/>
    <div class="center">
      <label>本日總收入：</label>
      <label id="dayTotal"></label>
      <br/><br/>
      <button onclick="Shop.start()">回主選單</button>
    </div>
  </div>
  <div id="detail" class="panel" style="display:none">
    <table>
      <thead><tr><th>商品</th><th>單價</th><th>數量</th></tr></thead>
      <tbody id="detailBody"></tbody>
    </table>
    <br/>
    <div>
      <label>總價:</label><label id="totalPrice"></label>
      <br/><br/>
      <button onclick="Ui.showPanel('report')">回到報表</button>
    </div>
  </div>
`
    
Report.start = function () {/* 點選後 進入Report.html的畫面 */
    Ui.show(Report.html)
    Report.showReport()
  }
    
Report.showReport = function () {  /* 顯示所有新增的訂單與總價 */
    Ui.id('reportBody').innerHTML = Report.orderListHtml()
    Ui.id('dayTotal').innerHTML = Report.dayTotal + ''
  }
    
Report.showDetail = function (i) { /* 點進代號後 顯示此訂單的細節 */
    Ui.showPanel('detail')
    let order = Shop.getOrder(i)
    Ui.id('detailBody').innerHTML = Report.orderDetailHtml(order)
    Ui.id('totalPrice').innerHTML = order.totalPrice
  }
    
Report.orderListHtml = function () {/* 先為空 若有完成的訂單進行總計算 */
    list = []   
    let dayTotal = 0
    for (let i=1; i <= Shop.orderCount; i++) {
      let order = Shop.getOrder(i)//先取得後放入
      dayTotal += order.totalPrice//進行計算
      list.push(Report.orderRowHtml(i, order))
    }
    Report.dayTotal = dayTotal
    return list.join('\n')
  }
    
Report.orderRowHtml = function (i, order) {     /* 時間欄位 將下訂單的時間取出並放入欄位 */
    let time = new Date(order.time)
    return '<tr><td><a href="#" onclick="Report.showDetail('+i+')">0' + i + '</a></td><td class="number">' + order.totalPrice + '</td><td>' + Lib.dateToString(time) + '</td><td>' + Lib.timeToString(time) + '</td></tr>'
  }
    
Report.orderDetailHtml = function (order) {/* 先為空 將訂單放入紀錄 並使用for若有就push進detail裡並回傳 */
    let detail = []
    let records = order.records
    for (let i=0; i<records.length; i++) {
      let r = records[i]
      detail.push('<tr><td>' + r.name + '</td><td>' + r.price + '</td><td>' + r.quantity + '</td></tr>')
    }
    return detail.join('\n')
  }
    

      

/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼   --  Setting.js  Setting.js  Setting.js  Setting.js  Setting.js  Setting.js-------
 Setting.js   以下有更詳細的註解  */  
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

  
/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼  ----Shop.js   Shop.js  Shop.js  Shop.js   Shop.js  Shop.js---------
 Shop.js   以下有更詳細的註解  */
const Shop =
{
    name:'多喝水',
    address:'金門縣金寧鄉大學路1號',
    tel:'082-999999',
    items:{'柳橙汁':30,'咖啡':50,'冰水':10},
    addons:{'去冰':0,'半糖':0,'熱':0,'小玩具':10},
    orderCount:0,
}
Shop.html =
`
<div>
    <button class="big" onclick="Pos.start()">新增訂單</button><br/><br/>
    <button class="big" onclick="Report.start()">本日報表</button><br/><br/>
    <button class="big" onclick="Setting.start()">商店設定</button><br/><br/>
</div>
`
Shop.start = function () {
    Shop.init()
    Shop.name = localStorage.getItem('Shop.name') || Shop.name
    Shop.address = localStorage.getItem('Shop.address') || Shop.address
    Shop.tel = localStorage.getItem('Shop.tel') || Shop.tel
    Ui.id('menuShopName').innerHTML = Shop.name
    const itemsJson = localStorage.getItem('Shop.items')
    const addonsJson = localStorage.getItem('Shop.addons')
    if (itemsJson != null) Shop.items = JSON.parse(itemsJson)
    if (addonsJson != null) Shop.addons = JSON.parse(addonsJson)
    Ui.show(Shop.html)
  }
/*Shop.start = function(){
    Shop.init()
    Shop.name = localStorage.getItem('Shop.name')||Shop.name/* 如果有localstorage就取他 沒有就原本的name 
    Shop.address = localStorage.getItem('Shop.address') || Shop.address/* 如果有localstorage就取他 沒有就原本的address 
    Shop.tel = localStorage.getItem('Shop.tel') || Shop.tel
    Ui.id('menuShopName').innerHTML = Shop.name
    const itemsJson = localStorage.getItem('Shop.items')
    const addonsJson = localStorage.getItem('Shop.addons')
    if(itemsJson !=null)Shop.items = JSON.parse(itemsJson)/* 將所儲存的localstorage取出使用 
    if (addonsJson != null) Shop.addons = JSON.parse(addonsJson)
    Ui.show(Shop.html)

}*/


Shop.init = function () {
    Shop.orderCount = localStorage.getItem('Pos.Order.count')
    if (Shop.orderCount == null) {
      Shop.orderCount = 0
      localStorage.setItem('Pos.Order.count', Shop.orderCount)
    }
  }
/*Shop.init = function(){/* 價錢無或歸零 
    Shop.orderCount = localStorage.getItem('Pos.Order.count')
    if(Shop.orderCount == null){
        Shop.orderCount = 0
        localStorage.setItem('Pos.Order.count',Shop.orderCount)
    }
    
}*/

Shop.incCount = function () {
    // let orderCount = parseInt(localStorage.getItem('Pos.Order.count')) + 1
    localStorage.setItem('Pos.Order.count', ++ Shop.orderCount)
  }

/*Shop.incCount = function(){/* 對所下訂單進行計算 
    localStorage.setItem('Pos.Order.count',++Shop.orderCount,)
    //++Shop.orderCount --> orderCount = parseInt(localStorage.getItem('Pos.Order.count')) + 1
}*/


Shop.saveOrder = function (Order) {
    localStorage.setItem('Pos.Order.' + Shop.orderCount, JSON.stringify(Order))
  }



/*Shop.saveOrder = function(Order){/* 儲存訂單 
    localStorage.setItem('Pos.Order.'+ Shop.orderCount,JSON.stringify(Order))
    /* 此程式碼尚有部分未理解--> JSON.stringify(Order)
}*/


Shop.getOrder = function (i) {
    let orderJson = localStorage.getItem('Pos.Order.'+i)
    if (orderJson == null) return null
    return JSON.parse(orderJson)
  }
/*Shop.getOrder = function(i){ /* 將saveOrder-->orderJson並傳回值 
    let orderJson = localStorage.getItem('Pos.Order.'+i)
    if(orderJson==null) return null 
    return JSON.parse(orderJson)
}*/



/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼   ------------- UI  UI  Ui  Ui  Ui  Ui  Ui  UI  Ui UI  UI  UI  UI--------
  Ui.js  以下有更詳細的註解  */
const Ui = {}

Ui.id = function(path) {
  return document.getElementById(path)
}

Ui.one = function(path) {
  return document.querySelector(path)
}

Ui.showPanel = function(name) {
  document.querySelectorAll('.panel').forEach((node)=>node.style.display='none')
  Ui.id(name).style.display = 'block'
}

Ui.show = function (html) {
  Ui.id('main').innerHTML = html
}

Ui.openNav = function () {
  Ui.id('mySidenav').style.width = '250px'
}

Ui.closeNav = function () {
  Ui.id('mySidenav').style.width = '0'
}   
/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼  
    以下有更詳細的註解  */
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

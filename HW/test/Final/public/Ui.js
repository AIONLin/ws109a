/*  此程式碼參照陳鍾誠老師  並進行部分修改 我能大部分理解此程式碼  
    以下有更詳細的註解  */
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
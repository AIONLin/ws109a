// import 所需
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/session@1.1.0/mod.ts";
//import * as main from './public/main.js'
import * as render from './render.js'

// 創建資料庫 
const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

const session = new Session({ framework: "oak" });
await session.init();

const app = new Application()

const posts = [
  {id: 0, title: 'Welcome', body: 'You can use this to leave a message !'}, 
  {id: 1, title: 'Like This', body: 'Good Job'}
]

const router = new Router()

router.get('/list', list)   // get 比較像明信片 傳送密碼會被看到 post 有包裝 
  .get('/post/:id', show)
  .post('/post', create)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)    
  .get('/logout', logout)
  .get('/',HomePage)  
 


app.use(router.routes())
app.use(router.allowedMethods())
app.use(session.use()(session));

app.use(async (ctx, next) => {
  await next()  // 先給 router 都沒有再回來執行下面
  console.log('path=', ctx.request.url.pathname)
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public/`,
    index: "index.html",             // 資料夾下的index.html
  })
})



/*app.use(async (ctx) => {
  //console.log('path=', ctx.request.url.pathname)
  if (ctx.request.url.pathname.startsWith("/public/")) {
    console.log('pass:', ctx.request.url.pathname)
    await send(ctx, ctx.request.url.pathname, {
      root: Deno.cwd(),
      index: "index.html",
    })
  }
})*/


async function list (ctx) {
  ctx.response.type = 'application/json'   
  ctx.response.body = posts   // 回傳 posts (上面所創建的)
}

async function show (ctx) {
  const id = ctx.params.id
  const post = posts[id]
  if (!post) ctx.throw(404, 'invalid post id')
  ctx.response.type = 'application/json'
  ctx.response.body = post
}

async function create (ctx) {
  // var post = ctx.request.body
  const body = ctx.request.body();   //   取出body 
  console.log('body = ', body)     
  if (body.type === "json") {          // 確認型態
    let post = await body.value;
    const id = posts.push(post) - 1       
    console.log('create:id=>', id)     
    console.log('create:get=>', post)
    post.created_at = new Date()
    post.id = id
    ctx.response.body = post
    console.log('create:save=>', post)
  }
}


async function parseFormBody(body) {       // 讀取 輸入
  const pairs = await body.value           //可以 看出body 型態
  const obj = {}
  for (const [key, value] of pairs) {      // 但是這裡不太明白使用方法
    obj[key] = value
  }
  return obj
}

function userQuery(sql) {
  let list = []
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({id, username, password, email})
  }
  console.log('userQuery: list=', list)
  return list
}

async function signupUi(ctx) {             // 註冊 UI
  ctx.response.body = await render.signupUi();   //  回傳 註冊UI
}

async function signup(ctx) {             //  註冊
  const body = ctx.request.body()        // 取 body 
  if (body.type === "form") {             // 確認型態
    var user = await parseFormBody(body)   // 放入 user 輸入值
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`)   // 先看看有無此人  這裡用到 userQuery
    if (dbUsers.length === 0) {   // 無此人的話 
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]);  // 將使用者資料輸入
      ctx.response.body = render.success()     // 回傳成功畫面
    } else 
      ctx.response.body = render.fail()       // 若 已有資料  回傳 失敗畫面
  }
}


async function loginUi(ctx) {            //  登入 UI 
  ctx.response.body = await render.loginUi();    // 從 render.js 取出loginUi 傳回
}

async function login(ctx) {           //登入 
  const body = ctx.request.body()        // 取出body 
  if (body.type === "form") {            // 確認型態後
    var user = await parseFormBody(body)    // 使用者
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`) // 確認使用者  userMap[user.username]
    var dbUser = dbUsers[0]
    if (dbUser.password === user.password) {     // 確認該使用者密碼
      ctx.state.session.set('user', user)          // 確定後 將 user 值放入
      console.log('session.user=', await ctx.state.session.get('user')) // 印出
      ctx.response.redirect('/');                     // 導回頁面
    } else {
      ctx.response.body = render.fail()          // 若密碼錯誤 回傳 fail 畫面
    }
  }
}

async function logout(ctx) {             // 登出 
  ctx.state.session.set('user', null)   // 將 user 清空
  ctx.response.redirect('/')            // 導回
}

async function HomePage(ctx){
  console.log('進入 Home')
  ctx.response.redirect('/public/index.html')
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 })

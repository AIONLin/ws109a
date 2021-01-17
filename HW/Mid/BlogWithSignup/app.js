// import 所需
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/session@1.1.0/mod.ts";

// 創立一個DB 儲存 註冊帳號與貼文 
const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

const userMap = {
  Lin: { username:'Lin', password: 'Lin' },
  coco: { username:'coco', password: 'coco' }
}

// new 一個 router
const router = new Router();
// 開始使用 get顯示頁面  post回傳
router.get('/', list)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create)

const session = new Session({ framework: "oak" });
await session.init();

const app = new Application();

app.use(session.use()(session));
app.use(router.routes());
app.use(router.allowedMethods());

function sqlcmd(sql, arg1) {       // 使用資料庫
  console.log('sql:', sql)
  try {
    var results = db.query(sql, arg1)
    console.log('sqlcmd: results=', results)
    return results
  } catch (error) {
    console.log('sqlcmd error: ', error)
    throw error
  }
}

function postQuery(sql) {   //  貼文資料顯示
  let list = []
  for (const [id, username, title, body] of sqlcmd(sql)) { 
    list.push({id, username, title, body})                 
  }
  console.log('postQuery: list=', list)
  return list
}

function userQuery(sql) {   //註冊的資料
  let list = []
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({id, username, password, email})
  }
  console.log('userQuery: list=', list)
  return list
}

async function parseFormBody(body) {  //  從 body 取出值
  const pairs = await body.value
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
}

async function signupUi(ctx) {                 // 從 render.js 取出signupUi使用
  ctx.response.body = await render.signupUi(); 
}

async function signup(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {                 // 如果 body型態是 form 
    var user = await parseFormBody(body)       
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`)  // 將使用者輸入的名字
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]); // 將使用者輸入的名字、密碼、郵件放入資料庫
      ctx.response.body = render.success()   // 註冊成功後 顯示 success 的畫面
    } else 
      ctx.response.body = render.fail()       // 失敗 顯示失敗的畫面
  }
}

async function loginUi(ctx) {                    // 從 render.js 取出loginUi使用
  ctx.response.body = await render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var user = await parseFormBody(body)     // 看他輸入
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`) //   從資料庫抓取資料    userMap[user.username]
    var dbUser = dbUsers[0]
    if (dbUser.password === user.password) {       // 密碼輸入正確後
      ctx.state.session.set('user', user)          
      console.log('session.user=', await ctx.state.session.get('user'))
      ctx.response.redirect('/');                  //導回頁面
    } else {
      ctx.response.body = render.fail()            // 失敗畫面
    }
  }
}

async function logout(ctx) {
   ctx.state.session.set('user', null)        // 登出  清空 'user' 的值
   ctx.response.redirect('/')                 // 並導回頁面
}

async function list(ctx) {
  let posts = postQuery("SELECT id, username, title, body FROM posts")  
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}

async function add(ctx) {
  var user = await ctx.state.session.get('user')  // 先 get user
  if (user != null) {        // 存在
    ctx.response.body = await render.newPost(); // 顯示  newPost 的畫面
  } else {
    ctx.response.body = render.fail()
  }
}

async function show(ctx) {            
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, username, title, body FROM posts WHERE id=${pid}`)
  let post = posts[0]
  console.log('show:post=', post)
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body()    // 取出body 
  if (body.type === "form") {        // 確認 body type
    var post = await parseFormBody(body)   // 看使用者輸入甚麼
    console.log('create:post=', post)
    var user = await ctx.state.session.get('user')
    if (user != null) {
      console.log('user=', user)                                    
      sqlcmd("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [user.username, post.title, post.body]);  // 將 post 輸入post資料庫
    } else {
      ctx.throw(404, 'not login yet!');
    }
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });

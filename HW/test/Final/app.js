import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/session@1.1.0/mod.ts";
//import * as main from './public/main.js'
import * as render from './render.js'

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

router.get('/list', list)
  .get('/post/:id', show)
  .post('/post', create)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)    //.get('/login',login)   // 等等回來改大小寫
  .get('/logout', logout)
  .get('./',HomePage)      


app.use(router.routes())
app.use(router.allowedMethods())
app.use(session.use()(session));

app.use(async (ctx, next) => {
  await next()
  console.log('path=', ctx.request.url.pathname)
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public/`,
    index: "index.html",
  })
})



app.use(async (ctx) => {
  //console.log('path=', ctx.request.url.pathname)
  if (ctx.request.url.pathname.startsWith("/public/")) {
    console.log('pass:', ctx.request.url.pathname)
    await send(ctx, ctx.request.url.pathname, {
      root: Deno.cwd(),
      index: "shopcar.html",
    })
  }
})


async function list (ctx) {
  ctx.response.type = 'application/json'
  ctx.response.body = posts
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
  const body = ctx.request.body(); // content type automatically detected
  console.log('body = ', body)
  if (body.type === "json") {
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


async function parseFormBody(body) {       // 下面用到所以我 從07  copy過來
  const pairs = await body.value
  const obj = {}
  for (const [key, value] of pairs) {
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

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

async function signup(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`)   // 這裡用到 userQuery
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]);
      ctx.response.body = render.success()
    } else 
      ctx.response.body = render.fail()
  }
}


async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`) // userMap[user.username]
    var dbUser = dbUsers[0]
    if (dbUser.password === user.password) {
      ctx.state.session.set('user', user)
      console.log('session.user=', await ctx.state.session.get('user'))
      ctx.response.redirect('/');
    } else {
      ctx.response.body = render.fail()
    }
  }
}

async function logout(ctx) {
  ctx.state.session.set('user', null)
  ctx.response.redirect('/')
}

async function HomePage(ctx){
  console.log('進入 Home')
  ctx.response.redirect('/public/index.html')
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 })

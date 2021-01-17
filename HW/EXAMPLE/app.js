import {Application, Router, send} from "https://deno.land/x/oak/mod.ts";

const router = new Router();
const app = new Application();

router.get('/', mainPage);

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
    //console.log('path=', ctx.request.url.pathname)
    if (ctx.request.url.pathname.startsWith("/public/")) {
      console.log('pass:', ctx.request.url.pathname)
      await send(ctx, ctx.request.url.pathname, {
        root: Deno.cwd(),
        index: "shopcar.html",
      });  
    }
});

async function mainPage(ctx){
    console.log('進入 logIn function')
    ctx.response.redirect('/public/shopcar.html')
}

console.log('Server run at http://127.0.0.1:8000');
await app.listen({ hostname: "127.0.0.1", port: 8000});
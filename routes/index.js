var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const fetch = require('node-fetch-commonjs');
var router = express.Router();
let ejs = require('ejs');
let fs = require('fs');


const render = (name, vars)=>{
  const file = fs.readFileSync('views/'+name+'.ejs', 'ascii');
  return ejs.render(file, vars);
}


const doApi = async (path, data, method) => {
  return await (await fetch('http://localhost:8000' + path,
    {
      method: method,
      headers: {
        'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )).text()
}
  

const styleblock = render('styleblock').toString();
require('./schwepe.js').default(router);


router.use("/@:id", async (req, res) => {
  try {
    const data = await (await fetch('http://localhost:8000/api/v1/db/data/v1/247420/Members/'+req.params.id, { headers: { 'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv' } })).json();
    const babies = JSON.parse(fs.readFileSync('public/babies/owners.json'));
    console.log({data, babies});
    let nft = '';
     
    for (ownerindex in babies) {
      if (data.User.toLowerCase() === ownerindex.toLowerCase()) {
        const owned = babies[ownerindex];
        for (babyindex in owned) {
          nft += `<img alt="genesisbaby" height="64" width="64" class="border-solid border-black border-2" title="${owned[babyindex].attributes.map(a => a.trait_type + ':' + a.value).join('\n')}" src="${owned[babyindex].image.replace('ipfs://', 'https://ipfs.io/ipfs/')}">`;
        }
      }
    }
    const header = render('header', {user:req.user, csrfToken:req.session.csrf }).toString();
    return res.render('profile', {...members.filter(a=>a.Id == req.params.id)[0], nft, styleblock, header});
  } catch (e) {
    console.error(e)
    res.end('err')
  }
});


var ensureLoggedIn = ensureLogIn();

router.get("/api/*", async (req, res) => {
  const query = req.url.split('?').length?'?'+req.url.split('?')[1]:'';
  console.log('API', 'http://localhost:8000' + req.path+query?query:'')
  const fetched = await fetch('http://localhost:8000' + req.path+query, {
    headers: {
      'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv',
      'Cache-Control': 'no-store',
    }
  });
  res.end(await (fetched).text());
});
router.delete("/api/*", async function (req, res) {
  const user = req.user;
  console.log({user});
  if (!user) return;
  const loaded = await (await fetch('http://localhost:8000' + req.path, { headers: { 'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv' } })).json();
  console.log(loaded, req.path);
  if (user === loaded.User) {
    res.end(await doApi(req.path, JSON.parse('{}'), 'DELETE'));
  } else {
    res.end(401, 'Unauthorized');
  }
});

router.patch("/api/*", ensureLoggedIn, async function (req, res) {
  console.log("PATCH", req.path, req.user);
  const user = req.user;
  if (!user) return;
  const loaded = await (await fetch('http://localhost:8000' + req.path, {
    headers: {
      'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv'
    }
  })).json();
  console.log({loaded, user});
  if (user.id === loaded.Id) {
    const data = JSON.parse(req.body.data);
    const result = await doApi(req.path, data, 'PATCH')
    console.log({result});
    res.end(result);
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.post("/api/*", async function (req, res) {
  const user = req.user;
  if (!user) return;
  const data = JSON.parse(req.body.data);
  data.User = user;
  const result = doApi(req.path, data, 'POST')
  res.end(JSON.stringify(result));
});
router.get('/login', function(req, res, next) {
  const header = render('header', {user:req.user, csrfToken:req.session.csrf }).toString();
  res.render('login', {styleblock, header});
});

router.get('/:template', async (req, res, next) => {
  const template = req.params.template;
  const lookup = await (await fetch('http://localhost:8000/api/v1/db/data/v1/247420/Pages?where=where%3D%28Title%2Ceq%2C'+template+'%29&limit=25&shuffle=0&offset=0', { headers: { 'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv' } })).json();
  let data = lookup.list[0];
  if(!data) {
    console.error('cant find '+template)
    return res.status(404).send('cant find '+template)
  }
  const header = render('header', {user:req.user, csrfToken:req.session.csrf }).toString();
  if (!req.user) { return res.render('page', {styleblock, header, progress:global.progress, content:data.Body}); }
})


router.get('/', function(req, res, next) {
  const header = render('header', {user:req.user, csrfToken:req.session.csrf }).toString();
  if (!req.user) { return res.render('home', {styleblock, header, progress:'20', members, user:req.user}); }
  else { return res.render('home', {styleblock, header, progress:'20', members, user:req.user}); }
  next();
});

module.exports = router;

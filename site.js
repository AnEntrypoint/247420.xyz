/**
Locally / Non-SSL: node verify-address.js local
**/
require('dotenv').config()

const fs = require("fs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const Web3 = require("web3");
const fetch = require('node-fetch-commonjs');
let httpServer;

//let web3 = new Web3(new Web3.providers.HttpProvider("https://****/"));

let web3 = new Web3("https://polygon-rpc.com");
const abi = {
  abi: [{
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMinted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },]
};
let dns = new web3.eth.Contract(abi.abi, "0xB96635E821Ef53790628705e1B68fca7958b42a3");
let owners = JSON.parse(fs.readFileSync('public/babies/owners.json'));
let oldcount = 0;
const getBabies = async () => {
  let count = await dns.methods.totalMinted().call();
  if (oldcount == count) return;
  for (let x = 0; x < count; x++) {
    try {
      console.log({baby:x});
      const owner = await dns.methods.ownerOf(x).call()
      await new Promise(res=>setTimeout(res,500));
      if (!owners[owner]) owners[owner] = {};
      if(owners[owner][x]) continue;
      const uri = await dns.methods.tokenURI(x).call();
      const json = await (await fetch(uri.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/'))).json();
      owners[owner][x] = json;
      const channel = await client.channels.fetch('843928612276273162');
      if(x > oldcount)channel.send({content: "Genesis baby minted: "+json.name+' '+json.image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/')});
      await new Promise(res=>setTimeout(res,500));
    } catch (e) {
      console.error(e)
    }
  }
  oldcount = count;
  fs.writeFileSync('public/babies/owners.json', JSON.stringify(owners));
}
setInterval(async () => {
  getBabies();
}, 300000);
getBabies();
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.set('Cache-control', 'public, max-age=846000')
  next();
})
app.use(express.static("public"));
app.use(function (req, res, next) {
  res.set('Cache-control', 'public, max-age=1')
  next();
})
const NodeCache = require("node-cache");
const cache = new NodeCache();
const path = require('path');

app.get('/random-png', (req, res) => {
  // specify the directory containing the PNG files
  const directory = 'public/schwepes-transparent';
  
  // read all files in the directory
  fs.readdir(directory, (err, files) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // filter for PNG files
      const pngFiles = files.filter(file => file.endsWith('.png'));
      
      // choose a random file
      const randomFile = pngFiles[Math.floor(Math.random() * pngFiles.length)];
      
      // read the file and send its contents as the response
      fs.readFile(path.join(directory, randomFile), (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.set('Content-Type', 'image/png');
          res.send(data);
        }
      });
    }
  });
});

app.all("/verify", function (req, res) {
  let signatureHex = req.body.signature;
  let address = req.body.address;
  let original_message = req.body.original_message;

  let recoveredAddress = web3.eth.accounts.recover(
    original_message,
    signatureHex
  );

  if (recoveredAddress.toUpperCase() === address.toUpperCase()) {
    //verified
    cache.del(req.body.address);
    cache.del('list');
    fs.writeFileSync("public/members/" + req.body.address + ".json", req.body.data);
    res.send(
      JSON.stringify({
        verified: true,
      })
    );
  } else {
    //failed
    res.send(
      JSON.stringify({
        verified: false,
      })
    );
  }
});

app.use("/@:id", (req, res) => {
  try {
    const address = req.params.id.replace('.json', '');
    const data = JSON.parse(fs.readFileSync("public/members/" + address + ".json"));
    let template = fs.readFileSync('public/profile.html').toString('utf-8');
    let styleblock = fs.readFileSync('public/styleblock.html').toString('utf-8');
    template = template.replace('{{styleblock}}', styleblock);
    let header = fs.readFileSync('public/header.html').toString('utf-8');
    template = template.replace('{{header}}', header);
    for (let entry in data) {
      while (template.indexOf(`{{` + entry + `}}`) != -1) {
        template = template.replace(`{{` + entry + `}}`, data[entry]);
      }
    }
    template = template.replace(`{{discord}}`, data['discord'] || '');
    const babies = JSON.parse(fs.readFileSync('public/babies/owners.json'));
    let nft = '';
    for (ownerindex in babies) {
      if (address.toLowerCase() === ownerindex.toLowerCase()) {
        const owned = babies[ownerindex];
        for (babyindex in owned) {
          nft += `
                <div class="shadow" style="display:inline-block;">
                    <img alt="genesisbaby" height="96" width="96" src="${owned[babyindex].image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/')}">
                    <h6>${owned[babyindex].name}</h6>
                    <div style="font-size:10px">${owned[babyindex].attributes.map(a => '<b>' + a.trait_type + '</b>: ' + a.value).join('<br/>')}</div>
                </div>
            `;
        }
      }
    }
    template = template.replace(`{{nft}}`, nft);

    cache.set(req.params.id, template, 999999999);
    res.setHeader('Content-Type', 'text/html');
    res.end(template);
  } catch (e) {
    console.error(e)
    res.end('err')
  }
});


app.use("/schwepes", (req, res) => {
  const files = fs.readdirSync('./public/schwepes-transparent');
  let htmls =[];
  const cached = cache.get('schwepes');
  if (cached) {
    console.log('cached schwepes');
    res.setHeader('Content-Type', 'text/html');
    res.end(cached);
    return;
  }
  try {
    for (const file of files) {
      htmls.push( `<img alt="genesisbaby" width="200" loading="lazy" style="border-radius: 1em;" src="schwepes-transparent/${file}">`);
    }
    const out = htmls.join('');
    cache.set('schwepes', out, 999999999);
    res.setHeader('Content-Type', 'text/html');
    res.end(out);
  } catch (e) {
    console.error(e);
    res.setHeader('Content-Type', 'text/html');
    res.end('err');
  }
});

app.use("/", (req, res) => {
  const files = fs.readdirSync('./public/members');
  let chunks = [];
  let members =[];
  const cached = cache.get('list');
  if (cached) {
    console.log('cached');
    res.end(cached);
    return;
  }
  try {
    for (const file of files) {
      const address = file.replace('.json', '');
      const member = JSON.parse(fs.readFileSync("public/members/" + file));
      const babies = JSON.parse(fs.readFileSync('public/babies/owners.json'));
      member.nft = '';
      member.babies = [];
      member.address = file.split('.')[0];
      for (ownerindex in babies) {
        if (address.toLowerCase() === ownerindex.toLowerCase()) {
          const owned = babies[ownerindex];
          for (babyindex in owned) {
              member.babies.push(owned);
              member.hasbaby = true;
              member.nft += `
                <div style="display:inline-block;margin:1em;">
                    <img alt="genesisbaby" loading="lazy" style="border-radius: 1em;" height="64" width="64" src="${owned[babyindex].image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/')}">
                </div>
            `;
            //console.log(owned[babyindex]);
          }
        }
      }
      members.push(member);
    }
    members.sort((a,b)=>{
      return b.babies.length-a.babies.length;
    });
    for (let member of members) {
      const data = member;
      let hasbaby = member.hasbaby;
      let template = fs.readFileSync('public/listuser.html').toString('utf-8');
      if (!data.nickname || !data.avatar || !data.shortform || !data.description) continue;
      data.customlistavatarclass = hasbaby ? 'spin' : '';
      for (let entry in data) {
        while (template.indexOf(`{{` + entry + `}}`) != -1) {
          template = template.replace(`{{` + entry + `}}`, data[entry] || '');
        }
      }
      template = template.replace(`{{discord}}`, data['discord'] || '');
      template = template.replace(`{{url}}`, '@' + member.address || '');
      template = template.replace(`{{nft}}`, member.nft);
      chunks.push(template);
    }
    let template = fs.readFileSync('public/list.html').toString('utf-8');
    let styleblock = fs.readFileSync('public/styleblock.html').toString('utf-8');
    template = template.replace('{{styleblock}}', styleblock);
    let header = fs.readFileSync('public/header.html').toString('utf-8');
    template = template.replace('{{header}}', header);
    const out = template.replace('{{content}}', chunks.join(''));
    cache.set('list', out, 999999999);
    res.setHeader('Content-Type', 'text/html');
    res.end(out);
  } catch (e) {
    console.error(e);
    res.setHeader('Content-Type', 'text/html');
    res.end('err');
  }
});


/**
Method
web3.personal.sign(message, signer, (err, signature) => {    
  axios.post('https://.../auth', {
    address: signer,
    signature : signature,
    message : message,
    original_message : original_message
  }).then(response => {
**/

const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("message", (message) => {
  console.log("discord message", message.content);
  const original_message = `0x${Buffer.from(
    "Very Message Such Wow",
    "utf8"
  ).toString("hex")}`;
  if (message.content.startsWith("!wallet")) {
    const signatureHex = message.content.split(" ")[1];
    let recoveredAddress = web3.eth.accounts.recover(
      original_message,
      signatureHex
    );
    //console.log(recoveredAddress);
    const data = fs.writeFileSync("public/discord/" + recoveredAddress + '.json', message.author.id);

    message.channel.send("you are " + recoveredAddress.toUpperCase());
  }
});

client.login(process.env.DISCORDTOKEN);

httpServer = http.createServer(app);

console.log("Listening on port 3100");
httpServer.listen(3000);

const Web3 = require("web3");
let web3 = new Web3("https://polygon-rpc.com");
let fs = require('fs');
const {post} = require(".");
const fetch = require("node-fetch-commonjs");
const {ApolloClient, InMemoryCache, gql} = require("@apollo/client");
const cache = new InMemoryCache();

const client = new ApolloClient({
    // Provide required constructor fields
    cache: cache,
    uri: "https://api.lens.dev/"
});


const abi = {
    abi: [
        {
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
        }, {
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
        }, {
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
        },
    ]
};
let dns = new web3.eth.Contract(abi.abi, "0xB96635E821Ef53790628705e1B68fca7958b42a3");

// let owners = JSON.parse(fs.readFileSync('public/babies/owners.json'));
let oldcount = 0;
const getBabies = async () => {
    let count = await dns.methods.totalMinted().call();
    if (oldcount == count) 
        return;
    
    for (let x = 0; x < count; x++) {
        try {
            console.log({baby: x});
            const owner = await dns.methods.ownerOf(x).call()
            await new Promise(res => setTimeout(res, 500));
            if (!global.owners) 
                global.owners = {}
            
            if (!global.owners[owner]) 
                global.owners[owner] = {};
            
            if (global.owners[owner][x]) 
                continue;
            
            const uri = await dns.methods.tokenURI(x).call();
            const json = await(await fetch(uri.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/'))).json();
            owners[owner][x] = json;
            // const channel = await client.channels.fetch('843928612276273162');
            // if (x > oldcount) {
            // channel.send({ content: "Genesis baby minted: " + json.name + ' ' + json.image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/') });
            // ss}
            await new Promise(res => setTimeout(res, 500));
            
        } catch (e) {
            console.error(e)
        }
    }
    global.progress = oldcount = count;
    global.owners = owners;
    fs.writeFileSync('babies.json', JSON.stringify(owners));

    // fs.writeFileSync('public/babies/owners.json', JSON.stringify(owners));
}

const getMembers = (async () => {
  global.members = (await(await fetch('http://localhost:8002/api/v1/db/data/v1/247420/Members', {
      headers: {
          'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv'
      }
  })).json()).list;
  console.log(members);
  try {
      for (const member of global.members) {
          member.Posts = [];
      }
      for (const member of global.members) {
          // console.log(member);
          const address = member.User;
          const babies = JSON.parse(fs.readFileSync('public/babies/owners.json'));
          member.nft = '';
          // console.log(member);
          member.url = '/@' + member.Id;
          member.babies = [];

          const eth = member.User;
          console.log({eth});
          try {

              member.Lens = (await client.query({query: gql `
  query Profiles {
    profiles(request: { ownedBy: ["${eth}"], limit: 10 }) {
      items {
        id
      }
      pageInfo {
        prev
        next
        totalCount
      }
    } 
  }     
`})).data.profiles.items;
              console.log(member.Lens);
          } catch (e) {
              // console.error(e);
          }
          if (member.Lens && member.Lens.length) 
              member.Posts = (await client.query({
                  query: gql `
query Publications($id: ProfileId!, $limit: LimitScalar) {
  publications(request: {
    profileId: $id,
    publicationTypes: [POST],
    limit: $limit
  }) {
    items {
      __typename 
      ... on Post {
        ...PostFields
      }
    }
  }
}
fragment PostFields on Post {
  id
  createdAt
  metadata {
    ...MetadataOutputFields
  }
}
fragment MetadataOutputFields on MetadataOutput {
  name
  description
  content
  media {
    original {
      ...MediaFields
    }
  }
  attributes {
    displayType
    traitType
    value
  }
}
fragment MediaFields on Media {
  url
  mimeType
}      
`,
                  variables: {
                      id: member.Lens[0].id
                  }
              })).data.publications.items;
          
          console.log(member.Posts);
          if (! member.Posts) 
              member.Posts = [];
          
          for (const Post of member.Posts) {
              // console.log(Post);
              console.log({Post});
              Post.metadata = JSON.parse(Post.Data || '{}');
              Post.Media = Post.metadata ?. media;
          }
          for (ownerindex in babies) {
              if (address.toLowerCase() === ownerindex.toLowerCase()) {
                  const owned = babies[ownerindex];
                  for (babyindex in owned) {
                      member.babies.push(owned);
                      member.hasbaby = true;
                      member.nft += `
        <div style="display:inline-block;margin:1em;">
            <img alt="genesisbaby" loading="lazy" style="border-radius: 1em;" height="64" width="64" src="${
                          owned[babyindex].image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/')
                      }">
        </div>
    `;
                  }
              }
          }
      }
      global.members.sort((a, b) => b.babies.length - a.babies.length);
      fs.writeFileSync('members.json', JSON.stringify(members));
  } catch (e) {
      console.error(e);
  }
})
setInterval(async () => {
  await getMembers();
  await getBabies();
}, 300000);
try {
  global.owners = JSON.parse(fs.readFileSync('babies.json'));
  global.members = JSON.parse(fs.readFileSync('members.json'));
} catch(e) {
  console.error(e);
  getMembers();
  getBabies();
}

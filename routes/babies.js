const Web3 = require("web3");
let web3 = new Web3("https://polygon-rpc.com");
let fs = require('fs');
const fetch = require("node-fetch-commonjs");
const {ApolloClient, InMemoryCache, gql} = require("@apollo/client");
const cache = new InMemoryCache();
// const db = require('../db/index.js');
const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  }

const client = new ApolloClient({ // Provide required constructor fields
    cache: cache,
    defaultOptions: defaultOptions,
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
            const json = await(await fetch(uri.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/').replace('ar://', 'https://gateway.ipfscdn.io/ipfs/'))).json();
            owners[owner][x] = json;

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
function findHashtags(searchText) {
    var regexp = /(\s|^)\#\w\w+\b/gm
    result = searchText.match(regexp);
    if (result) {
        result = result.map(function (s) {
            return s.trim().replace('#', '');
        });
        console.log(result);
        return result;
    } else {
        return false;
    }
}
const toSteem = (network, member, Post) => { // if(member.Lens[0].handle === 'teknopath')
    if (fs.existsSync(`data/lens-${network}/${
        member.Lens[0].id
    }`)) {
        // if (Post.id.startsWith('0xb80e'))
        // console.log(JSON.stringify(Post, null, 2))

        try {
            address = JSON.parse(fs.readFileSync(`data/lens-${network}/${
                member.Lens[0].id
            }`))
            console.log({address});
            if (address) {
                if (! fs.existsSync(`data/lens-${network}-done/${
                    Post.id
                }`)) {
                    console.log('not existant');
                    const taglist = findHashtags(Post.metadata.content);

                    const json_metadata = {
                        tags: taglist,
                        users: [address],
                        links: [],
                        image: []
                    };
                    const permlink = "meme" + Math.random().toString(36).substring(2);
                    let body = Post.metadata.content || Post.metadata.description;
                    for (const Media of Post.metadata.media || []) { // console.log(Media)
                        if (Media.original.mimeType == 'video/mp4') {
                            const vid = "\n" + Media.original.url.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/').replace('ar://', 'https://gateway.ipfscdn.io/ipfs/') + "\n";
                            body += `[![POST IMAGE](${
                                Post.metadata.image
                            })] (${vid})`;
                        }
                        if (Media.original.mimeType.startsWith('image')) {
                            const image = "\n" + Media.original.url.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/').replace('ar://', 'https://gateway.ipfscdn.io/ipfs/') + "\n";
                            body += `![POST IMAGE](${image})`;
                            json_metadata.image.push(image)
                            json_metadata.links.push(image)
                        } else {
                            const image = "\n" + Post.image
                            if (image) {
                                body += `![POST IMAGE](${image})`;
                                json_metadata.image.push(image)
                                json_metadata.links.push(image)
                            }
                        } body += "\n";
                        body += "See original post here: \n" + "https://lenster.xyz/posts/" + Post.id;


                    }
                    const op = [
                        "comment", {
                            author: address,
                            body,
                            json_metadata: JSON.stringify(json_metadata),
                            parent_author: "",
                            parent_permlink: (taglist[0] ? taglist[0].toString() : "247420").replace('#', ''),
                            permlink: permlink.toString("hex"),
                            title: Post.metadata.description || Post.metadata.name || Post.metadata.content
                        },
                    ];
                    fs.writeFileSync(`data/created-${network}/lens-${
                        permlink.toString("hex")
                    }`, JSON.stringify(op));
                    fs.writeFileSync(`data/lens-${network}-done/${
                        Post.id
                    }`, '');
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// db.Member.sync({alter: true});

const getMembers = (async () => {
    global.members = (await(await fetch('http://localhost:8002/api/v1/db/data/v1/247420/Members', {
        headers: {
            'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv'
        }
    })).json()).list;
    // console.log(members);
    try {
        for (const member of global.members) {
            member.Posts = [];
        }
        console.log('getting members');
        for (const member of global.members) { // console.log(member);
            const address = member.User;
            const babies = JSON.parse(fs.readFileSync('public/babies/owners.json'));
            member.nft = '';
            // console.log(member);
            member.url = '/@' + member.Id;
            member.babies = [];

            const eth = member.User;
            try {

                member.Lens = (await client.query({query: gql `
  query Profiles {
    profiles(request: { ownedBy: ["${eth}"], limit: 10 }) {
      items {
        id
        handle
        bio
      }
      pageInfo {
        prev
        next
        totalCount
      }
    } 
  }     
`})).data.profiles.items;
                // console.log(member.Lens);
            } catch (e) { // console.error(e);
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
  image
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
            


            // console.log(member.Posts);
            if (! member.Posts) 
                member.Posts = [];
            


            for (const Post of member.Posts) {
                // console.log(Post);
                // console.log({Post});
                Post.metadata = JSON.parse(Post.Data || '{}');
                Post.Media = Post.metadata ?. media;
                toSteem('steem', member, Post);
                toSteem('hive', member, Post);
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
                            owned[babyindex].image.replace('ipfs://', 'https://gateway.ipfscdn.io/ipfs/').replace('ar://', 'https://gateway.ipfscdn.io/ipfs/')
                        }">
        </div>
    `;
                    }
                }
            }
        }
        global.members.sort((a, b) => b.babies ?. length - a.babies ?. length);
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
    throw new Error();
    global.owners = JSON.parse(fs.readFileSync('babies.json'));
    global.members = JSON.parse(fs.readFileSync('members.json'));
} catch (e) {
    getMembers();
    getBabies();
}

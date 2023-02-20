var express = require('express');
var passport = require('passport');
var EthereumStrategy = require('passport-ethereum-siwe');
var SessionNonceStore = require('passport-ethereum-siwe').SessionNonceStore;
var fetch = require('node-fetch-commonjs')
require('./babies.js');


var store = new SessionNonceStore();
 
passport.use(new EthereumStrategy({ store: store }, async function verify(address, cb) {
  console.log("CHECKING ", address);
  const lookup = await (await fetch('http://localhost:8002/api/v1/db/data/v1/247420/Members?where=where%3D%28User%2Ceq%2C'+address+'%29&limit=25&shuffle=0&offset=0', { headers: { 'xc-token': '55Jw_CWV4FLDzIsi2pKMVulCzSadVFNs96C1WYEv' } })).json();
  console.log({address, lookup});
  if(lookup.list.length) {
    let data = lookup.list[0];
    console.log(data);
    data.id = data.Id;
    return cb(null, {username:data.Pseudonym, ...data});
  } else {
    console.log('not found');
    return cb('not found');

  }
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


var router = express.Router();
console.log('auth')

router.post('/login/ethereum', passport.authenticate('ethereum', {
  failureMessage: true,
  failWithError: true
}), function(req, res, next) {
  console.log("SIGNED IN");
  res.json({ ok: true, location: '/' });
}, function(err, req, res, next) {
  console.log(err, req.body, "NOT SIGNED IN");
  var cxx = Math.floor(err.status / 100);
  if (cxx != 4) { return next(err); }
  res.json({ ok: false, location: '/login' });
});

router.post('/login/ethereum/challenge', function(req, res, next) {
  store.challenge(req, function(err, nonce) {
    if (err) { return next(err); }
    res.json({ nonce: nonce });
  });
});
  
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;

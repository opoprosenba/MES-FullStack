const c = require('crypto');
function simpleHashMD5(password, salt, iters) {
  let pwd = Buffer.from(password, 'utf-8');
  let s = Buffer.from(salt, 'utf-8');
  let combined = Buffer.concat([pwd, s]);
  let hash = c.createHash('md5').update(combined).digest();
  for (let i = 1; i < iters; i++) {
    hash = c.createHash('md5').update(Buffer.concat([hash, s])).digest();
  }
  return hash.toString('hex');
}
function md5Only(password, salt, iters) {
  let pwd = Buffer.from(password, 'utf-8');
  let s = Buffer.from(salt, 'utf-8');
  let hash = c.createHash('md5').update(pwd).digest();
  for (let i = 1; i < iters; i++) {
    hash = c.createHash('md5').update(hash).digest();
  }
  return hash.toString('hex');
}
console.log('target:', '038bdaf98f7f48c89e7a1d4d5c60cac1');
console.log('SimpleHash(123,admin,3):', simpleHashMD5('123','admin',3));
console.log('SimpleHash(123456,admin,3):', simpleHashMD5('123456','admin',3));
console.log('MD5-only(123,admin,3):', md5Only('123','admin',3));
console.log('MD5-only(123456,admin,3):', md5Only('123456','admin',3));
// try salt-first
function saltFirst(p,s,i){let sb=Buffer.from(s),pw=Buffer.from(p);let h=c.createHash('md5').update(Buffer.concat([sb,pw])).digest();for(let k=1;k<i;k++)h=c.createHash('md5').update(Buffer.concat([sb,h])).digest();return h.toString('hex');}
console.log('SaltFirst(123,admin,3):', saltFirst('123','admin',3));
console.log('SaltFirst(123456,admin,3):', saltFirst('123456','admin',3));
// try md5 with hex or base64 encoded
function hexIter(p,s,i){let h=c.createHash('md5').update(p+s).digest('hex');for(let k=1;k<i;k++)h=c.createHash('md5').update(h).digest('hex');return h;}
console.log('HexIter(123,admin,3):', hexIter('1
var r = require('jsrsasign');

// Expand jsrsasign's RSAKey structure to enable PEM public key loading
r.RSAKey.prototype.readPublicKeyFromPEMString = function(string)
{
  var info = new r.asn1.x509.SubjectPublicKeyInfo();
  info.setRSAPEM(string);
  this.setPublic(info.rsaKey.n, info.rsaKey.e);
};

(function()
{
  'use strict';
  root.ENGINE = root.ENGINE ||
  {};

  ENGINE.crypto = {};
  ENGINE.crypto.aes = {};
  ENGINE.crypto.rsa = {};

  ENGINE.crypto.rsa.key = function()
  {
    this.bits = undefined;
    this.public = undefined;
    this.private = undefined;

    this.rsa = new r.RSAKey();

    this.setPublicPEM = function(data)
    {
      this.public = data;
      this.rsa.readPublicKeyFromPEMString(this.public);
    };

    this.setPrivatePEM = function(data)
    {
      this.private = data;
      this.rsa.readPrivateKeyFromPEMString(this.private);
    };
  };

  ENGINE.crypto.rsa.sign = function(key, data, algo)
  {
    return key.rsa.signString(data, (algo || "sha256").toLowerCase());
  };

  ENGINE.crypto.rsa.verify = function(key, data, hash)
  {
    return key.rsa.verifyString(data, hash);
  };
})();

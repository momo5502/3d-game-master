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
/*
  var testPriv = "-----BEGIN RSA PRIVATE KEY----- MIIEogIBAAKCAQEAm/X9mgFLdjinW8elBwdRfy5sfCQMEssu4wEv9H1ByqqwAZhm RpteHymmlWrWAg5UtNGPe6fhX6ZPY7i/TD1+XpoMqvHcJb6Po1tftxvEDsy6X1tz sJQYPhg5QtbUmGKX/x+SqsYxIUcucLz49KxtHyT0UsQJmqSbhlYpFRfU9WcJx7Cp LjwiPp3xqcBBaFL7ocetEIUwYRCsX5qLldt/EO3Iio931GlVpNQUG2oSt5EMO1ak xIHUq+bm2qfxdesZ5rgvFjd705Kf26hGYpdog95wawsYyA87gbR8xiIx+yYwVV1m KEv6Hn4gBcMcaP8GuiCs33VqIPfWLghUeu6VZQIDAQABAoIBAFuD5OPRjq44YDwC 0ltld/ThENdnb443m7OoprMYLNr3fX/yJVGZKYmvrwhOQHXEYwAXV9J/mEfAFyW0 6suZ6eUpD/XfJgcf4rlAjNGtgUYN6+64gxJCVFdbb35BAU7Jy9bwd+etlHaqhh2x RYSNCRsVXCiUz+3mWTxiooi2C0hT1duI0g9pam7PsLkmQpFP6m6oClTLRHYbxj++ RbRSamXbMpK1+rc5ApUsQw9j/yRcnTrvFZMndL5oJMTbIbV5mWznD2leGBiiq4O8 yAR5w6nPg2VHJblZa7DcR//WfM+8Fp31KUf8pupbGkd3tv3npWzUzw+OGLl5dnBT zfculQECgYEA+HHjZ9ovvsrfr7kZPmlSILsqMtDIQyobQAyol8N79I9RvLvy6s3h fEZbBwnS0RWcwKUkDHUOdMXECO+z9P09LAbeQ6vEcxOc04YTu9F9So0IMzzotQQq ZjZEb4I3EBD+Ta2xwJKN4eRPEarFz/lvMKotguF2MzBLuj5897CWK6kCgYEAoLQg WZyBl4jfHpKcEc3U8o5NAGvL4hM4+b9llmTg9flzaMCMYNeIy7HFvNdjgGsutMUI rerRNjbJN2hDqo9lxmwEVeyfcI24vVOpO5SNQT+5BS02SY9jtTg2bGfgSmabujhk 7aipffPEMcDasVFf/YxXGVjsXDjRtUzVWJA2kV0CgYBh4420N5WkWQ71j7rQinLf jp870mN1gzulatdqpI1MeMO911gJCAGWE6p+BXLZCujuRqMDfYOqotlwo/GFz9mw ZSxiAWWv6cRa23MfB5WUMClQ9ujBmdiS2ULxpJ7JZ8irFor400WwAWLeFSlHnoIe 7I5uCSOnW5oa0dAvT5Z7sQKBgFK4JSa7PqGHnIGaKaeocYJg6RXcZtf52QwFDv94 8arrOhKjeh6nEwz2drgbjmYdxa7a9PrAsevcC3rvulTi9xpJo3mvEOrYqE0b8TJv 5r29VTlq6lS28DXpt2nZlkP1yRbzzE/gz0272jNZ97fqESTrxjGP6ioWPSu7Xt31 bYEpAoGANel0mW/jNOrrLD4ITOGm+eAAUoC6Pf8x8MnpHZ56LBkpkGzsGCunTp+R lXrxt+xWNAIsfULKctzPEgZyTzoX3NTJt+bUGFlWE4p4LXJsCNIB4xULtFitpUGK xYgmj23Ba757B6F57RRv3OFC340va726rKpxIugbrpP0WF/5VpE= -----END RSA PRIVATE KEY-----";
  var testPub = "-----BEGIN PUBLIC KEY----- MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm/X9mgFLdjinW8elBwdR fy5sfCQMEssu4wEv9H1ByqqwAZhmRpteHymmlWrWAg5UtNGPe6fhX6ZPY7i/TD1+ XpoMqvHcJb6Po1tftxvEDsy6X1tzsJQYPhg5QtbUmGKX/x+SqsYxIUcucLz49Kxt HyT0UsQJmqSbhlYpFRfU9WcJx7CpLjwiPp3xqcBBaFL7ocetEIUwYRCsX5qLldt/ EO3Iio931GlVpNQUG2oSt5EMO1akxIHUq+bm2qfxdesZ5rgvFjd705Kf26hGYpdo g95wawsYyA87gbR8xiIx+yYwVV1mKEv6Hn4gBcMcaP8GuiCs33VqIPfWLghUeu6V ZQIDAQAB -----END PUBLIC KEY-----";

  var pubTest = new ENGINE.crypto.rsa.key();
  pubTest.setPublicPEM(testPub);

  var privTest = new ENGINE.crypto.rsa.key();
  privTest.setPrivatePEM(testPriv);

  var message = "test";
  var hash = ENGINE.crypto.rsa.sign(privTest, message);

  console.log(ENGINE.crypto.rsa.verify(pubTest, message, hash));*/
})();

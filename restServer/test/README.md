The following describes how to create the key and self signed certificate used for testing.

1. generate a RSA 2048 private key
  1.a openssl genrsa 2048 > rsa-private.pem
  1.b look at key openssl rsa  -in rsa-private.pem -noout -text

2. generate a RSA public key based on the private key
  2.a openssl rsa -in rsa-private.pem -pubout > rsa-public.pem
  2.b look at it more rsa-public.pem

3. Generate a certificate signing request (CSR) - note don't need for a self signing but hey
  3.a openssl req -new -key rsa-private.pem -out rsa.csr
  3.b look at openssl req -text -in rsa.csr -noout

4. Self sign the certificate - NO extension file
  4.b openssl x509 -req -days 365 -in rsa.csr -signkey rsa-private.pem -out rsa.x509crt

5. Examine the certificate
  5.a openssl x509 -text -in rsa.x509crt -noout

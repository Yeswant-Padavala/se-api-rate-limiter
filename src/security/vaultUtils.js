export async function encryptValue(vaultClient, keyName, plaintext) {
  const res = await vaultClient.write(`transit/encrypt/${keyName}`, { plaintext: Buffer.from(plaintext).toString('base64')});
  return res.data.ciphertext;
}

export async function decryptValue(vaultClient, keyName, ciphertext) {
  const res = await vaultClient.write(`transit/decrypt/${keyName}`, { ciphertext });
  return Buffer.from(res.data.plaintext, 'base64').toString('utf8');
}

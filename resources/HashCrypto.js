const HashCrypto = {
  // current password
  password: '',

  // steps
  difficulty: 10,

  async build(data) {
    const [hashKey, iv] = await Promise.all([ this.grindKey(this.password, this.difficulty), this.getIv(this.password, data) ]);

    const key = await window.crypto.subtle.importKey(
      'raw',
      hashKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )

    const encrypted = await window.crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      new TextEncoder('utf-8').encode(data)
    )

    const result = Array.from(iv).concat(Array.from(new Uint8Array(encrypted)))

    return this.base64Encode(new Uint8Array(result))
  },

  async decrypt(ciphertext) {
    const ciphertextBuffer = Array.from(this.base64Decode(ciphertext))
    const hashKey = await this.grindKey(this.password, this.difficulty)

    const key = await window.crypto.subtle.importKey(
      'raw',
      hashKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const decrypted = await window.crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: new Uint8Array(ciphertextBuffer.slice(0, 12)),
        tagLength: 128,
      },
      key,
      new Uint8Array(ciphertextBuffer.slice(12))
    )

    return new TextDecoder('utf-8').decode(new Uint8Array(decrypted))
  },

  grindKey(password) { return this.pbkdf2(password, password + password, Math.pow(2, this.difficulty), 32, 'SHA-256') },

  getIv(password, data) {
    const randomData = this.base64Encode(window.crypto.getRandomValues(new Uint8Array(12)))
    return this.pbkdf2(password + randomData, data + (new Date().getTime().toString()), 1, 12, 'SHA-256')
  },

  async pbkdf2(message, salt, iterations, keyLen, algorithm) {
    const msgBuffer = new TextEncoder('utf-8').encode(message)
    const msgUint8Array = new Uint8Array(msgBuffer)
    const saltBuffer = new TextEncoder('utf-8').encode(salt)
    const saltUint8Array = new Uint8Array(saltBuffer)

    const key = await crypto.subtle.importKey('raw', msgUint8Array, {
      name: 'PBKDF2'
    }, false, ['deriveBits'])

    const buffer = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt: saltUint8Array,
      iterations: iterations,
      hash: algorithm
    }, key, keyLen * 8)

    return new Uint8Array(buffer)
  },

  base64Encode(u8) { return btoa(String.fromCharCode.apply(null, u8)) },

  base64Decode(str) { return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0))) }

}
const { IP, FP, KP, CP, P, E, Sbox } = require("./tables.js");

let buffer = "HelloWorld";
let key = "Hellhell";

DES(buffer, "E", key);

function DES(string, mode, key) {
  if (mode === "E") {
    key = keyEncrypt(text2Binary(key));
    let encrypted = feistelChipher("E", initialPermutation(string), key);
    let decrypted = feistelChipher(
      "D",
      initialPermutation2(sep(encrypted, 64)),
      key
    );
    console.log(binary2Text(decrypted));
  }
}

function keyEncrypt(key) {
  let str = "";
  for (let i = 0; i < key.length; i++) {
    if (i % 8 !== 0) {
      str += key[i];
    }
  }
  return shift(shift(key, KP), CP);
}

function feistelChipher(mode, strings, key) {
  if (mode === "E") {
    for (let i = 0; i < strings.length; i++) {
      for (let j = 0; j < 16; j++) {
        let _L = strings[i].R;
        let _R = XOR(strings[i].R, key);
        [strings[i].L, strings[i].R] = [_L, _R];
      }
      strings[i] = `${strings[i].L}${strings[i].R}`;
    }
    return strings.join("");
  }
  if (mode === "D") {
    for (let i = 0; i < strings.length; i++) {
      for (let j = 0; j < 16; j++) {
        let _R = strings[i].L;
        let _L = XOR(strings[i].L, key);
        [strings[i].L, strings[i].R] = [_L, _R];
      }
      strings[i] = `${strings[i].L}${strings[i].R}`;
    }
    return strings.join("");
  }
}

function initialPermutation(strings) {
  strings = sep(text2Binary(strings), 64); //массив по 64 бита
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].length / 8 !== 8) {
      strings[i] += "\x00".repeat(8 - strings[i].length / 8); // добавление пробелов, чтобы было 64 бита
    }
    strings[i] = {
      L: shift(strings[i], IP).substr(0, 32),
      R: shift(strings[i], IP).substr(32),
    };
  }
  return strings;
}

function initialPermutation2(strings) {
  for (let i = 0; i < strings.length; i++) {
    strings[i] = {
      L: shift(strings[i], IP).substr(0, 32),
      R: shift(strings[i], IP).substr(32),
    };
  }
  return strings;
}

function text2Binary(text) {
  return Array.from(text)
    .reduce((acc, char) => acc.concat(char.charCodeAt().toString(2)), [])
    .map((bin) => "0".repeat(8 - bin.length) + bin)
    .join("");
}

function shift(string, table) {
  let str = "";
  for (let i = 0; i < table.length; i++) {
    str += string[table[i] - 1];
  }
  return str;
}

function XOR(stringa, stringb) {
  let c = "";
  for (let i = 0; i < stringa.length; i++) {
    if (stringa[i] == stringb[i]) {
      c += "0";
    } else {
      c += "1";
    }
  }
  return c;
}

function binary2Text(str, mode) {
  str = str.replace(/\s+/g, "");
  str = str.match(/.{1,8}/g).join(" ");

  var binString = "";

  str.split(" ").map(function (bin) {
    binString += String.fromCharCode(parseInt(bin, 2));
  });

  return mode === "y" ? binString.replace("\x00", "") : binString;
}

function sep(xs, s) {
  return xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : [];
}

const { IP, FP, KP, CP, P, E, Sbox } = require("./tables.js");

let buffer = "HelloWorld";
let key = "Hell";

DES(buffer, "E", key);

function DES(string, mode, key) {
  if (mode === "E") {
    key.length > 8
      ? (key = key.substr(0, 8))
      : (key += binary2Text("#").repeat(8 - key.length)); // выравнивание длины ключа под 64 бита
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
    let str = "";
    for (let i = 0; i < strings.length; i++) {
      for (let j = 0; j < 16; j++) {
        let _L = strings[i].R;
        let _R = sep(XOR(shift(strings[i].R, E), key), 6);
        for (let k = 0; k < _R.length; k++) {
          let [a, b] = [`${_R[k][0]}${_R[k][5]}`, _R[k].substr(1, 4)];
          [a, b] = [parseInt(a, 2), parseInt(b, 2)];
          let s = Sbox[k][a][b];
          s.toString(2).length !== 4
            ? (s = "0".repeat(4 - s.toString(2).length) + s.toString(2))
            : (s = s.toString(2));
          str += s;
        }
        _R = XOR(_L, shift(str, P));
        [strings[i].L, strings[i].R] = [_L, _R];
        str = "";
      }
      strings[i] = shift(`${strings[i].L}${strings[i].R}`, FP);
    }
    return strings.join("");
  }
  if (mode === "D") {
    let str = "";
    for (let i = 0; i < strings.length; i++) {
      for (let j = 0; j < 16; j++) {
        let _R = strings[i].L;
        let _L = sep(XOR(shift(strings[i].L, E), key), 6);
        for (let k = 0; k < _L.length; k++) {
          let [a, b] = [`${_L[k][0]}${_L[k][5]}`, _L[k].substr(1, 4)];
          [a, b] = [parseInt(a, 2), parseInt(b, 2)];
          let s = Sbox[k][a][b];
          s.toString(2).length !== 4
            ? (s = "0".repeat(4 - s.toString(2).length) + s.toString(2))
            : (s = s.toString(2));
          str += s;
        }
        _L = XOR(_R, shift(str, P));
        [strings[i].L, strings[i].R] = [_L, _R];
        str = "";
      }
      strings[i] = shift(`${strings[i].L}${strings[i].R}`, FP);
    }
    return strings.join("");
  }
}

function initialPermutation(strings) {
  strings = sep(text2Binary(strings), 64); //массив по 64 бита
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].length / 8 !== 8) {
      strings[i] += "#".repeat(8 - strings[i].length / 8); // добавление пробелов, чтобы было 64 бита
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

  return binString;
}

function sep(xs, s) {
  return xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : [];
}

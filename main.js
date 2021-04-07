const { IP, KP, CD, CP, PP, Sbox, FP, EP } = require("./DES");

let string = "Hello World Hello World Hello World";
let key = "Hell";
string = initialPermutation(string);
key = encryptKey(key);
DES(initialPermutation(DES(string, key, "E")), key, "D");

function initialPermutation(strings) {
  strings = sep(text2Binary(strings), 64); //массив по 64 бита
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].length / 8 !== 8) {
      strings[i] += text2Binary(" ").repeat(8 - strings[i].length / 8); // добавление пробелов, чтобы было 64 бита
    }
    strings[i] = {
      L: shift(strings[i], IP).substr(0, 32),
      R: shift(strings[i], IP).substr(32),
    };
  }
  return strings;
}

function DES(strings, key, ED) {
  if (ED === "E") {
    for (let i = 0; i < strings.length; i++) {
      for (let j = 0; j < 16; j++) {
        let _L = strings[i].R;
        let _R = sep(XOR(shift(strings[i].R, EP), key), 6);

        for (let j = 0; j < _R.length; j++) {
          let [a, b] = [_R[j][0] + _R[j][5], _R[j].substr(1, 4)];
          [a, b] = [parseInt(a, 2), parseInt(b, 2)];
          let s = Sbox[j][a][b];
          s.toString(2).length !== 4
            ? (s = "0".repeat(4 - s.toString(2).length) + s.toString(2))
            : (s = s.toString(2));
          _R[j] = s;
        }
        _R = XOR(strings[i].L, shift(_R.join(""), PP));
        [strings[i].R, strings[i].L] = [_R, _L];
      }
      strings[i] = shift(strings[i].L + strings[i].R, IP);
    }
    return binary2Text(sep(strings.join(""), 8));
  }
  if (ED === "D") {
    for (let i = 0; i < strings.length; i++) {
      for (let j = 15; j >= 0; j--) {
        let _R = strings[i].L;
        let _L = sep(XOR(shift(strings[i].L, EP), key), 6);

        for (let j = 0; j < _L.length; j++) {
          let [a, b] = [_L[j][0] + _L[j][5], _L[j].substr(1, 4)];
          [a, b] = [parseInt(a, 2), parseInt(b, 2)];
          let s = Sbox[j][a][b];
          s.toString(2).length !== 4
            ? (s = "0".repeat(4 - s.toString(2).length) + s.toString(2))
            : (s = s.toString(2));
          _L[j] = s;
        }
        _L = XOR(strings[i].R, shift(_L.join(""), PP));
        [strings[i].R, strings[i].L] = [_R, _L];
      }
      strings[i] = shift(strings[i].L + strings[i].R, IP);
    }
    console.log(binary2Text(sep(strings.join(""), 8)));
    return binary2Text(sep(strings.join(""), 8));
  }
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

function encryptKey(key) {
  key.length > 8
    ? (key = key.substr(0, 8))
    : (key += " ".repeat(8 - key.length));
  key = shift(shift(text2Binary(key), KP), CP);
  return key;
}

function shift(string, table) {
  let str = "";
  for (let i = 0; i < table.length; i++) {
    str += string[table[i] - 1];
  }
  return str;
}

function sep(xs, s) {
  return xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : [];
}

function text2Binary(text) {
  return Array.from(text)
    .reduce((acc, char) => acc.concat(char.charCodeAt().toString(2)), [])
    .map((bin) => "0".repeat(8 - bin.length) + bin)
    .join("");
}

function binary2Text(binary) {
  let str = "";
  for (let i = 0; i < binary.length; i++) {
    str += String.fromCharCode(parseInt(binary[i], 2));
  }
  return str;
}

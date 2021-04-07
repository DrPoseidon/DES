const { IP, EP, KP, CD, CP, P } = require("./DES");

function text2Binary(text) {
  return Array.from(text)
    .reduce((acc, char) => acc.concat(char.charCodeAt().toString(2)), [])
    .map((bin) => "0".repeat(8 - bin.length) + bin)
    .join(" ");
}

function binary2Text(binary) {
  return binary
    .split(" ")
    .map((bin) => String.fromCharCode(parseInt(bin, 2)))
    .join("");
}

function firstEncrypt(cryptedArr, value) {
  let arr = [];
  let tmp = [];
  let string = "";
  for (let i = 0; i < cryptedArr.length; i++) {
    for (let j = 0; j < cryptedArr[i].length; j++) {
      string += cryptedArr[i][value[j] - 1];
    }
    arr.push(string);
    string = "";
  }

  arr.forEach((el, index) => {
    tmp[index] = { L: el.substr(0, 32), R: el.substr(32) };
  });
  return tmp;
}

function middleAction(string) {
  const splitStr = string.match(/.{1,8}/g);
  let cryptedArr = [];
  for (let i = 0; i < splitStr.length; i++) {
    if (splitStr[i].length < 8) {
      cryptedArr.push(
        text2Binary(splitStr[i] + " ".repeat(8 - splitStr[i].length))
      );
    } else {
      cryptedArr.push(text2Binary(splitStr[i]));
    }
  }
  for (let i = 0; i < cryptedArr.length; i++) {
    cryptedArr[i] = cryptedArr[i].replace(/\s/g, "");
  }
  return cryptedArr;
}

function swap(value, arr) {
  let string = "";
  for (let i = 0; i < value.length; i++) {
    value[arr[i] - 1] ? (string += value[arr[i] - 1]) : (string += value[i]);
  }
  return string;
}

function keyEncryption(key) {
  key.length > 8 ? (key = key.substr(0, 8)) : key;
  let encryptedKey = text2Binary(key).replace(/\s/g, "");
  encryptedKey = swap(encryptedKey, KP);
  let tmp = "";
  for (let i = 0; i < encryptedKey.length; i++) {
    // удаление каждого восьмого символа
    if ((i + 1) % 8 !== 0) {
      tmp += encryptedKey[i];
    }
  }
  encryptedKey = tmp;
  tmp = [];
  encryptedKey = { C: encryptedKey.substr(0, 28), D: encryptedKey.substr(28) };
  for (let i = 0; i < 16; i++) {
    tmp.push({
      [`CD`]:
        LSHIFT_28BIT(encryptedKey.C, CD[i]) +
        LSHIFT_28BIT(encryptedKey.D, CD[i]),
    });
  }
  let string = "";
  for (let i = 0; i < tmp.length; i++) {
    for (let j = 0; j < tmp[i].CD.length; j++) {
      if (tmp[i].CD[[CP[j] - 1]]) string += tmp[i].CD[[CP[j] - 1]];
    }
    tmp[i].CD = string;
    string = "";
  }
  return tmp;
}

function LSHIFT_28BIT(x, L) {
  let a = parseInt(x, 2) << L;
  return x, "0".repeat(28 - a.toString(2).length) + a.toString(2);
}

function DES(keys, strings) {
  let R = "";
  for (let i = 0; i < strings.length; i++) {
    for (let j = 0; j < P.length; j++) {
      // L += strings[i].L[P[j] - 1];
      R += strings[i].R[P[j] - 1];
    }
    // strings[i].L = L;
    strings[i].R = R;
    R = "";
  }
  let _L = "";
  let _R = "";
  let f = undefined;
  for (let i = 0; i < 16; i++) {
    _L = sep(XOR(strings[0].R, keys[i].CD), 6);
    for (let j = 0; j < _L.length; j++) {
      console.log([j]);
      let a = _L[j][0] + _L[j][5];
      let b = _L[j].substr(1, 4);
      console.log(parseInt(a, 2), parseInt(b, 2));
    }
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
function sep(xs, s) {
  return xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : [];
}
function main() {
  const string = "Hello World Hello World Hello World";
  const key = "HelloWorld";
  let cryptedArr = middleAction(string);
  cryptedArr = firstEncrypt(cryptedArr, IP);
  let keysArr = keyEncryption(key);
  DES(keysArr, cryptedArr);
}

main();

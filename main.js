const { IP, EP } = require("./DES");

function text2Code(string) {
  const arr = [];
  for (let i = 0; i < string.length; i++) {
    arr.push(string[i].charCodeAt());
  }
  return arr;
}

function code2Text(string) {
  const arr = [];
  for (let i = 0; i < string.length; i++) {
    arr.push(String.fromCharCode(string[i]));
  }
  return arr.join("");
}

function DES(key, string) {
  if (string.length > 8) {
    let subarray = [];
    for (let i = 0; i < Math.ceil(string.length / 8); i++) {
      subarray[i] = string.slice(i * 8, i * 8 + 8);
    }
    string = subarray;
    string.forEach((el) => {
      if (el.length < 8) {
        let tmp = [];
        for (let i = 0; i < 8 - el.length; i++) {
          tmp.push(0);
        }
        el.push(...tmp);
      }
    });
  } else {
    let tmp = [];
    for (let i = 0; i < 8 - string.length; i++) {
      tmp.push(0);
    }
    string.push(...tmp);
  }
  console.log(string, key);
}

const string = "Hello World Hello World";
const key = "DESkey56"; // ключ размером 8 байт = 64 бита
DES(text2Code(key).slice(0, 8), text2Code(string));

import { TSON } from ".";

const a = TSON.stringify({
  data: {
    date: 123321123123123n,
    qwq: new Set(),
    u8a: new Uint8Array([104, 101, 108, 108, 111]).buffer,
    // file: new File([new Uint8Array([104, 101, 108, 108, 111])], "hello.txt"),
  },
  url: new URL("https://example.com"),
});

console.log(a);

const b = TSON.parse(a);

console.log(b);

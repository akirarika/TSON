import { TSON } from "./index";

const a = TSON.stringify(new URL("https://example.com/"));

console.log(a);

const b = TSON.parse(a);

console.log(b);

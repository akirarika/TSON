# TSON

TSON is an extensible JSON parser that covers more data types and is a strict superset of JSON.

TSON supports ArrayBuffer and Uint8Array types, making it more convenient to transmit binary files over the network.

## Installation

```sh
# bun
bun add @southern-aurora/tson
# npm
npm install @southern-aurora/tson
```

## Usage

TSON is compatible with JSON, and in most cases, you can simply replace all JSON in your code with TSON.

```ts
import { TSON } from "@southern-aurora/tson";

TSON.stringify({ date: new Date(0), url: new URL("https://example.com") });
// Output: '{"date":"Date:1970-01-01T00:00:00.000Z","url":"URL:https://example.com/"}'
```

```ts
import { TSON } from "@southern-aurora/tson";

TSON.parse(`{"date":"Date:1970-01-01T00:00:00.000Z","url":"URL:https://example.com/"}`);
// Output: { date: 1970-01-01T00:00:00.000Z, url: URL {...} }
```

## Principle

TSON converts types that are not supported by JSON into string representations, such as `"Date:1970-01-01T00:00:00.000Z"`.

This string consists of the name and value of the object. The value is serialized as a form that can be directly placed in an object constructor for recovery.

## Default Supported Types

| Type          | JSON | TSON |
| ------------- | ---- | ---- |
| `string`      | ✅   | ✅   |
| `number`      | ✅   | ✅   |
| `boolean`     | ✅   | ✅   |
| `null`        | ✅   | ✅   |
| `Array`       | ✅   | ✅   |
| `Object`      | ✅   | ✅   |
| `bigint`      | ❌   | ✅   |
| `Date`        | ❌   | ✅   |
| `RegExp`      | ❌   | ✅   |
| `URL`         | ❌   | ✅   |
| `Uint8Array`  | ❌   | ✅   |
| `ArrayBuffer` | ❌   | ✅   |

Note: Although TSON supports Uint8Array and ArrayBuffer types for transmitting binary files over the network, it is not always a good idea as you also need to consider factors such as chunked transfer, network fluctuations, and bandwidth costs. Perhaps what you actually need is a service like [AWS S3](https://aws.amazon.com/cli/) or [TencentCloud COS](https://cloud.tencent.com/product/cos)?

## Extending with More Types

TSON only includes commonly used types by default, but you can extend it with more types. Taking the popular date library [Day.js](https://github.com/iamkun/dayjs) as an example:

```ts
import * as dayjs from "dayjs";
import { TSON } from "@southern-aurora/tson";

TSON.rules.stringify.push({
  match: (v) => v.$d instanceof Date,
  handler: (v: bigint) => `dayjs:${v.$d.toISOString()}`,
});

TSON.rules.parse.push({
  match: (v) => v.startsWith("dayjs:"),
  handler: (v: string) => dayjs(v.slice("dayjs:".length)),
});
```

We determine whether an object has the `$d` property and its value is of type `Date` to identify whether it is a Day.js date object. If it is, we serialize it into a string starting with `dayjs:`, so that it can be stored legally in JSON.

## More Built-in Types?

TSON is cautious about adding more built-in types. We only include commonly used types that may be used for network transmission in TSON. The following types, although common, will never be included, and you can implement them yourself.

### undefined

JavaScript implicitly converts non-existent values to `undefined`, so in most cases, you don't need TSON to support `undefined`. Supporting `undefined` will increase the amount of data transmitted.

### Set & Map

In most cases, `Set` and `Map` can be replaced with arrays or objects, and they can easily be converted to arrays or objects.

### Function

Serializing functions involves many issues, such as variables in the context and potential security risks. Therefore, TSON will never include built-in support for functions.

## See also

Other libraries that aim to solve a similar problem:

- [SuperJson](https://github.com/blitz-js/superjson) by Blitz.js
- [Serialize JavaScript](https://github.com/yahoo/serialize-javascript) by Eric Ferraiuolo
- [devalue](https://github.com/Rich-Harris/devalue) by Rich Harris
- [next-json](https://github.com/iccicci/next-json) by Daniele Ricci

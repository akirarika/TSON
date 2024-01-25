# TSON

TSON is an extensible JSON parser that covers more data types and is a strict superset of JSON.

TSON was initially part of Loongbao and was later separated as a standalone npm package to make it available for frontend and other projects.

## What is the purpose of TSON?

Serialization and deserialization are inevitable steps in data transmission. JSON is the most common data serialization protocol on the Internet, but it lacks some of the newer types needed today, such as `bigint` and `Date`. On the other hand, Protocol seems like a better choice, but it is too heavy and not specifically designed for the JavaScript ecosystem. TSON fills this gap as an extensible JSON parser that provides more data types, making data transmission more convenient and flexible. This allows us to handle richer data structures in the JavaScript environment, not just limited to the basic data types defined by JSON.

## Installation

TSON is built into Loongbao, and all your parameters are essentially processed through TSON when receiving and parsing, and the results are sent back to the frontend.

For frontend developers, you can choose to treat the responses from Loongbao as regular JSON and handle them in the usual way. Alternatively, you can install TSON and utilize its features to automatically restore some useful types to their original objects for easier manipulation of the data. This allows you to handle responses that contain more complex data types more easily without manual conversion and processing.

```sh
# bun
bun add @southern-aurora/tson

# npm
npm install @southern-aurora/tson
```

## Usage

TSON is compatible with JSON, and in most cases, you can simply replace all instances of JSON in your code with TSON.

Serialization:

```ts
import { TSON } from "@southern-aurora/tson";

TSON.stringify({ hello: "world", date: new Date(0), url: new URL("https://example.com") });
// Output: '{"hello":"world","date":"t!Date:1970-01-01T00:00:00.000Z","url":"t!URL:https://example.com/"}'
```

Deserialization:

```ts
import { TSON } from "@southern-aurora/tson";

TSON.parse(`{"hello":"world","date":"t!Date:1970-01-01T00:00:00.000Z","url":"t!URL:https://example.com/"}`);
// Output: { hello: "world", date: 1970-01-01T00:00:00.000Z, url: URL {...} }
```

## Principles

TSON converts types that are not supported by JSON into string representations, for example: `"t!Date:1970-01-01T00:00:00.000Z"`.

The string consists of the TSON prefix `t!`, the name of the original object, and the content of the original object. The content of the original object will be serialized as much as possible in a form that can be directly placed in an object constructor for recovery. You can determine whether a string starts with `t!` to determine if it has a TSON prefix.

## Default Supported Types

| Types         | JSON | TSON |
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

Note: Although TSON supports Uint8Array and ArrayBuffer types for transmitting binary files over the network, it is not always a good idea because you also need to consider factors such as chunked transfer, network fluctuations, and bandwidth costs. Perhaps what you actually need is a service like [AWS S3](https://aws.amazon.com/cli/) or [TencentCloud COS](https://cloud.tencent.com/product/cos) ?

## Extend More Types

TSON only includes the commonly used types, you can extend more types. For example, [Day.js](https://github.com/iamkun/dayjs) is used as an example.

```ts
import * as dayjs from "dayjs";
import { TSON } from "@southern-aurora/tson";

TSON.rules.stringify.push({
  match: (v) => v.$d instanceof Date,
  handler: (v: bigint) => `t!dayjs:${v.$d.toISOString()}`,
});

TSON.rules.parse.push({
  match: (v) => v.startsWith("t!dayjs:"),
  handler: (v: string) => dayjs(v.slice("t!dayjs:".length)),
});
```

We can determine if an object is a Day.js date object by checking if it has a `$d` property with a value of type `Date`. If it is, we serialize it as a string starting with `dayjs:` to store it legally in JSON. Please note that the code for adding TSON rules needs to be placed before the code that uses TSON.

## More Built-in Types

TSON is very cautious about adding more built-in types, and we will only include commonly used types for network transmission in TSON. The following types, although common, will never be natively supported.

### undefined

JavaScript will implicitly convert non-existent values to `undefined`, so in most cases, you don't need TSON to support `undefined` in order to access the value that is `undefined`. Supporting `undefined` will increase the amount of data transferred.

### Set & Map

In most cases, `Set` and `Map` can be replaced with Array & Object, and they can be easily converted back and forth with arrays & objects. Moreover, the semantics of Set & Map are independent of JSON. Some teams may prefer to use Set & Map as alternatives to Array & Object in order to achieve slight performance advantages in certain scenarios. However, doing so not only increases the mental burden on developers, but also results in lower performance when serializing them in TSON, as they will be serialized twice. Therefore, TSON does not have built-in support for Set & Map.

### Function

The serialization function involves many issues, such as variables in the context and potential security risks. Therefore, TSON will never natively support functions. If you want to share certain functions with the frontend, consider whether extracting them into an npm package is a better solution.

## See also

Other libraries that aim to solve a similar problem:

- [superjson](https://github.com/blitz-js/superjson) by Blitz.js
- [Serialize JavaScript](https://github.com/yahoo/serialize-javascript) by Eric Ferraiuolo
- [devalue](https://github.com/Rich-Harris/devalue) by Rich Harris
- [next-json](https://github.com/iccicci/next-json) by Daniele Ricci

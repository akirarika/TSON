export type TSONRules = {
  stringify: Array<{ match: (v: any) => boolean; handler: (v: any) => string }>;
  parse: Array<{ match: (v: any) => boolean; handler: (v: string) => any }>;
};

export const TSON = {
  rules: {
    stringify: [
      {
        match: (v) => typeof v === "bigint",
        handler: (v: bigint) => `bigint:${v.toString()}`,
      },
      {
        match: (v) => v instanceof Date,
        handler: (v: Date) => `Date:${v.toISOString()}`,
      },
      {
        match: (v) => v instanceof URL,
        handler: (v: URL) => `URL:${v.toString()}`,
      },
      {
        match: (v) => v instanceof RegExp,
        handler: (v: RegExp) => `RegExp:${v.toString()}`,
      },
      {
        match: (v) => v instanceof Uint8Array,
        handler: (v: Uint8Array) => `Uint8Array:${new TextDecoder().decode(v)}`,
      },
      {
        match: (v) => v instanceof ArrayBuffer,
        handler: (v: Uint8Array) => `ArrayBuffer:${new TextDecoder().decode(v)}`,
      },
    ],
    parse: [
      {
        match: (v) => v.startsWith("bigint:"),
        handler: (v: string) => BigInt(v.slice("bigint:".length)),
      },
      {
        match: (v) => v.startsWith("Date:"),
        handler: (v: string) => new Date(v.slice("Date:".length)),
      },
      {
        match: (v) => v.startsWith("URL:"),
        handler: (v: string) => new URL(v.slice("URL:".length)),
      },
      {
        match: (v) => v.startsWith("RegExp:"),
        handler: (v: string) => new RegExp(v.slice("RegExp:".length)),
      },
      {
        match: (v) => v.startsWith("Uint8Array:"),
        handler: (v: string) => new TextEncoder().encode(v.slice("Uint8Array:".length)),
      },
      {
        match: (v) => v.startsWith("ArrayBuffer:"),
        handler: (v: string) => new TextEncoder().encode(v.slice("ArrayBuffer:".length)).buffer,
      },
    ],
  } satisfies TSONRules,
  stringify(value: unknown): string {
    function clone(item: any): any {
      if (!item) {
        return item;
      }
      let types = [Number, String, Boolean];
      let result: any;
      for (const type of types) {
        if (item instanceof type) {
          result = type(item);
        }
      }
      if (result === undefined) {
        if (Array.isArray(item)) {
          result = [];
          for (let index = 0; index < item.length; index++) {
            result[index] = clone(item[index]);
          }
        }
        let matched = false;
        for (const iterator of TSON.rules.stringify) {
          if (iterator.match(item)) {
            result = iterator.handler(item);
            matched = true;
            break;
          }
        }
        if (matched === false) {
          result = {};
          for (let index in item) {
            result[index] = clone(item[index]);
          }
        }
      }

      return result;
    }
    return JSON.stringify(clone(value));
  },
  parse<T extends any>(text: string): T {
    const result = JSON.parse(text);
    if (result === null || typeof result !== "object") return result;
    function traverse(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(traverse);
      } else if (typeof obj === "object" && obj !== null) {
        const result: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = traverse(obj[key]);
          }
        }
        return result;
      } else if (typeof obj === "string") {
        for (const i of TSON.rules.parse) {
          if (i.match(obj) === true) {
            return i.handler(obj);
          }
        }

        return obj;
      } else {
        return obj;
      }
    }
    return traverse(result);
  },
};

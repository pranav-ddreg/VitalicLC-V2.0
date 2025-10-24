// Convert to camelCase: "hello world" -> "helloWorld"
export const camelCase = (str: string): string =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/\s+/g, '')

// Convert to PascalCase: "hello world" -> "HelloWorld"
export const pascalCase = (str: string): string =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
    .join('') || ''

// Convert to snake_case: "hello world" -> "hello_world"
export const snakeCase = (str: string): string =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((s) => s.toLowerCase())
    .join('_') || ''

// Convert to kebab-case: "hello world" -> "hello-world"
export const kebabCase = (str: string): string =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-') || ''

// Convert to Title Case: "hello-world" -> "Hello World"
export const titleCase = (str: string): string =>
  str.replace(/^-*(.)|-+(.)/g, (match, c, d) => (c ? c.toUpperCase() : ' ' + d.toUpperCase()))

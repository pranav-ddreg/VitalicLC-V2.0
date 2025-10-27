// Text casing utility functions

export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str: string): string => {
  if (!str) return ''
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

export const toTitleCase = (str: string): string => {
  return capitalizeWords(str)
}

export const toCamelCase = (str: string): string => {
  if (!str) return ''
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

export const toPascalCase = (str: string): string => {
  if (!str) return ''
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '')
}

export const toSnakeCase = (str: string): string => {
  if (!str) return ''
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_')
}

export const toKebabCase = (str: string): string => {
  if (!str) return ''
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('-')
}

export const toUpperCase = (str: string): string => {
  return str ? str.toUpperCase() : ''
}

export const toLowerCase = (str: string): string => {
  return str ? str.toLowerCase() : ''
}

export default {
  capitalize,
  capitalizeWords,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toUpperCase,
  toLowerCase,
}

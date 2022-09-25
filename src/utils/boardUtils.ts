export enum Alignment {
  left = 'left',
  centered = 'centered',
  right = 'right',
}

/**
 * function that takes a set length and inserts a string into said length
 * can position the string at start, middle or end
 * @param space
 * @param alignment
 * @param content
 * @returns {string}
 */
export const createCell = (
  space: number,
  alignment: Alignment = Alignment.centered,
  content: string = '',
  shift: number = 0
): string => {
  let indexToPrintContent
  // create intial space
  const whitespace = createWhitespace(space)

  switch (alignment) {
    case Alignment.left:
      indexToPrintContent = 0
      break
    case Alignment.right:
      indexToPrintContent = space - content.length
      break
    case Alignment.centered:
      const median = Math.floor(space / 2)
      indexToPrintContent = median - Math.floor(content.length / 2)
      break
    default:
      indexToPrintContent = 0
  }

  return replaceAt(indexToPrintContent + shift, content, whitespace)
}

/**
 * Replaces a whitespace string with a string at a given index
 * @param index
 * @param replacement
 * @param string
 * @returns {string}
 */
export const replaceAt = (
  index: number,
  replacement: string = '',
  string: string
): string => {
  return (
    string.substring(0, index) +
    replacement +
    string.substring(index + replacement.length)
  )
}

/**
 * Creates whitespace string of a given length with optional delimiter
 * @param spaces
 * @param delimiter
 * @returns
 */
export const createWhitespace = (
  spaces: number
  // delimiter?: string
): string => {
  let whitespace = ''
  const delimiter = ' '
  for (let i = 1; i <= spaces; i++) {
    whitespace += delimiter
  }
  return whitespace
}

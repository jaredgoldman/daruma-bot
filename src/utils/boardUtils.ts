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
      const offSet = Math.floor(content.length / 2)
      indexToPrintContent = median - offSet - shift
      break
    default:
      indexToPrintContent = 0
  }

  return replaceAt(indexToPrintContent, content, whitespace)
}

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

export const createWhitespace = (spaces: number): string => {
  let whitespace = ''
  for (let i = 1; i <= spaces; i++) {
    whitespace += ' '
  }
  return whitespace
}

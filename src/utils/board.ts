// function that takes a set length and inserts a string into said length
// can position the string at start, middle or end

export enum Alignment {
  left = 'left',
  centered = 'centered',
  right = 'right',
}

export const createCell = (
  space: number,
  alignment: Alignment = Alignment.centered,
  content: string = ''
) => {
  let indexToPrintContent
  const whitespace = createWhitespace(space)

  switch (alignment) {
    case Alignment.left:
      indexToPrintContent = 0
      break
    case Alignment.right:
      indexToPrintContent = space - 1
      break
    case Alignment.centered:
      indexToPrintContent = Math.floor(space / 2)
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
) => {
  return (
    string.substring(0, index) +
    replacement +
    string.substring(index + replacement.length)
  )
}

export const createWhitespace = (spaces: number) => {
  let whitespace = ''
  for (let i = 1; i <= spaces; i++) {
    whitespace += ' '
  }
  return whitespace
}

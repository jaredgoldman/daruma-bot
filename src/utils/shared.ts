export const asyncForEach = async (array: Array<any>, callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const wait = async (duration: number) => {
  await new Promise((res) => {
    setTimeout(res, duration)
  })
}

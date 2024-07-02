import { jisDai2Dictionary } from './jisDai2'

export type Dictionary = { src: string; dst: string }

export const dictionary = [
  jisDai2Dictionary,
  // Add more dictionary here
  // exmapleDictionary,
].flat()

import { normalize } from './main-node'

async function main(args: string[]) {
  let options = {}
  if (args.length > 1) {
    options = JSON.parse(args[1])
  }
  const result = await normalize(args[0], options)
  console.log(JSON.stringify(result, null, 2))
}

main(process.argv.slice(2))
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

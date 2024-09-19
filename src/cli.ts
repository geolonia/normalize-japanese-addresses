import { normalize } from './main-node'

async function main(args: string[]) {
  const result = await normalize(args[0])
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

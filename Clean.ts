import * as util from "util"
import * as fs from "fs"
import * as path from "path"

const fsReaddir = util.promisify(fs.readdir)
const fsUnlink = util.promisify(fs.unlink)
const fsStat = util.promisify(fs.stat)

Recurse(`.`)

async function Recurse(searchPath: string): Promise<void> {
  const files = await fsReaddir(searchPath)
  for (const file of files) {
    if (searchPath == `.` && [`node_modules`].indexOf(file) != -1) {
      console.log(`Ignoring directory "${file}".`)
      continue
    }
    const concatenated = path.join(searchPath, file)
    const stats = await fsStat(concatenated)
    if (stats.isFile()) {
      if (file.length >= 3 && file.slice(file.length - 3) == `.js`) {
        console.info(`Deleting JS file "${concatenated}"...`)
        await fsUnlink(concatenated)
      } else if (file.length >= 4 && file.slice(file.length - 4) == `.map`) {
        console.info(`Deleting map file "${concatenated}"...`)
        await fsUnlink(concatenated)
      } else if (file.length >= 5 && file.slice(file.length - 5) == `.d.ts`) {
        if (file.slice(0, 1) == `I`) {
          console.log(`Ignoring type definition file "${concatenated}".`)
        } else {
          console.info(`Delting type definition file "${concatenated}"...`)
          await fsUnlink(concatenated)
        }
      }
    } else if (stats.isDirectory()) {
      Recurse(concatenated)
    } else {
      console.warn(
        `Ignoring "${searchPath}" as it is neither a file nor a directory.`
      )
    }
  }
}

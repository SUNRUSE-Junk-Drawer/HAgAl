import * as util from "util"
import * as crypto from "crypto"

const randomBytes = util.promisify(crypto.randomBytes)

/**
 * Generates a new session ID.
 * @returns The generated session ID.
 */
export default async function GenerateSessionId(): Promise<string> {
  const bytes = await randomBytes(30)
  return bytes.toString(`base64`)
}

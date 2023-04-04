import type * as vscode from 'vscode'

const accessTokenKey = 'token-test'
const refreshTokenKey = 'refresh-token-test'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Util {
  static globalState: vscode.ExtensionContext['globalState']

  static getRefreshToken () {
    return this.globalState.get<string>(refreshTokenKey) ?? ''
  }

  static getAccessToken () {
    return this.globalState.get<string>(accessTokenKey) ?? ''
  }

  static isLoggedIn () {
    return (
      !!this.globalState.get(accessTokenKey) &&
      !!this.globalState.get(refreshTokenKey)
    )
  }
}

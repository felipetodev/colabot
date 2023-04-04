import { authentication, window, type ExtensionContext } from 'vscode'
import * as Octokit from '@octokit/rest'
import { Util } from './Util'

const accessTokenKey = 'token-test'
const GITHUB_AUTH_PROVIDER_ID = 'github'
const SCOPES = ['user:email']

export class Credentials {
  private octokit: Octokit.Octokit | undefined

  async initialize (context: ExtensionContext): Promise<void> {
    this.registerListeners(context)
    this.setOctokit()
  }

  private async setOctokit () {
    const session = await authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: false })
    if (session) {
      Util.globalState.update(accessTokenKey, session.accessToken)
      this.octokit = new Octokit.Octokit({
        auth: session.accessToken
      })

      return
    }

    const result = await window.showInformationMessage(
      'You are not signed in to GitHub. Do you want to sign in now?',
      { title: 'Sign in to GitHub' }
    )

    if (result && result.title === 'Sign in to GitHub') {
      const session = await authentication.getSession(
        GITHUB_AUTH_PROVIDER_ID,
        SCOPES,
        { createIfNone: true }
      )

      if (session) {
        Util.globalState.update(accessTokenKey, session.accessToken)
        this.octokit = new Octokit.Octokit({ auth: session.accessToken })

        return
      } else {
        Util.globalState.update(accessTokenKey, '')
        window.showWarningMessage('Failed to sign in to GitHub.')
      }
    }

    Util.globalState.update(accessTokenKey, '')
    this.octokit = undefined
  }

  registerListeners (context: ExtensionContext): void {
    context.subscriptions.push(authentication.onDidChangeSessions(async e => {
      if (e.provider.id === GITHUB_AUTH_PROVIDER_ID) {
        await this.setOctokit()
      }
    }))
  }

  async getOctokit (): Promise<Octokit.Octokit> {
    if (this.octokit) {
      return this.octokit
    }

    const session = await authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: true })
    this.octokit = new Octokit.Octokit({
      auth: session.accessToken
    })

    return this.octokit
  }
}

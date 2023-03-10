import type { ExtensionContext, SecretStorage } from 'vscode'

export default class ApiKeySettings {
  private static _instance: ApiKeySettings

  constructor (private readonly secretStorage: SecretStorage) {}

  static init (context: ExtensionContext): void {
    // Create instance of new ApiKeySettings.
    ApiKeySettings._instance = new ApiKeySettings(context.secrets)
  }

  static get instance (): ApiKeySettings {
    // Getter of our ApiKeySettings existing instance.
    return ApiKeySettings._instance
  }

  async storeKeyData (token?: string): Promise<void> {
    // Update values in secret storage.
    if (token) {
      this.secretStorage.store('colabot_key', token)
    }
  }

  async getKeyData (): Promise<string | undefined> {
    // Retrieve data from secret storage.
    return await this.secretStorage.get('colabot_key')
  }

  async deleteKeyData (): Promise<void> {
    // Delete data from secret storage.
    await this.secretStorage.delete('colabot_key')
  }
}

import Store from 'electron-store'

export type Schema = {
  openaiApiKey: string
  startOnLogin: boolean
}

const config = new Store<Schema>({
  name: 'configuration',
  defaults: {
    openaiApiKey: '',
    startOnLogin: false,
  },
})

export default config

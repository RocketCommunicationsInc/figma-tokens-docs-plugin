# Figma Token Documentation Generator

Reads your Figma Tokens plugin data and generates a sticker sheet of all the tokens.
This plugin makes use of the Documentation Tokens feature of Figma Tokens. When you update a token value, you can 
run update and the values will be applied on the generated page.

## Usage

1. In the Figma Tokens plugin, go to Settings -> Token Storage and click "Local document". The plugin needs your token data to be saved locally to work. 
2. Open the plugin and click Create. This will create a list of Sections that look exactly like the Template until you:
3. Open the Figma Tokens plugin and click Update. This will apply all of the token values.

## Development

`npm run dev` 

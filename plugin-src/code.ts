import { checkIfContainsAlias } from "./checkIfContainsAlias";
import { TokenSectionInput } from "./types";

figma.showUI(__html__, { height: 900, width: 500 });
async function loadFonts() {
  await figma.loadFontAsync({ family: "Roboto", style: "Bold" })
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  await figma.loadFontAsync({ family: "Roboto", style: "Light" })
}

enum layerNames {
  'localComponents' = 'Local Components',
  'pageDesignTokens' = 'Design Tokens',
  'templateDesignToken' = '_Design Token Template',
  'tokenName' = '__tokenName',
  'tokenPreview' = '__tokenPreview',
  'tokenValue' = '__tokenValue',
  'tokenAlias' = '__tokenAlias',
  'tokenDescription' = '__tokenDescription',
  "headerTitle" = "token.title.section",
  "sectionHeader" = "_Section Header"
}


export type Token = {
  name: string
  value: string
  type: string
  description: string
}

class TokenSection {
  name = ''
  tokens: Token[] = []
  header?: InstanceNode
  frame?: any

  constructor(name: string, tokens: Token[]) {
    this.name = name
    this.tokens = tokens
  }

  createHeader() {
    const tokenPage = figma.root.children.find(node => node.name === layerNames.pageDesignTokens)
    if (!tokenPage) {
      throw new Error('Can not find Design Tokens page')
    }
    const localComponentsLayer = tokenPage?.children.find(node => node.name === layerNames.localComponents) as FrameNode
    const tokenTemplate = localComponentsLayer?.children.find(node => node.name === layerNames.sectionHeader) as ComponentNode
    if (!tokenTemplate) {
      throw new Error('Can not find Design Token Template')
    }

    // If template is a Component
    const header = tokenTemplate.createInstance() as InstanceNode
    const headerTitle = header?.findOne(node => node.name === layerNames.headerTitle) as TextNode
    if (headerTitle) {
      header.name = this.name
      headerTitle.characters = this.name
      this.header = header
    } else {
      console.warn('Unable to find Header Title')
    }
  }

  fillTokens() {
    if (this.header) {
      const frame = figma.createFrame()
      frame.name = this.name
      frame.appendChild(this.header)
      frame.layoutMode = 'VERTICAL'

      // Horizontal resizing = "Hug Contents"
      frame.layoutAlign = "INHERIT"
      frame.counterAxisSizingMode = "AUTO"
      this.tokens.map((token: Token) => {
        const section = new TokenItem(token)
        section.create()
        if (section.node) {
          frame.appendChild(section.node)
        }
      })
      this.frame = frame
    }
  }

  create() {
    this.createHeader()
    this.fillTokens()
  }
}


class TokenItem {
  name = ''
  token: Token
  _node?: InstanceNode

  constructor(token: Token) {
    this.name = token.name
    this.token = token
  }

  get node() {
    return this._node
  }

  fetchTemplate() {
    const tokenPage = figma.root.children.find(node => node.name === layerNames.pageDesignTokens)
    if (!tokenPage) {
      throw new Error('Can not find Design Tokens page')
    }

    const localComponentsLayer = tokenPage?.children.find(node => node.name === layerNames.localComponents) as FrameNode
    const tokenTemplate = localComponentsLayer?.children.find(node => node.name === layerNames.templateDesignToken) as ComponentNode
    if (!tokenTemplate) {
      throw new Error('Can not find Design Token Template')
    }
    // If template is a Component
    this._node = tokenTemplate.createInstance()
    this._node.name = this.name
  }

  fillName() {
    const node = this._node?.findOne(node => node.name === layerNames.tokenName) as TextNode
    if (node) {
      node.setSharedPluginData('tokens', 'tokenName', `"${this.token.name}"`)
    } else {
      console.warn('Unable to find Token Name node')
    }
  }

  fillValue() {
    const node = this._node?.findOne(node => node.name === layerNames.tokenValue) as TextNode
    if (node) {
      node.setSharedPluginData('tokens', 'value', `"${this.token.name}"`)
    } else {
      console.warn('Unable to find Token Value node')
    }
  }

  fillPreview() {
    const node = this._node?.findOne(node => node.name === layerNames.tokenPreview) as TextNode
    if (node) {
      node.setSharedPluginData('tokens', 'fill', `"${this.token.name}"`)
    } else {
      console.warn('Unable to find Token Preview node')
    }
  }

  fillAlias() {
    const node = this._node?.findOne(node => node.name === layerNames.tokenAlias) as TextNode
    if (node) {
      if (checkIfContainsAlias(this.token.value)) {
        node.setSharedPluginData('tokens', 'tokenValue', `"${this.token.name}"`)
      } else {
        node.visible = false
      }
    } else {
      console.warn('Unable to find Token Alias node')
    }

  }

  fillDescription() {
    const node = this._node?.findOne(node => node.name === layerNames.tokenDescription) as TextNode
    if (node) {
      if (this.token.description) {
        node.setSharedPluginData('tokens', 'description', `"${this.token.name}"`)
      } else {
        node.visible = false
      }
    } else {
      console.warn('Unable to find Token Description node')
    }
  }

  create() {
    this.fetchTemplate()
    this.fillName()
    this.fillValue()
    this.fillPreview()
    this.fillAlias()
    this.fillDescription()
  }


}

// class TextTokenItem extends TokenItem {
//   name = ''
//   token: Token
//   _node?: InstanceNode

//   constructor(token: Token) {
//     super(token)
//     this.name = token.name
//     this.token = token
//   }

//   fetchTemplate() {
//     const tokenPage = figma.root.children.find(node => node.name === 'Design Tokens')
//     if (!tokenPage) {
//       throw new Error('Can not find Design Tokens page')
//     }
//     const tokenTemplate = tokenPage?.children.find(node => node.name === "Font Template") as ComponentNode
//     if (!tokenTemplate) {
//       throw new Error('Can not find Design Token Template')
//     }
//     // If template is a Component
//     this._node = tokenTemplate.createInstance()
//     this._node.name = this.name
//   }

// }


figma.ui.onmessage = async (msg) => {
  await loadFonts()
  if (msg.type === "create-docs") {
    const pluginData = JSON.parse(figma.root.getSharedPluginData("tokens", "values")).beta

    const frame = figma.createFrame()
    frame.name = "Color Design Tokens"

    // Horizontal resizing = "Hug Contents"
    frame.layoutAlign = "INHERIT"
    frame.counterAxisSizingMode = "AUTO"
    frame.layoutMode = 'HORIZONTAL'
    frame.itemSpacing = 24

    msg.sections.map((section: TokenSectionInput)  => {
      const tokens = pluginData.filter((token: Token) => token.name.startsWith(section.tokenPrefix))
      if (tokens.length > 0) {
        const tokenSection = new TokenSection(section.name, tokens)
        tokenSection.create()
        frame.appendChild(tokenSection.frame)
      }
    })

    // const palettes = pluginData.beta.filter((token: Token) => token.name.includes('color.palette'))
    // const section = new TokenSection('Color Palettes', palettes)
    // section.create()

    // const status = pluginData.filter((token: Token) => token.name.includes('color.status'))
    // const statusSection = new TokenSection('Status Colors', status)
    // statusSection.create()

  }

};

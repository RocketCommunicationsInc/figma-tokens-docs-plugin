import { checkIfContainsAlias } from "./checkIfContainsAlias";
import { hexToFigmaRGB } from "./convertColors";

figma.showUI(__html__, { themeColors: true, height: 300, width: 500 });
async function loadFonts() {
  await figma.loadFontAsync({ family: "Roboto", style: "Bold" })
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  await figma.loadFontAsync({ family: "Roboto", style: "Light" })
}

enum layerNames {
  'pageDesignTokens' = 'Design Tokens',
  'templateDesignToken' = 'Design Token Template',
  'tokenName' = '__tokenName',
  'tokenPreview' = '__tokenPreview',
  'tokenValue' = '__tokenValue',
  'tokenAlias' = '__tokenAlias',
  'tokenDescription' = '__tokenDescription',
  "headerTitle" = "token.title.section",
  "sectionHeader" = "Section Header"
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
    const tokenTemplate = tokenPage?.children.find(node => node.name === layerNames.sectionHeader) as ComponentNode
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
    const tokenTemplate = tokenPage?.children.find(node => node.name === layerNames.templateDesignToken) as ComponentNode
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
  if (msg.type === "create-rectangles") {
    const pluginData = JSON.parse(figma.root.getSharedPluginData("tokens", "values")).beta

    const sections = {
      'color.background': 'Background Colors',
      'color.text': 'Text Colors',
      'color.border': 'Border Colors',
      'color.palette': 'Palette Colors',
      'color.status': 'Status Colors',
      'color.classification': 'Classification Colors',
      // 'link': 'Link',
      'popup-menu': 'Popup Menu',
      'card': 'Card',
      'container': 'Container',
      'classification-banner': 'Classification Banner',
      // 'dialog': 'Dialog',
      'status-symbol': 'Status Symbol',
      'gsb': 'Global Status Bar',
      // 'slider': 'Slider',
      // 'checkbox': 'Checkbox',
      // 'radio': 'Radio',
      // 'switch': 'Switch',
      // 'scrollbar': 'Scrollbar',
      // 'progress': 'Progress',
      // 'tag': 'Tag',
      // 'indeterminate-progress': 'Indeterminate Progress',
      'notification-banner': 'Notification Banner',
      // 'menu': 'Menu'
    }

    const frame = figma.createFrame()

    // Horizontal resizing = "Hug Contents"
    frame.layoutAlign = "INHERIT"
    frame.counterAxisSizingMode = "AUTO"
    frame.layoutMode = 'HORIZONTAL'

    let section: keyof typeof sections
    for (section in sections) {
      const tokens = pluginData.filter((token: Token) => token.name.startsWith(section))
      const sectionName = sections[section]
      const tokenSection = new TokenSection(sectionName, tokens)
      tokenSection.create()

      frame.appendChild(tokenSection.frame)
    }



    // const palettes = pluginData.beta.filter((token: Token) => token.name.includes('color.palette'))
    // const section = new TokenSection('Color Palettes', palettes)
    // section.create()

    // const status = pluginData.filter((token: Token) => token.name.includes('color.status'))
    // const statusSection = new TokenSection('Status Colors', status)
    // statusSection.create()

  }

};

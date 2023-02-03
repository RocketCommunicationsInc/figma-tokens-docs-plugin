import React, { useRef, useState } from "react";
import logoPng from "./logo.png";
import logoSvg from "./logo.svg?raw";
import Logo from "./Logo";
import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import "./App.css";
import { TokenSectionInput } from '../plugin-src/types'



function App(props) {
  const inputRef = useRef<HTMLInputElement>(null);


  const [sections, setSections] = useState([
    {
      name: 'Background Colors',
      tokenPrefix: 'color.background',
    },
    {
      name: 'Text Colors',
      tokenPrefix: 'color.text',
    },
    {
      name: 'Border Colors',
      tokenPrefix: 'color.border',
    },
    {
      name: 'Neutral Colors',
      tokenPrefix: 'color.palette.neutral',
    },
    {
      name: 'Dark Blue Colors',
      tokenPrefix: 'color.palette.darkblue',
    },
    {
      name: 'Bright Blue Colors',
      tokenPrefix: 'color.palette.brightblue',
    },
    {
      name: 'Grey Colors',
      tokenPrefix: 'color.palette.grey',
    },
    {
      name: 'Red Colors',
      tokenPrefix: 'color.palette.red',
    },
    {
      name: 'Orange Colors',
      tokenPrefix: 'color.palette.orange',
    },
    {
      name: 'Yellow Colors',
      tokenPrefix: 'color.palette.yellow',
    },
    {
      name: 'Green Colors',
      tokenPrefix: 'color.palette.green',
    },
    {
      name: 'Cyan Colors',
      tokenPrefix: 'color.palette.cyan',
    },
    {
      name: 'Violet Colors',
      tokenPrefix: 'color.palette.violet',
    },
    {
      name: 'Blue Colors',
      tokenPrefix: 'color.palette.blue',
    },
    {
      name: 'Teal Colors',
      tokenPrefix: 'color.palette.teal',
    },
    {
      name: 'Purple Colors',
      tokenPrefix: 'color.palette.purple',
    },
    {
      name: 'Pink Colors', 
      tokenPrefix: 'color.palette.pink',
    },
    {
      name: 'Hot Orange Colors',
      tokenPrefix: 'color.palette.hotorange',
    },
    {
      name: 'Status Colors',
      tokenPrefix: 'color.status',
    },
    {
      name: 'Classification Colors',
      tokenPrefix: 'color.classification'
    },
    {
      name: 'Card',
      tokenPrefix: 'card.color'
    },
    {
      name: 'Container',
      tokenPrefix: 'container.color'
    },
    {
      name: 'Classification Banner',
      tokenPrefix: 'classification-banner.color'
    },
    {
      name: 'Global Status Bar',
      tokenPrefix: 'gsb.color'
    },
    {
      name: 'Logs',
      tokenPrefix: 'log.color'
    },
    {
      name: 'Monitoring Icon',
      tokenPrefix: 'monitoring-icon.badge.color'
    },
    {
      name: 'Notification Banner',
      tokenPrefix: 'notification-banner.color'
    },
    {
      name: 'Popup Menu',
      tokenPrefix: 'popup-menu.color'
    },
    {
      name: 'Status Symbol',
      tokenPrefix: 'status-symbol.color'
    },
  ])

  const onCreate = () => {
    parent.postMessage(
      { pluginMessage: { type: "create-docs", sections } },
      "*"
    );
  };


  const deleteSection = (section: TokenSectionInput) => {
    const name = section.name
    const filtered = sections.filter(section => section.name !== name);
    setSections(filtered)
  }

  const deleteAll = () => {
    setSections([])
  }

  const sectionList = sections.map((section, index) => {
    return (
      <li className="section" key={index}>
        <div className="section__name-container">

          <div className="sectionName">
            {section.name}
          </div>
          <div className="tokenPrefix">
            {section.tokenPrefix}.*
          </div>
        </div>
        <div className="section__actions">
          <button className="button button--tertiary-destructive" onClick={() => deleteSection(section)}>Delete</button>
        </div>
      </li>
    )
  })

  const [name, setName] = useState('');
  const [tokenPrefix, setTokenPrefix] = useState('');

  const resetInput = () => {
    setName('')
    setTokenPrefix('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSections([...sections, { name, tokenPrefix: tokenPrefix }])
    resetInput()
  }

  return (
    <div className="container">
      <header>
        <h2>Figma Token Documentation Generator</h2>
        <div className="onboarding-tip">
          <div className="icon icon--styles"></div>
          <div className="onboarding-tip__msg">
            <ol className="directions">
              <li>Open the Figma Tokens plugin and set your token storage to Local Document.</li>
              <li>Run this plugin.</li>
              <li>Open the Figma Tokens plugin and run Apply to populate the values.</li>
            </ol>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="new-section-input">
            <div className="input">
              <label className="label" htmlFor="token-prefix">Token Prefix</label>
              <input
                type="text"
                id="token-prefix"
                className="input__field"
                name="token-prefix"
                autoComplete="off"
                placeholder="color.palette"
                value={tokenPrefix}
                onChange={(e) => setTokenPrefix(e.target.value)}
              />
            </div>
            <div className="input">
              <label className="label" htmlFor="section-name">Section Name</label>
              <input
                type="text"
                id="section-name"
                placeholder="Palette Colors"
                className="input__field"
                name="text"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button type="submit" className="button button--secondary">
              Add
            </button>
          </div>
        </form>

        <button className="button button--tertiary-destructive button--deleteAll" onClick={deleteAll}>Delete All</button>
      </header>

      <main>
        <ul
          role="list"
          className="section-list"
          aria-labelledby="list-heading"
        >
          {sectionList}
        </ul>
      </main>

      <footer>
        <button className="button button--primary" onClick={onCreate}>
          Create
        </button>
      </footer>
    </div>
  );
}

export default App;

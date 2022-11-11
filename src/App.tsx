/*global chrome*/
import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function App() {
  const [config, setConfig] = useState({
    dialect: "",
    showWeakForms: false,
  });
  const [userCommands, setUserCommands] = useState<CommandSetting[]>();
  const [isShortcutsEditUrlCopied, setIsShortcutsEditUrlCopied] =
    useState(false);

  const toggleShowWeakForms = () => {
    if (config) {
      let previousConfig = JSON.parse(JSON.stringify(config));
      previousConfig.showWeakForms = !previousConfig.showWeakForms;

      setConfig(previousConfig);
      chrome.storage.local.set({ config: previousConfig });
    }
  };

  const handleDialectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (config) {
      let previousConfig = JSON.parse(JSON.stringify(config));
      previousConfig.dialect = event.target.value;

      setConfig(previousConfig);
      chrome.storage.local.set({ config: previousConfig });
    }
  };

  type CommandSetting = {
    name: string | undefined;
    description: string | undefined;
    shortcutArray: string[] | null;
  };

  useEffect(() => {
    chrome.commands.getAll((res) => {
      let resArr: CommandSetting[] = [];

      res.forEach((obj) => {
        let command: CommandSetting = {
          name: obj.name,
          description: obj.description,
          shortcutArray:
            obj.shortcut !== "" && obj.shortcut !== undefined
              ? obj.shortcut.toLowerCase().split("+", 3)
              : null,
        };
        resArr.push(command);
      });

      setUserCommands(resArr);
    });

    chrome.storage.local.get(["config"], function (result) {
      let storedConfig = {
        dialect: result?.config?.dialect ? result?.config?.dialect : "am",
        showWeakForms: result?.config?.showWeakForms === true ? true : false,
      };

      setConfig(storedConfig);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <fieldset>
          <legend>Dialect</legend>
          <p>
            <input
              type="radio"
              name="dialect"
              value="am"
              id="am"
              onChange={handleDialectChange}
              checked={config?.dialect === "am"}
            />
            <label>American</label>
          </p>

          <p>
            <input
              type="radio"
              name="dialect"
              value="br"
              id="br"
              onChange={handleDialectChange}
              checked={config?.dialect === "br"}
            />
            <label>British</label>
          </p>
        </fieldset>

        <label className="weak-forms-label">
          <input
            type="checkbox"
            checked={config.showWeakForms}
            onChange={toggleShowWeakForms}
          />
          Show weak forms
        </label>

        <div className="user-commands-rows-container">
          {userCommands?.map((commandSetting: CommandSetting) => (
            <div className="command-row-container">
              <span className="command-action-name-section">
                {commandSetting.description}
              </span>

              <span className="command-action-keys-section">
                {commandSetting?.shortcutArray != null
                  ? commandSetting.shortcutArray?.map((key: String) => {
                      return <kbd className="keyboard-key nowrap">{key}</kbd>;
                    })
                  : "userCommands.not_defined"}
              </span>
            </div>
          ))}

          <div className="settings-edit-section">
            {isShortcutsEditUrlCopied ? (
              <span style={{ color: "lightgreen" }}>
                {"paste the URL to change shortcut"}
              </span>
            ) : null}

            <CopyToClipboard
              onCopy={() => setIsShortcutsEditUrlCopied(true)}
              text={"chrome://extensions/shortcuts"}
            >
              <FontAwesomeIcon
                className="command-action-icon-settings-edit"
                icon={faCog}
              ></FontAwesomeIcon>
            </CopyToClipboard>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

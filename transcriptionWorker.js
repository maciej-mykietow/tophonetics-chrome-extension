const endpointsForActions = new Map();
endpointsForActions.set("transcript", "credentials");

// eslint-disable-next-line no-undef
chrome.commands.onCommand.addListener((command) => {
  performAssignedAction(command);
});

const replaceSelectedText = (replacementDiv) => {
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel?.rangeCount) {
      range = sel.getRangeAt(0);
      range.extractContents();
      range.insertNode(document.createTextNode(replacementDiv));
    }
  }
};

const getSelectionText = () => {
  let text;
  if (window.getSelection) {
    text = window.getSelection()?.toString();
  }
  return text ? text : "";
};

const getSelectedTextTranscription = async (selectedText, config) => {
  let transcription;

  var bodyFormData = new FormData();
  bodyFormData.append("text_to_transcribe", selectedText);
  bodyFormData.append("submit", "Show transcription");
  bodyFormData.append("output_dialect", config?.dialect);
  bodyFormData.append("weak_forms", config?.showWeakForms ? "on" : "off");

  const getUrl = "https://tophonetics.com/";
  await fetch(getUrl, {
    method: "POST",
    body: bodyFormData,
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(data, "text/html");
      transcription = htmlDoc.getElementById("transcr_output").textContent;
    })
    .catch((err) => {
      console.log(err);
    });

  return transcription;
};

const getConfig = () => {
  // eslint-disable-next-line no-undef
  return chrome.storage.local.get(["config"]);
};

const performAssignedAction = (actionType) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    // eslint-disable-next-line no-undef
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: getSelectionText,
        args: [],
      },
      (selectedText) => {
        // eslint-disable-next-line no-undef
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: getConfig,
            args: [],
          },
          (config) => {
            // eslint-disable-next-line no-undef
            chrome.scripting.executeScript(
              {
                target: { tabId: tabs[0].id },
                func: getSelectedTextTranscription,
                args: [selectedText[0].result, config[0].result.config],
              },
              (transcripted) => {
                // eslint-disable-next-line no-undef
                chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id },
                  func: replaceSelectedText,
                  args: [transcripted[0].result],
                });
              }
            );
          }
        );
      }
    );
  });
};

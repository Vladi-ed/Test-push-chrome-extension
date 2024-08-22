# Inf Chrome Extension

## Description
Instant Notifier (INF) extension for chrome-based browsers

## Visuals
https://www.figma.com/design/swAYoVzb7xX49Xc3FPpPhl/%F0%9F%80%99-INF-Chrome-Extension

## Installation
1. Open [chrome://extensions/](chrome://extensions/)
2. Enable Dev mode
3. Press **Load unpacked** button
4. Navigate inside **dist** folder
5. Press **Select** 
6. Extension should be installed now

More details:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

### Deploy the extension self-hosted
In order to deploy the extension self-hosted you need these policies:
- ExtensionInstallForcelist (to automatically install and not able to disable)
  or
- ExtensionInstallSources
- ExtensionInstallAllowlist
  to allow user to install it from a specific website.

### Example reg file
```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallAllowlist]
"1"="bedjhbdnaijpdihemaemopkddmihhfjc"

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist]
"1"="bedjhbdnaijpdihemaemopkddmihhfjc;https://vladi.pages.dev/release/manifest.xml"

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallSources]
"1"="https://vladi.pages.dev/*"
```

### Pin extension icon
https://support.google.com/chrome/a/thread/208937173?hl=en&sjid=906614424111044523-EU

https://chromeenterprise.google/policies/#ExtensionSettings


## Useful links
https://developer.chrome.com/docs/extensions/develop/concepts/permission-warnings#warnings

https://developer.chrome.com/docs/extensions/develop/concepts/activeTab

https://www.chromium.org/administrators/

https://www.reddit.com/r/chrome_extensions/comments/1cl2rrv/chrome_extension_inject_js_into_an_iframe/


## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Author
Vladi Edelshtein

## Project status
Active development phase
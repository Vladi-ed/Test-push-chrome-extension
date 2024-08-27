import {loginUser} from "../inf-api/login-user";
import {logoutUser} from "../inf-api/logout-user";
import {ExtensionStorage} from "../helpers/extension-storage.ts";

const form = document.getElementById('control-row') as HTMLFormElement;
const formData = form.querySelectorAll('input');
const message = document.getElementById('message') as HTMLDivElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const sendRequestBtn = document.getElementById('send-request') as HTMLButtonElement;
let mvHost: string;
let mvToken: string;

form.addEventListener('submit', handleLogin);
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
// sendRequestBtn?.addEventListener('click', ping);

window.addEventListener('offline', () => {
  console.log("The network connection has been lost.");
  document.getElementById('offline-badge')?.classList.remove('hidden');
  loginBtn.disabled = true;
  logoutBtn.disabled = true;
});

formData.item(0).addEventListener('focusout', checkPermissions);

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  const host = await ExtensionStorage.getLastHost();
  if (!host) return;

  const {user, passw, active} = await ExtensionStorage.getHostOptions(host);
  console.log('Host and User', host, user, active ? 'active' : '');

  formData.item(0).value = host;
  mvHost = host;
  await checkPermissions();

  if (user) formData.item(1).value = user;
  if (passw) formData.item(2).value = atob(passw);
  if (active) {
    console.debug('active login', active);
    loginBtn.disabled = true;
    logoutBtn.disabled = false;
    formData.item(2).disabled = true; // disable password field
  }
})();

async function handleLogin() {
  if (!form.checkValidity()) return;
  loginBtn.disabled = true;
  setFormMessage('Trying to login...');
  try {
    mvHost = new URL(formData.item(0).value).origin; // formData.item(0).value ? new URL(formData.item(0).value).origin : 'http://192.168.108.176';
    const user = formData.item(1).value || 'system';
    const passw = formData.item(2).value;

    await ExtensionStorage.setHostOptions(mvHost, { user, passw: btoa(passw) });
    await chrome.permissions.request({ // chrome.permissions.contains({})
      permissions: ['cookies', 'scripting'],
      origins: [mvHost + '/']
    });

    const loginResp = await loginUser(mvHost, user, passw);
    mvToken = loginResp.token;
    console.log('Login Response:', loginResp);

    formData.item(2).disabled = true; // disable password field
    logoutBtn.disabled = false;
    setFormMessage('Logged in as ' + loginResp.user.firstName + ' ' + loginResp.user.lastName);

    await chrome.runtime.sendMessage({action: 'start', mvHost, mvToken});
    await ExtensionStorage.setHostOptions(mvHost, { active: true });
  }
  catch (e) {
    loginBtn.disabled = false;
    // @ts-ignore
    setFormMessage('Error: ' + e.message);
  }
}

async function handleLogout(event: Event) {
  event.preventDefault();
  logoutBtn.disabled = true;
  try {
    await ExtensionStorage.setHostOptions(mvHost, { active: false }); // todo: consider removing the password from the storage
    await chrome.runtime.sendMessage({action: 'stop', mvHost});
    const resp = await logoutUser(mvHost);
    if (resp.resultType == 'Ok') setFormMessage('Logout Successful');
    else setFormMessage('Something went wrong...')

    formData.item(2).disabled = false; // enable password field
    loginBtn.disabled = false; // enable login button
  }
  catch (e) {
    logoutBtn.disabled = false;
    // @ts-ignore
    setFormMessage('Error: ' + e.message);
  }
}

function setFormMessage(str: string) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

async function checkPermissions() {
  try {
    const havePermissions = await chrome.permissions.contains({
      permissions: ['cookies', 'scripting'],
      origins: [new URL(formData.item(0).value).origin + '/']
    });

    if (!havePermissions) {
      loginBtn.textContent = 'Request permissions'
      setFormMessage('The INF extension needs your permission to access MobileView')
    }
    else {
      loginBtn.textContent = 'Login';
      clearMessage();
    }
  }
  catch (e) {
    console.log(e)
  }
}


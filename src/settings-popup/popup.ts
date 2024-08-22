import {loginUser} from "../inf-api/login-user";
import {getEventList} from "../inf-api/get-event-list";
import {logoutUser} from "../inf-api/logout-user";

const form = document.getElementById('control-row') as HTMLFormElement;
const formData = form.querySelectorAll('input')
const message = document.getElementById('message') as HTMLDivElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const sendRequestBtn = document.getElementById('send-request') as HTMLButtonElement;
let mvHost: string;
let mvToken: string;

form.addEventListener('submit', handleLogin);
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
sendRequestBtn?.addEventListener('click', ping);

window.addEventListener('offline', () => {
  console.log("The network connection has been lost.");
  document.getElementById('offline-badge')?.classList.remove('hidden');
  loginBtn.disabled = true;
  logoutBtn.disabled = true;
});

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {

  const { user, passw, host, active } = await chrome.storage.local.get(['user', 'passw', 'host', 'active']);
  console.log('Saved Host and User', host, user);
  mvHost = host;
  if (host) formData.item(0).value = host;
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
  loginBtn.disabled = true;
  mvHost = formData.item(0).value ? new URL(formData.item(0).value).origin : 'http://192.168.108.176';
  const user = formData.item(1).value || 'system';
  const passw = formData.item(2).value || '';

  try {
    await chrome.storage.local.set({ user, passw: btoa(passw), host: mvHost });
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
    await chrome.storage.local.set({ active: true });
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
    await chrome.storage.local.set({ active: false });
    await chrome.runtime.sendMessage({action: 'stop', mvHost});

    const resp = await logoutUser(mvHost);
    setFormMessage(JSON.stringify(resp));
    formData.item(2).disabled = false; // enable password field
    loginBtn.disabled = false; // enable login button
  }
  catch (e) {
    logoutBtn.disabled = false;
    // @ts-ignore
    setFormMessage('Error: ' + e.message);
  }
}

async function ping() {
  console.log('ping()', mvHost);
  const eventListResp = await getEventList(mvHost, mvToken);
  console.log('Event List:', eventListResp);
  setFormMessage(JSON.stringify(eventListResp));

  // const sessionCookie = await chrome
  //     .cookies?.getAll({ name: 'JSESSIONID' });
  // console.log('Extension JSESSIONID cookie', sessionCookie);

  return eventListResp;
}

function setFormMessage(str: string) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

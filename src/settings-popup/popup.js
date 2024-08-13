import {loginUser} from "../inf-api/login-user";
import {getEventList} from "../inf-api/get-event-list";
import {logoutUser} from "../inf-api/logout-user";

const form = document.getElementById('control-row');
const formData = form.querySelectorAll('input');
const message = document.getElementById('message');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const sendRequestBtn = document.getElementById('send-request');
let mvHost;
let mvToken;

form.addEventListener('submit', handleLogin);
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
sendRequestBtn.addEventListener('click', ping);

window.addEventListener('offline', () => {
  console.log("The network connection has been lost.");
  document.getElementById('offline-badge')?.classList.remove('hidden');
});

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {

  const { user, passw, host } = await chrome.storage.local.get(['user', 'passw', 'host']);
  console.log('user', host, user, passw);
  mvHost = host;
  if (host) formData.item(0).value = host;
  else {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && !tab.url.startsWith('chrome')) {
      try {
        let url = new URL(tab.url);
        formData.item(0).value = url.origin;
      } catch { // ignore
      }
    }
  }
  if (user) formData.item(1).value = user;
  if (passw) formData.item(2).value = passw;
})();

async function handleLogin(event) {
  loginBtn.disabled = true;

  try {
    mvHost = formData.item(0).value ? new URL(formData.item(0).value).origin : 'http://192.168.108.176';

    await chrome.permissions.request({
      permissions: ['cookies'],
      origins: [mvHost + '/']
    });

    await login();
    logoutBtn.disabled = false;
    const response = await chrome.runtime.sendMessage({greeting: "hello", mvHost, mvToken});
    console.log('sw response:', response);
  }
  catch (e) {
    setErrorMessage('Error: ' + e.message);
    loginBtn.disabled = false;
  }
}

async function login() {
  const user = formData.item(1).value || 'system';
  const passw = formData.item(2).value || 'manager';
  await chrome.storage.local.set({ user, passw, host: mvHost });

  const loginResp = await loginUser(mvHost, user, passw);
  if (loginResp.resultType === 'Error') {
    throw new Error(loginResp.message);
  }
  mvToken = loginResp.token;
  console.log('Login Response:', loginResp);
  formData.item(2).disabled = true;
  setErrorMessage('Logged in as ' + loginResp.user.firstName + ' ' + loginResp.user.lastName);
  return loginResp;
}

async function handleLogout(event) {
  event.preventDefault();
  logoutBtn.disabled = true;
  try {
    const resp = await logoutUser(mvHost);
    setErrorMessage(JSON.stringify(resp));
    formData.item(2).disabled = false;
    loginBtn.disabled = false;
  }
  catch (e) {
    logoutBtn.disabled = false;
    setErrorMessage('Error: ' + e.message);
  }

}

async function ping() {
  console.log('ping()', mvHost);
  const eventListResp = await getEventList(mvHost, mvToken);
  console.log('Event List:', eventListResp);
  setErrorMessage(JSON.stringify(eventListResp));
  return eventListResp;
}

async function deleteDomainCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      return 'No cookies found';
    }

    let pending = cookies.map(deleteCookie);
    await Promise.all(pending);

    cookiesDeleted = pending.length;
  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }

  return `Deleted ${cookiesDeleted} cookie(s).`;
}

function deleteCookie(cookie) {
  // Cookie deletion is largely modeled off of how deleting cookies works when using HTTP headers.
  // Specific flags on the cookie object like `secure` or `hostOnly` are not exposed for deletion
  // purposes. Instead, cookies are deleted by URL, name, and storeId. Unlike HTTP headers, though,
  // we don't have to delete cookies by setting Max-Age=0; we have a method for that ;)
  //
  // To remove cookies set with a Secure attribute, we must provide the correct protocol in the
  // details object's `url` property.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure
  const protocol = cookie.secure ? 'https:' : 'http:';

  // Note that the final URL may not be valid. The domain value for a standard cookie is prefixed
  // with a period (invalid) while cookies that are set to `cookie.hostOnly == true` do not have
  // this prefix (valid).
  // https://developer.chrome.com/docs/extensions/reference/cookies/#type-Cookie
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;

  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId
  });
}

function setErrorMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

import {loginUser} from "../inf-api/login-user";
import {getEventList} from "../inf-api/get-event-list";
import {logoutUser} from "../inf-api/logout-user";

const form = document.getElementById('control-row');
const formData = form.querySelectorAll('input');
const message = document.getElementById('message');
const sendRequestBtn = document.getElementById('send-request');

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const { user, passw, host } = await chrome.storage.local.get(['user', 'passw', 'host']);
  console.log('user', host, user, passw);
  if (host) formData.item(0).value = host;
  else {
    if (tab?.url && !host) {
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

form.addEventListener('submit', handleFormSubmit);
form.addEventListener('reset', logout);
sendRequestBtn.addEventListener('click', logout);

async function handleFormSubmit(event) {
  event.preventDefault();

  await chrome.permissions.request({
    permissions: ['cookies'],
    origins: ['http://192.168.108.176/']
  });

  // const url = new URL(formData.item(0).value).origin; // exception if the field is empty.
  //
  // setMessage(url);



  const resp = await connect();
  setMessage(JSON.stringify(resp), null, 4);

  // clearMessage();
  //
  // let url = stringToUrl(input.value);
  // if (!url) {
  //   setMessage('Invalid URL');
  //   return;
  // }
  //
  // let message = await deleteDomainCookies(url.hostname);
  // setMessage(message);
}

async function connect() {
  const user = formData.item(1).value || 'system';
  const passw = formData.item(2).value || 'manager';
  const host = formData.item(0).value ? new URL(formData.item(0).value).origin :'http://192.168.108.176/';
  await chrome.storage.local.set({ user, passw, host });

  const loginResp = await loginUser(host, user, passw);
  const token = loginResp.token;
  console.log('Login Response:', loginResp);

  const eventListResp = await getEventList(host, token);

  console.log('Event List:', eventListResp);
  return eventListResp;
}

async function logout(event) {
  event.preventDefault();
  await logoutUser(formData.item(0).value);
  form.disabled = false;
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

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

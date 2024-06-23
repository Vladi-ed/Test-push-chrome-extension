import{g as s}from"./getCatFact-DjrZPQam.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function c(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();async function n(){return(await chrome.storage.local.get("last-heartbeat"))["last-heartbeat"]}document.querySelector("#app").innerHTML=`
  <div>
<!--    <audio id="myAudio" autoplay>-->
<!--        <source src="cat-meow-85175.mp3" type="audio/mpeg">-->
<!--        Your browser does not support the audio element.-->
<!--    </audio>-->

    <img src="https://cataas.com/cat" class="pic" alt="Cat picture" />
  
    <div class="card">
    
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;n().then(o=>{let r;o?r=new Date(o).toLocaleTimeString():r="no last date",document.querySelector(".read-the-docs").innerHTML=r});const d=new Audio("cat-meow-85175.mp3");s().then(o=>document.querySelector(".card").innerHTML=o).then(()=>d.play());

import './style.css'
import {getLastHeartbeat} from "./helpers/getLastHeartbeat.ts";
import {getCatFact} from "./helpers/getCatFact.ts";


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="https://cataas.com/cat" class="pic" alt="Cat picture" />
  
    <div class="card">
    
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

getLastHeartbeat().then(last => {
    let lastDate: string;
    if (last)
        lastDate = new Date(last).toLocaleTimeString();
    else
        lastDate = "no last date";

    document.querySelector('.read-the-docs')!.innerHTML = lastDate;
})

getCatFact().then(fact => document.querySelector('.card')!.innerHTML = fact);
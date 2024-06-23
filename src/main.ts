import './style.css'
import {getLastHeartbeat} from "./helpers/getLastHeartbeat.ts";
import {getCatFact} from "./helpers/getCatFact.ts";


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
<!--    <audio id="myAudio" autoplay>-->
<!--        <source src="cat-meow-85175.mp3" type="audio/mpeg">-->
<!--        Your browser does not support the audio element.-->
<!--    </audio>-->

    <img src="https://cataas.com/cat" class="pic" alt="Cat picture" />
  
    <div class="card">
    
    </div>
    <p class="read-the-docs">
        Date placeholder
    </p>
    <p class="read-the-docs">
      Click to learn more:
      <a href="https://qa-mv-1778">MobileView link</a>
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

const audio = new Audio('cat-meow-85175.mp3');

getCatFact()
    .then(fact => document.querySelector('.card')!.innerHTML = fact)
    .then(() => audio.play());

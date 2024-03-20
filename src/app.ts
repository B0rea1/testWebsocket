import KucoinWebSocket from "@core/frame/kucoinWebSocket/KucoinWebSocket";
import sleep from "@core/frame/sleep";

async function main(){
   const ws = KucoinWebSocket.createWebSocket();
    await sleep(5000);

    (await ws).subscribe("/contractMarket/ticker:SOLUSDTM", (data)=>update(data));
}

let lastTs: number|null = null;
let n = 0;
let avgTS = 0;
function update(data: any){
    if(lastTs){
        const dif = data.ts/1000000-lastTs;
        avgTS = (avgTS*n+dif)/(n+1);
        n++;
        console.log(`TS: ${dif}`);
    }
    
    console.log(`AVG TS: ${avgTS}`);
    lastTs = data.ts/1000000;
    console.log(`----- ${new Date().getTime()-lastTs}`);
}


async function test(){
    const res = await fetch("https://api-futures.kucoin.com/api/v1/ticker?symbol=SOLUSDTM");
    const data = await res.json();
    console.log(new Date().getTime()-data.data.ts/1000000);
}

main();

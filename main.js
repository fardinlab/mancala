/* Ring: My pits left-to-right 0..5, My store 6,
   Opponent pits right-to-left 7..12, Opponent store 13. */
'use strict';
const Mancala = (() => {
  const store = p => p === 0 ? 6 : 13;
  const pits = p => p === 0 ? [0,1,2,3,4,5] : [12,11,10,9,8,7];
  const sum = (b,p) => pits(p).reduce((s,i) => s+b[i],0);
  function collect(board) {
    const b = board.slice();
    const terminal = sum(b,0) === 0 || sum(b,1) === 0;
    if (terminal) for (const p of [0,1]) { b[store(p)] += sum(b,p); for (const i of pits(p)) b[i]=0; }
    return {board:b,terminal};
  }
  function move(board,player,pit) {
    if (!pits(player).includes(pit) || !board[pit] || collect(board).terminal) throw new Error('Illegal move');
    const b=board.slice(); let stones=b[pit], index=pit, captured=0; b[pit]=0;
    while(stones>0) {index=(index+1)%14; if(index===store(1-player)) continue; b[index]++; stones--;}
    if(pits(player).includes(index) && b[index]===1 && b[12-index]>0) {
      captured=b[12-index]+1; b[store(player)]+=captured; b[index]=0; b[12-index]=0;
    }
    const end=collect(b), extraTurn=!end.terminal && index===store(player);
    return {...end,player:extraTurn?player:1-player,extraTurn,captured};
  }
  function evaluate(b,terminal) {
    // Evaluate from My perspective; terminal values are the collected score.
    const delta=b[6]-b[13];
    if(terminal) return delta*1000;
    return delta*1000+(sum(b,0)-sum(b,1))*100;
  }
  function solve(board,player,{timeMs=3000,maxDepth=64,onProgress=()=>{},cache=true}={}) {
    const start=performance.now(), deadline=start+timeMs;
    const initial=collect(board);
    if(initial.terminal) return {...initial,pit:null,depth:0,nodes:0};
    const table=new Map(); let nodes=0;
    const timeout={};
    function search(b,p,depth,alpha,beta) {
      if((++nodes&255)===0 && performance.now()>=deadline) throw timeout;
      const end=collect(b);
      if(end.terminal || depth===0) return evaluate(end.board,end.terminal);
      // Depth is part of the key: shallow values cannot satisfy deeper requests.
      const key=p+':'+depth+':'+b.join(',');
      const a0=alpha,b0=beta,hit=cache?table.get(key):null;
      if(hit) { if(hit.flag==='exact')return hit.value; if(hit.flag==='lower')alpha=Math.max(alpha,hit.value); else beta=Math.min(beta,hit.value); if(alpha>=beta)return hit.value; }
      let value=p===0?-Infinity:Infinity;
      const children=pits(p).filter(i=>b[i]>0).map(i=>move(b,p,i));
      children.sort((a,b)=>(p===0?1:-1)*(evaluate(b.board,b.terminal)-evaluate(a.board,a.terminal)));
      for(const child of children) {
        const score=search(child.board,child.player,depth-1,alpha,beta);
        value=p===0?Math.max(value,score):Math.min(value,score);
        if(p===0)alpha=Math.max(alpha,value); else beta=Math.min(beta,value);
        if(alpha>=beta)break;
      }
      if(cache){if(table.size>150000)table.clear();table.set(key,{value,flag:value<=a0?'upper':value>=b0?'lower':'exact'});}
      return value;
    }
    let result={pit:pits(player).find(i=>board[i]>0),depth:0,nodes:0};
    for(let depth=1;depth<=maxDepth;depth++) {
      let best=player===0?-Infinity:Infinity, bestPit=result.pit;
      try {
        const choices=pits(player).filter(i=>board[i]>0);
        // Keep previous best first to improve pruning in following iterations.
        choices.sort((a,b)=>(b===result.pit)-(a===result.pit));
        for(const pit of choices) {
          const child=move(board,player,pit);
          const value=search(child.board,child.player,depth-1,player===0?best:-Infinity,player===1?best:Infinity);
          if(player===0?value>best:value<best) {best=value;bestPit=pit;}
        }
        result={pit:bestPit,value:best,depth,nodes,elapsed:performance.now()-start};
        onProgress(result);
      } catch(error) {if(error!==timeout)throw error;break;}
      if(performance.now()>=deadline)break;
    }
    return {...result,nodes,elapsed:performance.now()-start};
  }
  return {store,pits,sum,collect,move,solve};
})();
if(typeof module!=='undefined' && module.exports) module.exports=Mancala;
if(typeof document==='undefined' && typeof self!=='undefined') {
  self.onmessage=({data})=>{
    try { const result=Mancala.solve(data.board,data.player,{timeMs:data.timeMs,onProgress:result=>self.postMessage({type:'progress',result})});self.postMessage({type:'done',result}); }
    catch(error){self.postMessage({type:'error',message:error.message});}
  };
}
if(typeof document!=='undefined') {
  const $=id=>document.getElementById(id);
  let worker=null;
  const inputs=[...document.querySelectorAll('input')];
  function cancel(){if(worker){worker.terminate();worker=null;} $('solve').disabled=false;$('cancel').hidden=true;}
  function invalidate(){cancel();document.querySelectorAll('.suggested').forEach(el=>el.classList.remove('suggested'));$('result-label').textContent='NEXT MOVE';$('result-title').textContent='Ready when you are.';$('result-detail').textContent='Enter your values above and choose whose turn it is.';$('search-detail').textContent='';const valid=inputs.every(el=>el.value!==''&&el.checkValidity());$('total').textContent=valid?inputs.reduce((s,el)=>s+Number(el.value),0)+' stones total':'Enter all 12 pits & stores';}
  $('solver-form').addEventListener('input',invalidate);
  $('solver-form').addEventListener('change',invalidate);
  $('clear').onclick=()=>{for(const input of inputs)input.value=input.id.startsWith('store')?'0':'';$('turn').value='0';invalidate();$('pit-0').focus();};
  $('example').onclick=()=>{[2,5,3,6,4,4,0,4,5,3,6,2,4,0].forEach((v,i)=>$(i===6?'store-0':i===13?'store-1':'pit-'+i).value=v);$('turn').value='0';invalidate();};
  $('cancel').onclick=()=>{invalidate();$('result-title').textContent='Search cancelled.';};
  $('solver-form').onsubmit=event=>{
    event.preventDefault();invalidate();
    if(!$('solver-form').reportValidity())return;
    const board=Array.from({length:14},(_,i)=>Number($(i===6?'store-0':i===13?'store-1':'pit-'+i).value));
    const player=Number($('turn').value),end=Mancala.collect(board);
    if(end.terminal){$('result-title').textContent='Game over';$('result-detail').textContent=`After collecting remaining stones: My score ${end.board[6]} · Opponent ${end.board[13]}. ${end.board[6]===end.board[13]?'Draw.':end.board[6]>end.board[13]?'I win.':'Opponent wins.'}`;return;}
    $('solve').disabled=true;$('cancel').hidden=false;$('result-title').textContent='Thinking…';$('result-detail').textContent='Checking captures, extra turns and both players’ replies.';
    function show(result,done){const n=Mancala.pits(player).indexOf(result.pit)+1;const next=Mancala.move(board,player,result.pit);document.querySelectorAll('.suggested').forEach(el=>el.classList.remove('suggested'));$('pit-label-'+result.pit).classList.add('suggested');$('result-label').textContent=(player===0?'MY':'OPPONENT’S')+' MOVE'+(done?'':' · SEARCHING');$('result-title').textContent='Move: Pit '+n;$('result-detail').textContent=`${player===0?'My (left)':'Opponent (right)'} column, ${n}${n===1?'st':n===2?'nd':n===3?'rd':'th'} pit from the top. ${next.captured?`Captures ${next.captured} stones. `:''}${next.terminal?'Ends the game. ':next.extraTurn?'Gives an extra turn. ':''}Scores after this move: Me ${next.board[6]} · Opponent ${next.board[13]}.`;$('search-detail').textContent=`${done?'Search complete':'Thinking'} · ${result.depth} moves deep · ${result.nodes.toLocaleString()} positions. Time-limited recommendation; deeper search may change it.`;}
    function failed(){cancel();$('result-title').textContent='Could not start the solver.';$('result-detail').textContent='Open this app through GitHub Pages or a local web server, then try again.';$('search-detail').textContent='';}
    try{worker=new Worker('main.js');worker.onmessage=({data})=>{if(data.type==='error'){failed();return;}show(data.result,data.type==='done');if(data.type==='done')cancel();};worker.onerror=event=>{event.preventDefault();failed();};worker.postMessage({board,player,timeMs:Number($('thinking').value)});}catch{failed();}
  };
}

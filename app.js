const SUPABASE_URL="https://kilbtohoqdmesnqozqqv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_jonA24CsFKjANOtOoM-s0g_NK_TNb4d";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

const KEY="championship_manager_v1";
let db;
try{db=JSON.parse(localStorage.getItem(KEY)||"{\"championships\":[]}");if(!db||!Array.isArray(db.championships))throw new Error("dados");}
catch(e){db={championships:[]};localStorage.removeItem(KEY)}
let currentId=null;
let currentAdminClubId=null;
let currentAdminCountryId=null;
let currentAdminCompetitionId=null;
let adminCompetitions=[];
let rosterPreview=[];
let rosterImportApiKey="";
const CONTINENTS=["África","América do Norte","América do Sul","Ásia","Europa","Oceania","Outros"];

const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const cur=()=>db.championships.find(c=>c.id===currentId);

function show(v){document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));const el=$("#"+v+"View");if(el)el.classList.remove("hidden");else console.error("Tela não encontrada:",v);}
function home(){const g=$("#championshipGrid");g.innerHTML="";$("#empty").classList.toggle("hidden",db.championships.length>0);db.championships.forEach(c=>{let d=document.createElement("div");d.className="champ-card";d.innerHTML="<span class=\"badge\">"+(c.division||"Campeonato")+"</span><h3>"+esc(c.name)+"</h3><div class=\"muted\">"+c.teams.length+" times · "+c.matches.length+" jogos</div>";d.onclick=()=>openChamp(c.id);g.appendChild(d)})}
function openChamp(id){currentId=id;let c=cur();$("#champName").textContent=c.name;$("#champEyebrow").textContent=c.division||"CAMPEONATO";$("#pageTitle").textContent=c.name;show("champ");render();tab("table")}
function render(){let c=cur();$("#teamCount").textContent=c.teams.length;$("#tableInfo").textContent=c.teams.length+" times · "+c.matches.length+" jogos";standings();matches();teams()}
function data(){let c=cur(),m={};c.teams.forEach(t=>m[t]={name:t,p:0,j:0,w:0,d:0,l:0,gf:0,ga:0});c.matches.forEach(x=>{if(x.homeScore===""||x.awayScore==="")return;let h=+x.homeScore,a=+x.awayScore,H=m[x.home],A=m[x.away];if(!H||!A)return;H.j++;A.j++;H.gf+=h;H.ga+=a;A.gf+=a;A.ga+=h;if(h>a){H.w++;A.l++;H.p+=3}else if(h<a){A.w++;H.l++;A.p+=3}else{H.d++;A.d++;H.p++;A.p++}});return Object.values(m).sort((a,b)=>b.p-a.p||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.name.localeCompare(b.name))}
function standings(){let rows=data().map((s,i)=>"<tr><td>"+(i+1)+"</td><td>"+esc(s.name)+"</td><td><b>"+s.p+"</b></td><td>"+s.j+"</td><td>"+s.w+"</td><td>"+s.d+"</td><td>"+s.l+"</td><td>"+s.gf+"</td><td>"+s.ga+"</td><td>"+(s.gf-s.ga>0?"+":"")+(s.gf-s.ga)+"</td></tr>").join("");$("#standings").innerHTML=rows||"<tr><td colspan=\"10\">Cadastre os times para começar.</td></tr>"}
function matches(){let c=cur(),r={};c.matches.forEach(x=>(r[x.round]??=[]).push(x));$("#rounds").innerHTML=c.matches.length?Object.entries(r).map(([n,ms])=>"<div class=\"round\"><div class=\"round-title\">Rodada "+n+"</div>"+ms.map(x=>"<div class=\"match\"><div class=\"home\">"+esc(x.home)+"</div><input class=\"score\" type=\"number\" min=\"0\" data-id=\""+x.id+"\" data-side=\"home\" value=\""+x.homeScore+"\"><span>×</span><input class=\"score\" type=\"number\" min=\"0\" data-id=\""+x.id+"\" data-side=\"away\" value=\""+x.awayScore+"\"><div>"+esc(x.away)+"</div></div>").join("")+"</div>").join(""):"<div class=\"empty-small\">Adicione times e gere o calendario.</div>"}
function teams(){let c=cur();$("#teamList").innerHTML=c.teams.map(t=>"<div class=\"team-item\"><span>"+esc(t)+"</span><button class=\"remove\" data-team=\""+esc(t)+"\">Remover</button></div>").join("")||"<div class=\"empty-small\">Nenhum time cadastrado.</div>";document.querySelectorAll(".remove").forEach(b=>b.onclick=()=>removeTeam(b.dataset.team))}
function addTeam(){let i=$("#teamName"),n=i.value.trim(),c=cur();if(!n)return alert("Digite o nome do time.");if(c.teams.includes(n))return alert("Esse time ja esta cadastrado.");c.teams.push(n);i.value="";c.matches=[];save();render()}
function removeTeam(n){let c=cur();if(c.matches.length&&!confirm("Remover o time apaga o calendario atual. Continuar?"))return;c.teams=c.teams.filter(x=>x!==n);c.matches=[];save();render()}
function generate(){let c=cur();if(c.teams.length<2)return alert("Cadastre pelo menos 2 times.");let a=[...c.teams];if(a.length%2)a.push(null);let n=a.length,r=[];for(let k=0;k<n-1;k++){let games=[];for(let i=0;i<n/2;i++){let h=a[i],v=a[n-1-i];if(h&&v)games.push([h,v])}r.push(games);a=[a[0],a[n-1],...a.slice(1,n-1)]}if(c.format==="double")r=r.concat(r.map(gs=>gs.map(g=>[g[1],g[0]])));c.matches=[];let id=1;r.forEach((gs,k)=>gs.forEach(g=>c.matches.push({id:id++,round:k+1,home:g[0],away:g[1],homeScore:"",awayScore:""})));save();render();tab("matches")}
function saveResults(){let c=cur();document.querySelectorAll(".score").forEach(i=>{let m=c.matches.find(x=>x.id==i.dataset.id);m[i.dataset.side+"Score"]=i.value===""?"":String(Math.max(0,Math.floor(+i.value)))});save();render();alert("Resultados salvos.")}
function tab(t){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));["table","matches","teams"].forEach(x=>$("#"+x+"Tab").classList.toggle("hidden",x!==t))}
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]))}

function setAuthMessage(message,type="info"){const el=$("#authMessage");el.textContent=message;el.className="auth-message "+type;}
function showAuthMode(mode){
  const login=mode==="login";
  $("#loginForm").classList.toggle("hidden",!login);
  $("#signupForm").classList.toggle("hidden",login);
  $("#authTitle").textContent=login?"Entrar na conta":"Criar sua conta";
  $("#authSubtitle").textContent=login?"Entre para acessar seus campeonatos e continuar sua carreira.":"Crie sua conta para que suas futuras carreiras possam ficar vinculadas ao seu perfil.";
  $("#authSwitchText").textContent=login?"Ainda não tem uma conta?":"Já tem uma conta?";
  $("#authSwitch").textContent=login?"Criar conta":"Entrar";
  $("#authMessage").classList.add("hidden");
}
function showAuth(){ $("#authView").classList.remove("hidden"); $("#appShell").classList.add("hidden"); }
async function showApp(user){
  $("#authView").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  $("#userEmail").textContent=user?.email||"";
  $("#pageTitle").textContent="Meus campeonatos";
  show("home");
  home();
  await loadAdmin(user);
}
async function login(email,password){
  setAuthMessage("Entrando...","info");
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error){setAuthMessage("Não foi possível entrar. Confira o e-mail e a senha.","error");return;}
  showApp(data.user);
}
async function signup(email,password){
  setAuthMessage("Criando sua conta...","info");
  const {data,error}=await supabaseClient.auth.signUp({email,password});
  if(error){setAuthMessage(error.message||"Não foi possível criar a conta.","error");return;}
  if(data.session){showApp(data.user);}
  else{setAuthMessage("Conta criada! Verifique seu e-mail para confirmar a conta e depois entre no Global Football Sim.","success");}
}

async function loadAdmin(user){
  const nav=$("#adminNav");
  if(!nav||!user)return;
  const {data,error}=await supabaseClient.from("profiles").select("role").eq("id",user.id).maybeSingle();
  const isAdmin=!error&&data?.role==="admin";
  nav.classList.toggle("hidden",!isAdmin);
  if(isAdmin) await refreshAdmin();
}



let rosterImportCompetitionClubs=[];
let rosterImportFileName="";
let rosterImportErrors=[];

function openRosterImporter(){
  const select=$("#rosterImportCompetition");
  select.innerHTML='<option value="">Selecione a competição</option>'+adminCompetitions.map(x=>'<option value="'+x.id+'">'+esc(x.name)+(x.countries?.name?' · '+esc(x.countries.name):'')+'</option>').join("");
  $("#rosterCsvFile").value="";
  $("#rosterCsvText").value="";
  $("#rosterImportResult").classList.add("hidden");
  $("#rosterImportMessage").classList.add("hidden");
  rosterPreview=[];
  rosterImportCompetitionClubs=[];
  rosterImportErrors=[];
  rosterImportFileName="";
  show("rosterImporter");
  $("#pageTitle").textContent="Importar elencos por CSV";
}

async function loadRosterImportClubs(competitionId){
  if(!competitionId){
    rosterImportCompetitionClubs=[];
    return;
  }
  const {data:links,error}=await supabaseClient.from("competition_clubs").select("club_id,clubs(id,name,short_name)").eq("competition_id",Number(competitionId)).order("id");
  if(error){
    rosterImportCompetitionClubs=[];
    adminMessage("Não foi possível carregar os clubes: "+error.message,"error");
    return;
  }
  rosterImportCompetitionClubs=(links||[]).map(x=>x.clubs).filter(Boolean);
}

function normalizeName(name){
  return String(name||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function mapCsvPosition(position){
  const p=normalizeName(position).replace(/\s+/g,"");
  if(["gk","gol","goleiro","goalkeeper"].includes(p))return "GK";
  if(["def","defesa","defensor","defender"].includes(p))return "DEF";
  if(["mid","mei","meia","meio","midfielder"].includes(p))return "MID";
  if(["fwd","ata","atacante","forward"].includes(p))return "FWD";
  return "";
}

function parseCsvLine(line){
  const cells=[];
  let value="";
  let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted&&line[i+1]==='"'){value+='"';i++;}
      else quoted=!quoted;
    }else if((ch===","||ch===";")&&!quoted){
      cells.push(value.trim());
      value="";
    }else{
      value+=ch;
    }
  }
  cells.push(value.trim());
  return cells;
}

function parseCsv(text){
  const clean=String(text||"").replace(/^\uFEFF/,"").replace(/\r/g,"");
  const lines=clean.split("\n").filter(line=>line.trim()!=="");
  if(!lines.length)throw new Error("O CSV está vazio.");
  const rows=[];
  let current="";
  let quoted=false;

  for(const line of lines){
    current=current?current+"\n"+line:line;
    let quotes=0;
    for(let j=0;j<line.length;j++)if(line[j]==='"'&&line[j-1]!=='"')quotes++;
    if(quotes%2===1)quoted=!quoted;
    if(!quoted){
      rows.push(parseCsvLine(current));
      current="";
    }
  }
  if(current)rows.push(parseCsvLine(current));
  return rows;
}

function normalizeHeader(header){
  return normalizeName(header).replace(/\s+/g,"");
}

function findCsvColumn(headers,names){
  for(const name of names){
    const index=headers.indexOf(normalizeHeader(name));
    if(index>=0)return index;
  }
  return -1;
}

function parseRosterCsv(text){
  const raw=parseCsv(text);
  if(raw.length<2)throw new Error("O CSV precisa ter uma linha de cabeçalho e pelo menos um jogador.");

  const headers=raw[0].map(normalizeHeader);
  const clubIndex=findCsvColumn(headers,["clube","club","time","team"]);
  const playerIndex=findCsvColumn(headers,["jogador","player","nome","name"]);
  const positionIndex=findCsvColumn(headers,["posicao","posição","position"]);
  const numberIndex=findCsvColumn(headers,["numero","número","numero camisa","camisa","number","shirt number","shirt_number"]);
  const ovrIndex=findCsvColumn(headers,["ovr","overall","forca","força"]);
  const potIndex=findCsvColumn(headers,["pot","potential","potencial"]);

  if(clubIndex<0||playerIndex<0||positionIndex<0||ovrIndex<0||potIndex<0)throw new Error("Cabeçalho inválido. O CSV precisa conter: clube, jogador, posicao, ovr e pot. A coluna numero é opcional.");

  const rows=[];
  const errors=[];
  const seen=new Set();

  for(let i=1;i<raw.length;i++){
    const lineNumber=i+1;
    const cells=raw[i];
    const club=String(cells[clubIndex]||"").trim();
    const name=String(cells[playerIndex]||"").trim();
    const position=mapCsvPosition(cells[positionIndex]);
    const numberRaw=numberIndex>=0?String(cells[numberIndex]||"").trim():"";
    const ovrRaw=Number(String(cells[ovrIndex]||"").replace(",",".")); 
    const potRaw=Number(String(cells[potIndex]||"").replace(",",".")); 

    if(!club&&!name&&!cells.some(Boolean))continue;
    const rowErrors=[];
    if(!club)rowErrors.push("clube não informado");
    if(!name)rowErrors.push("jogador não informado");
    if(!position)rowErrors.push("posição inválida");
    if(!Number.isFinite(ovrRaw)||ovrRaw<1||ovrRaw>100)rowErrors.push("OVR inválido");
    if(!Number.isFinite(potRaw)||potRaw<1||potRaw>100)rowErrors.push("POT inválido");
    const number=numberRaw===""?null:Number(numberRaw);
    if(numberRaw!==""&&(!Number.isFinite(number)||number<0||number>99))rowErrors.push("número da camisa inválido");

    if(rowErrors.length){
      rowErrors.forEach(message=>errors.push("Linha "+lineNumber+": "+message+"."));
      continue;
    }

    const key=normalizeName(club)+"|"+normalizeName(name);
    if(seen.has(key)){
      errors.push("Linha "+lineNumber+": jogador duplicado para o mesmo clube.");
      continue;
    }
    seen.add(key);

    rows.push({
      line:lineNumber,
      clubInput:club,
      player:name,
      position,
      number,
      overall:Math.round(ovrRaw),
      potential:Math.round(potRaw),
      clubId:null,
      clubName:"",
      validClub:false
    });
  }
  return {rows,errors};
}

function resolveRosterClub(input){
  const key=normalizeName(input);
  return rosterImportCompetitionClubs.find(club=>normalizeName(club.name)===key||normalizeName(club.short_name)===key)||null;
}

function renderRosterPreview(){
  const wrap=$("#rosterImportRows");
  const errorsEl=$("#rosterImportErrors");
  const invalidClubCount=rosterPreview.filter(x=>!x.validClub).length;

  wrap.innerHTML=rosterPreview.map((p,i)=>
    '<tr class="'+(p.validClub?"":"csv-row-error")+'">'+
    '<td><strong>'+esc(p.clubInput)+'</strong>'+(p.validClub?'':'<small class="csv-inline-error">Clube não encontrado</small>')+'</td>'+
    '<td><strong>'+esc(p.player)+'</strong></td>'+
    '<td><select class="roster-pos" data-roster-index="'+i+'">'+
      '<option value="GK"'+(p.position==="GK"?" selected":"")+'>GOL</option>'+
      '<option value="DEF"'+(p.position==="DEF"?" selected":"")+'>DEF</option>'+
      '<option value="MID"'+(p.position==="MID"?" selected":"")+'>MEI</option>'+
      '<option value="FWD"'+(p.position==="FWD"?" selected":"")+'>ATA</option>'+
    '</select></td>'+
    '<td><input class="roster-number" data-roster-index="'+i+'" type="number" min="0" max="99" value="'+(p.number??"")+'"></td>'+
    '<td><input class="roster-ovr" data-roster-index="'+i+'" type="number" min="1" max="100" value="'+p.overall+'"></td>'+
    '<td><input class="roster-pot" data-roster-index="'+i+'" type="number" min="1" max="100" value="'+p.potential+'"></td>'+
    '</tr>'
  ).join("");

  if(rosterImportErrors.length){
    errorsEl.innerHTML="<strong>Problemas encontrados:</strong><br>"+rosterImportErrors.map(esc).join("<br>");
    errorsEl.classList.remove("hidden");
  }else{
    errorsEl.classList.add("hidden");
    errorsEl.innerHTML="";
  }

  const total=rosterPreview.length;
  const ready=rosterPreview.filter(x=>x.validClub).length;
  $("#rosterImportResultMeta").textContent=total+" jogador(es) lido(s) · "+ready+" pronto(s) para importar"+(invalidClubCount?" · "+invalidClubCount+" com clube não encontrado":"");
  $("#saveImportedRoster").disabled=!ready||rosterImportErrors.length>0;
  $("#rosterImportResult").classList.toggle("hidden",!total);
}

function readRosterPreviewEdits(){
  document.querySelectorAll(".roster-pos").forEach(x=>{const row=rosterPreview[Number(x.dataset.rosterIndex)];if(row)row.position=x.value;});
  document.querySelectorAll(".roster-number").forEach(x=>{const row=rosterPreview[Number(x.dataset.rosterIndex)];if(row)row.number=x.value===""?null:Math.max(0,Math.min(99,Number(x.value)||0));});
  document.querySelectorAll(".roster-ovr").forEach(x=>{const row=rosterPreview[Number(x.dataset.rosterIndex)];if(row)row.overall=Math.max(1,Math.min(100,Number(x.value)||50));});
  document.querySelectorAll(".roster-pot").forEach(x=>{const row=rosterPreview[Number(x.dataset.rosterIndex)];if(row)row.potential=Math.max(1,Math.min(100,Number(x.value)||50));});
}

function rosterImportMessage(message,type="info"){
  const el=$("#rosterImportMessage");
  if(!el)return;
  el.textContent=message;
  el.className="admin-message "+type;
  el.classList.remove("hidden");
}

async function readRosterCsv(){
  const competitionId=Number($("#rosterImportCompetition").value);
  if(!competitionId){rosterImportMessage("Selecione a competição antes de ler o CSV.","error");return;}
  if(!rosterImportCompetitionClubs.length)await loadRosterImportClubs(competitionId);
  if(!rosterImportCompetitionClubs.length){rosterImportMessage("Essa competição não possui clubes cadastrados.","error");return;}

  const file=$("#rosterCsvFile").files?.[0];
  let text=$("#rosterCsvText").value.trim();
  if(file){
    try{
      text=await file.text();
      rosterImportFileName=file.name;
      $("#rosterCsvText").value=text;
    }catch(error){
      rosterImportMessage("Não foi possível ler o arquivo CSV: "+error.message,"error");
      return;
    }
  }
  if(!text){rosterImportMessage("Selecione um arquivo CSV ou cole o conteúdo no campo.","error");return;}

  try{
    rosterImportMessage("Lendo e validando o CSV...","info");
    const parsed=parseRosterCsv(text);
    rosterImportErrors=[...parsed.errors];
    rosterPreview=parsed.rows.map(row=>{
      const club=resolveRosterClub(row.clubInput);
      if(!club)rosterImportErrors.push("Linha "+row.line+": clube '"+row.clubInput+"' não está cadastrado nesta competição.");
      return {...row,clubId:club?.id||null,clubName:club?.name||"",validClub:Boolean(club)};
    });
    renderRosterPreview();
    if(rosterImportErrors.length)rosterImportMessage("Encontrei "+rosterImportErrors.length+" problema(s). Corrija o CSV e leia novamente antes de importar.","error");
    else rosterImportMessage(rosterPreview.length+" jogador(es) prontos para importação.","success");
  }catch(error){
    rosterPreview=[];
    rosterImportErrors=[error?.message||String(error)];
    renderRosterPreview();
    rosterImportMessage("Não foi possível ler o CSV: "+(error?.message||String(error)),"error");
  }
}

function downloadRosterCsvTemplate(){
  const content="\uFEFFclube,jogador,posicao,numero,ovr,pot\nFlamengo,Jogador Exemplo,FWD,9,88,91\nFlamengo,Outro Jogador,MID,8,84,87\nPalmeiras,Jogador Exemplo 2,DEF,4,86,89\n";
  const blob=new Blob([content],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="modelo-elencos-global-football-sim.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clearRosterCsv(){
  $("#rosterCsvFile").value="";
  $("#rosterCsvText").value="";
  $("#rosterImportResult").classList.add("hidden");
  $("#rosterImportMessage").classList.add("hidden");
  rosterPreview=[];
  rosterImportErrors=[];
}

async function saveImportedRoster(){
  readRosterPreviewEdits();
  const rows=rosterPreview.filter(x=>x.validClub);
  if(!rows.length){rosterImportMessage("Não há jogadores válidos para importar.","error");return;}
  if(rosterImportErrors.length){rosterImportMessage("Corrija os problemas do CSV antes de importar.","error");return;}

  const button=$("#saveImportedRoster");
  button.disabled=true;
  try{
    const grouped={};
    rows.forEach(row=>(grouped[row.clubId]??=[]).push(row));
    let clubsDone=0,added=0,updated=0;

    for(const clubId of Object.keys(grouped)){
      const clubRows=grouped[clubId];
      const clubName=clubRows[0].clubName||clubRows[0].clubInput;
      rosterImportMessage("Importando "+clubName+"...","info");

      const {data:existingLinks,error:existingError}=await supabaseClient.from("club_players").select("id,player_id,shirt_number,players(id,name)").eq("club_id",Number(clubId));
      if(existingError)throw new Error(clubName+": "+existingError.message);

      const existingByName={};
      (existingLinks||[]).forEach(link=>existingByName[normalizeName(link.players?.name)]=link);

      for(const row of clubRows){
        const existing=existingByName[normalizeName(row.player)];
        if(existing){
          const {error:updateError}=await supabaseClient.from("players").update({position:row.position,overall:row.overall,potential:row.potential}).eq("id",existing.player_id);
          if(updateError)throw new Error(clubName+" / "+row.player+": "+updateError.message);
          const {error:numberError}=await supabaseClient.from("club_players").update({shirt_number:row.number}).eq("id",existing.id);
          if(numberError)throw new Error(clubName+" / "+row.player+": "+numberError.message);
          updated++;
        }else{
          const {data:player,error:playerError}=await supabaseClient.from("players").insert({name:row.player,position:row.position,overall:row.overall,potential:row.potential}).select("id").single();
          if(playerError)throw new Error(clubName+" / "+row.player+": "+playerError.message);
          const {error:linkError}=await supabaseClient.from("club_players").insert({club_id:Number(clubId),player_id:player.id,shirt_number:row.number});
          if(linkError){
            await supabaseClient.from("players").delete().eq("id",player.id);
            throw new Error(clubName+" / "+row.player+": "+linkError.message);
          }
          added++;
        }
      }
      clubsDone++;
    }

    rosterImportMessage("Importação concluída: "+clubsDone+" clube(s), "+added+" jogador(es) novo(s) e "+updated+" atualizado(s).","success");
    $("#rosterImportResultMeta").textContent="Concluído · "+clubsDone+" clube(s) · "+added+" novo(s) · "+updated+" atualizado(s).";
    await refreshAdmin();
  }catch(error){
    rosterImportMessage("A importação foi interrompida: "+(error?.message||String(error)),"error");
  }finally{
    button.disabled=false;
  }
}

function adminMessage(message,type="success"){
  const el=$("#adminMessage");
  if(!el)return;
  el.textContent=message;
  el.className="admin-message "+type;
  setTimeout(()=>el.classList.add("hidden"),3500);
}

function optionRows(items,placeholder="Selecione..."){
  return '<option value="">'+placeholder+'</option>'+items.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("");
}

async function refreshAdmin(){
  const [countries,competitions,clubs,memberships]=await Promise.all([
    supabaseClient.from("countries").select("*").order("name"),
    supabaseClient.from("competitions").select("*, countries(name)").order("name"),
    supabaseClient.from("clubs").select("*").order("name"),
    supabaseClient.from("competition_clubs").select("club_id, competition_id, competitions(id,name,country_id,countries(name))")
  ]);
  if(countries.error||competitions.error||clubs.error||memberships.error){
    adminMessage("Não foi possível carregar os dados administrativos. Verifique se a tabela competition_clubs já foi criada e se a tabela countries possui continent e flag.","error");
    return;
  }
  const cs=countries.data||[];
  const comps=competitions.data||[];
  const cls=clubs.data||[];
  const links=memberships.data||[];
  adminCompetitions=comps;
  const linkByClub={};
  links.forEach(x=>linkByClub[x.club_id]=x);

  const grouped={};
  cs.forEach(x=>{
    const continent=x.continent||"Outros";
    (grouped[continent]??=[]).push(x);
  });
  const continentOrder=[...CONTINENTS,...Object.keys(grouped).filter(x=>!CONTINENTS.includes(x))];
  const countryGroups=continentOrder.filter(x=>grouped[x]?.length).map(cont=>{
    const items=grouped[cont].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
    return '<details class="continent-group"><summary class="continent-title"><span>🌍 '+esc(cont)+'</span><small>'+items.length+' país(es)</small></summary><div class="continent-countries">'+items.map(x=>'<button type="button" class="country-open" data-open-country="'+x.id+'"><div class="admin-item-main country-main"><span class="country-flag">'+esc(x.flag||"🏳️")+'</span><div><div class="admin-item-name">'+esc(x.name)+'</div><div class="admin-item-meta">'+esc(x.code||"Sem código")+'</div></div><span class="country-arrow">→</span></button>').join("")+'</div></details>';
  }).join("");
  $("#countriesList").innerHTML=countryGroups||'<div class="empty-small">Nenhum país cadastrado.</div>';

  $("#clubsList").innerHTML="";
  document.querySelectorAll("[data-open-country]").forEach(b=>b.onclick=()=>openAdminCountry(Number(b.dataset.openCountry)));
  document.querySelectorAll("[data-delete-club]").forEach(b=>b.onclick=()=>deleteAdmin("clubs",b.dataset.deleteClub));
  document.querySelectorAll("[data-open-club]").forEach(b=>b.onclick=()=>openAdminClub(Number(b.dataset.openClub)));
}
async function openAdminCountry(id){
  currentAdminCountryId=id;
  show("countryAdmin");
  $("#pageTitle").textContent="País";
  $("#countryAdminName").textContent="Carregando...";
  $("#countryAdminEyebrow").textContent="PAÍS";
  const {data:country,error}=await supabaseClient.from("countries").select("*").eq("id",id).single();
  if(error){
    adminMessage("Não foi possível abrir o país: "+error.message,"error");
    return;
  }
  $("#countryAdminName").textContent=(country.flag||"🌍")+" "+country.name;
  $("#countryAdminEyebrow").textContent=country.continent||"PAÍS";
  $("#pageTitle").textContent=country.name;
  await refreshCountryCompetitions();
}

async function refreshCountryCompetitions(){
  if(!currentAdminCountryId)return;
  const {data,error}=await supabaseClient.from("competitions").select("*").eq("country_id",currentAdminCountryId).order("division").order("name");
  if(error){adminMessage("Não foi possível carregar as competições.","error");return;}
  $("#countryCompetitionsList").innerHTML=(data||[]).length
    ? data.map(x=>{
        const type=x.competition_type==="cup"?"Copa":"Liga";
        const format=x.competition_type==="cup"
          ? (x.cup_mode==="double"?"Ida e volta":"Jogo único")
          : (x.round_robin_legs==="double"?"Turno e returno":"Turno único");
        return '<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">🏆 '+esc(x.name)+'</div><div class="admin-item-meta">'+type+' · Divisão '+x.division+' · '+(x.team_count||0)+' times · '+format+'</div></div><div class="admin-item-actions"><button class="club-open" data-open-country-competition="'+x.id+'">Times</button><button class="club-open" data-edit-country-competition="'+x.id+'">Editar</button><button class="admin-delete" data-delete-country-competition="'+x.id+'">Excluir</button></div></div>';
      }).join("")
    : '<div class="empty-small">Nenhuma competição cadastrada neste país.</div>';
  document.querySelectorAll("[data-delete-country-competition]").forEach(b=>b.onclick=()=>deleteCountryCompetition(Number(b.dataset.deleteCountryCompetition)));
  document.querySelectorAll("[data-edit-country-competition]").forEach(b=>b.onclick=()=>editCountryCompetition(Number(b.dataset.editCountryCompetition)));
  document.querySelectorAll("[data-open-country-competition]").forEach(b=>b.onclick=()=>openAdminCompetition(Number(b.dataset.openCountryCompetition)));
}

async function openAdminCompetition(id){
  currentAdminCompetitionId=id;
  const {data:comp,error}=await supabaseClient.from("competitions").select("*, countries(name,continent)").eq("id",id).single();
  if(error){adminMessage("Não foi possível abrir a competição: "+error.message,"error");return;}
  $("#competitionAdminName").textContent="🏆 "+comp.name;
  $("#competitionAdminEyebrow").textContent=comp.countries?.name||"COMPETIÇÃO";
  const type=comp.competition_type==="cup"?"Copa":"Liga";
  const format=comp.competition_type==="cup"?(comp.cup_mode==="double"?"Ida e volta":"Jogo único"):(comp.round_robin_legs==="double"?"Turno e returno":"Turno único");
  $("#competitionAdminMeta").textContent=type+" · Divisão "+comp.division+" · "+comp.team_count+" times · "+format;
  await refreshCompetitionTeams();
  show("competitionAdmin");
  $("#pageTitle").textContent=comp.name;
}

async function refreshCompetitionTeams(){
  if(!currentAdminCompetitionId)return;
  const {data:comp,error:compError}=await supabaseClient.from("competitions").select("id,country_id,team_count").eq("id",currentAdminCompetitionId).single();
  if(compError)return;
  const {data:links,error:linksError}=await supabaseClient.from("competition_clubs").select("id,club_id,clubs(id,name,short_name,strength,country_id)").eq("competition_id",currentAdminCompetitionId).order("id");
  if(linksError){adminMessage("Não foi possível carregar os times: "+linksError.message,"error");return;}
  const teams=links||[];
  const {data:clubs,error:clubsError}=await supabaseClient.from("clubs").select("id,name,short_name,strength,country_id").eq("country_id",comp.country_id).order("name");
  if(clubsError){adminMessage("Não foi possível carregar os clubes: "+clubsError.message,"error");return;}
  const used=new Set(teams.map(x=>x.club_id));
  const available=(clubs||[]).filter(x=>!used.has(x.id));
  $("#competitionTeamClub").innerHTML='<option value="">Selecione o time</option>'+available.map(x=>'<option value="'+x.id+'">'+esc(x.name)+(x.short_name?' ('+esc(x.short_name)+')':'')+'</option>').join("");
  const competitionFull=teams.length>=Number(comp.team_count||0);
  $("#competitionTeamClub").disabled=competitionFull;
  $("#competitionTeamForm button[type='submit']").disabled=competitionFull;
  $("#addAllCompetitionTeams").disabled=competitionFull || available.length===0;
  $("#competitionTeamsCount").textContent=teams.length+" / "+comp.team_count+" times";
  $("#competitionTeamsList").innerHTML=teams.length?teams.map(x=>'<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">⚽ '+esc(x.clubs?.name||"Time")+'</div><div class="admin-item-meta">Força '+(x.clubs?.strength??"-")+(x.clubs?.short_name?' · '+esc(x.clubs.short_name):"")+'</div></div><div class="admin-item-actions"><button class="club-open" data-open-club="'+x.club_id+'">Elenco</button><button class="admin-delete" data-remove-competition-team="'+x.id+'">Retirar</button></div></div>').join(""):'<div class="empty-small">Nenhum time cadastrado nesta competição.</div>';
  document.querySelectorAll("[data-remove-competition-team]").forEach(b=>b.onclick=()=>removeCompetitionTeam(Number(b.dataset.removeCompetitionTeam)));
  document.querySelectorAll("[data-open-club]").forEach(b=>b.onclick=()=>openAdminClub(Number(b.dataset.openClub)));
}

async function addAllCompetitionTeams(){
  if(!currentAdminCompetitionId)return;
  const button=$("#addAllCompetitionTeams");
  button.disabled=true;
  const {data:comp,error:compError}=await supabaseClient.from("competitions").select("team_count,country_id,name").eq("id",currentAdminCompetitionId).single();
  if(compError){adminMessage("Não foi possível verificar a competição: "+compError.message,"error");await refreshCompetitionTeams();return;}
  const {data:links,error:linksError}=await supabaseClient.from("competition_clubs").select("club_id").eq("competition_id",currentAdminCompetitionId);
  if(linksError){adminMessage("Não foi possível verificar os times: "+linksError.message,"error");await refreshCompetitionTeams();return;}
  const used=new Set((links||[]).map(x=>x.club_id));
  const {data:clubs,error:clubsError}=await supabaseClient.from("clubs").select("id,name").eq("country_id",comp.country_id).order("name");
  if(clubsError){adminMessage("Não foi possível carregar os clubes: "+clubsError.message,"error");await refreshCompetitionTeams();return;}
  const available=(clubs||[]).filter(x=>!used.has(x.id));
  const slots=Math.max(0,Number(comp.team_count||0)-(links||[]).length);
  const toAdd=available.slice(0,slots);
  if(!toAdd.length){
    adminMessage((links||[]).length>=Number(comp.team_count||0)?"A competição já atingiu o número máximo de times.":"Não há clubes disponíveis para adicionar.");
    await refreshCompetitionTeams();
    return;
  }
  const {error}=await supabaseClient.from("competition_clubs").insert(
    toAdd.map(club=>({competition_id:currentAdminCompetitionId,club_id:club.id}))
  );
  if(error){adminMessage("Não foi possível adicionar todos os times: "+error.message,"error");await refreshCompetitionTeams();return;}
  await refreshCompetitionTeams();
  await refreshAdmin();
  const remaining=available.length-toAdd.length;
  if(remaining>0){
    adminMessage(toAdd.length+" times adicionados. A competição atingiu o limite de "+comp.team_count+" times; "+remaining+" clube(s) ficaram de fora.");
  }else{
    adminMessage(toAdd.length+" times adicionados à competição.");
  }
}

async function removeCompetitionTeam(linkId){
  if(!confirm("Retirar este time da competição?"))return;
  const {error}=await supabaseClient.from("competition_clubs").delete().eq("id",linkId);
  if(error){adminMessage("Não foi possível retirar o time: "+error.message,"error");return;}
  await refreshCompetitionTeams();
  await refreshAdmin();
  adminMessage("Time retirado da competição.");
}

async function editCountryCompetition(id){
  const {data:c,error}=await supabaseClient.from("competitions").select("*").eq("id",id).single();
  if(error){adminMessage("Não foi possível carregar a competição: "+error.message,"error");return;}
  $("#countryCompetitionName").value=c.name||"";
  $("#countryCompetitionDivision").value=c.division||1;
  $("#countryCompetitionType").value=c.competition_type||"league";
  $("#countryCompetitionTeams").value=c.team_count||20;
  $("#countryCompetitionLegs").value=c.round_robin_legs||"single";
  $("#countryCompetitionCupMode").value=c.cup_mode||"single";
  document.querySelector("#countryCompetitionForm button").textContent="Salvar alterações";
  document.querySelector("#countryCompetitionForm").dataset.editingId=id;
  document.querySelector("#countryCompetitionType").dispatchEvent(new Event("change"));
  window.scrollTo({top:0,behavior:"smooth"});
}

async function deleteCountryCompetition(id){
  if(!confirm("Excluir esta competição?"))return;
  const {error}=await supabaseClient.from("competitions").delete().eq("id",id);
  if(error){adminMessage("Não foi possível excluir: "+error.message,"error");return;}
  await refreshCountryCompetitions();
  await refreshAdmin();
  adminMessage("Competição excluída.");
}

async function openAdminClub(id){
  currentAdminClubId=id;
  const [{data:club,error:clubError},{data:link,error:linkError},{data:squad,error:squadError}]=await Promise.all([
    supabaseClient.from("clubs").select("*").eq("id",id).single(),
    supabaseClient.from("competition_clubs").select("competition_id, competitions(name, countries(name))").eq("club_id",id).maybeSingle(),
    supabaseClient.from("club_players").select("id, shirt_number, squad_role, players(id,name,position,overall,potential)").eq("club_id",id).order("id")
  ]);
  if(clubError||linkError||squadError){adminMessage("Não foi possível abrir o elenco.","error");return;}
  $("#clubAdminName").textContent=club.name;
  $("#clubAdminEyebrow").textContent=link?.competitions?.countries?.name||"CLUBE";
  $("#clubAdminMeta").textContent=(link?.competitions?.name||"Sem competição")+" · Força "+club.strength+" · Orçamento "+Number(club.budget||0).toLocaleString("pt-BR");
  renderSquadRows();
  renderSquadList(squad||[]);
  show("clubAdmin");
  $("#pageTitle").textContent=club.name;
}

function renderSquadRows(count=4){
  const wrap=$("#squadRows");
  wrap.innerHTML="";
  for(let i=0;i<count;i++) addSquadRow();
}

function addSquadRow(){
  const wrap=$("#squadRows");
  const row=document.createElement("div");
  row.className="squad-row";
  row.innerHTML='<input class="squad-name" placeholder="Nome do jogador"><select class="squad-position"><option value="GK">GOL</option><option value="DEF">DEF</option><option value="MID" selected>MEI</option><option value="FWD">ATA</option></select><input class="squad-overall" type="number" min="1" max="100" value="50" placeholder="OVR"><input class="squad-potential" type="number" min="1" max="100" value="50" placeholder="POT"><button type="button" class="remove-row" title="Remover">×</button>';
  row.querySelector(".remove-row").onclick=()=>row.remove();
  wrap.appendChild(row);
}

function renderSquadList(squad){
  $("#squadList").innerHTML=squad.length?squad.map(x=>'<div class="squad-player"><strong>'+esc(x.players?.name||"Jogador")+'</strong><span>'+esc(x.players?.position||"")+' · OVR '+(x.players?.overall??"-")+' · POT '+(x.players?.potential??"-")+' <button class="admin-delete" data-remove-player="'+x.id+'">Remover do elenco</button></span></div>').join(""):'<div class="empty-small">Nenhum jogador neste elenco.</div>';
  document.querySelectorAll("[data-remove-player]").forEach(b=>b.onclick=()=>removeFromSquad(Number(b.dataset.removePlayer)));
}

async function reloadSquad(){
  const {data,error}=await supabaseClient.from("club_players").select("id, shirt_number, squad_role, players(id,name,position,overall,potential)").eq("club_id",currentAdminClubId).order("id");
  if(error){adminMessage("Não foi possível atualizar o elenco.","error");return;}
  renderSquadList(data||[]);
}

async function saveSquad(){
  const rows=[...document.querySelectorAll(".squad-row")];
  const payload=rows.map(row=>({
    name:row.querySelector(".squad-name").value.trim(),
    position:row.querySelector(".squad-position").value,
    overall:Number(row.querySelector(".squad-overall").value)||50,
    potential:Number(row.querySelector(".squad-potential").value)||50
  })).filter(x=>x.name);
  if(!payload.length){adminMessage("Digite pelo menos um jogador.","error");return;}
  const {data:players,error}=await supabaseClient.from("players").insert(payload).select("id");
  if(error){adminMessage("Não foi possível salvar os jogadores: "+error.message,"error");return;}
  const links=players.map(p=>({club_id:currentAdminClubId,player_id:p.id}));
  const {error:linkError}=await supabaseClient.from("club_players").insert(links);
  if(linkError){
    await supabaseClient.from("players").delete().in("id",players.map(p=>p.id));
    adminMessage("Não foi possível montar o elenco: "+linkError.message,"error");
    return;
  }
  adminMessage(payload.length+" jogador(es) adicionado(s) ao elenco.");
  renderSquadRows();
  await reloadSquad();
}

async function removeFromSquad(id){
  if(!confirm("Remover este jogador do elenco? O jogador continuará cadastrado no mundo e poderá ser usado novamente."))return;
  const {error}=await supabaseClient.from("club_players").delete().eq("id",id);
  if(error){adminMessage("Não foi possível remover: "+error.message,"error");return;}
  await reloadSquad();
  adminMessage("Jogador removido do elenco.");
}



async function deleteAdmin(table,id){
  if(!confirm("Excluir este cadastro? Se ele estiver sendo usado por outro dado, o banco poderá impedir a exclusão."))return;
  const {error}=await supabaseClient.from(table).delete().eq("id",id);
  if(error){adminMessage("Não foi possível excluir: "+error.message,"error");return;}
  adminMessage("Cadastro excluído.");
  await refreshAdmin();
}

async function addAdminRow(table,payload){
  const {error}=await supabaseClient.from(table).insert(payload);
  if(error){adminMessage("Não foi possível salvar: "+error.message,"error");return false;}
  adminMessage("Cadastro adicionado.");
  await refreshAdmin();
  return true;
}

function setupAdminForms(){
  $("#countryForm").onsubmit=async e=>{
    e.preventDefault();
    const name=$("#countryName").value.trim();
    if(!name)return;
    const continent=$("#countryContinent").value;
    if(!continent){adminMessage("Selecione o continente do país.","error");return;}
    await addAdminRow("countries",{
      name,
      code:$("#countryCode").value.trim().toUpperCase()||null,
      flag:$("#countryFlag").value.trim()||"🏳️",
      continent
    });
    $("#countryName").value="";$("#countryCode").value="";$("#countryFlag").value="";$("#countryContinent").value="";
  };
  $("#clubForm").onsubmit=async e=>{
    e.preventDefault();
    const name=$("#clubName").value.trim(),competitionId=Number($("#clubCompetition").value);
    const comp=adminCompetitions.find(x=>Number(x.id)===competitionId);
    if(!competitionId||!comp){adminMessage("Selecione a competição do clube.","error");return;}
    const {data:club,error}=await supabaseClient.from("clubs").insert({
      name,short_name:$("#clubShortName").value.trim()||null,country_id:comp.country_id,
      strength:Number($("#clubStrength").value)||50,reputation:Number($("#clubStrength").value)||50,budget:Number($("#clubBudget").value)||0
    }).select("id").single();
    if(error){adminMessage("Não foi possível salvar o clube: "+error.message,"error");return;}
    const {error:linkError}=await supabaseClient.from("competition_clubs").insert({club_id:club.id,competition_id:competitionId});
    if(linkError){
      await supabaseClient.from("clubs").delete().eq("id",club.id);
      adminMessage("Não foi possível vincular o clube à competição: "+linkError.message,"error");
      return;
    }
    adminMessage("Clube adicionado à competição.");
    $("#clubName").value="";$("#clubShortName").value="";
    await refreshAdmin();
  };
  const syncCompetitionTypeFields=()=>{
    const type=$("#countryCompetitionType").value;
    $("#countryCompetitionLegs").classList.toggle("hidden",type!=="league");
    $("#countryCompetitionCupMode").classList.toggle("hidden",type!=="cup");
  };
  $("#countryCompetitionType").onchange=syncCompetitionTypeFields;
  syncCompetitionTypeFields();

  $("#countryCompetitionForm").onsubmit=async e=>{
    e.preventDefault();
    if(!currentAdminCountryId)return;
    const name=$("#countryCompetitionName").value.trim();
    const division=Number($("#countryCompetitionDivision").value)||1;
    const competition_type=$("#countryCompetitionType").value;
    const team_count=Number($("#countryCompetitionTeams").value)||2;
    const round_robin_legs=competition_type==="league"?$("#countryCompetitionLegs").value:null;
    const cup_mode=competition_type==="cup"?$("#countryCompetitionCupMode").value:null;
    if(!name)return;
    const editingId=e.currentTarget.dataset.editingId;
    const payload={name,country_id:currentAdminCountryId,division,competition_type,team_count,round_robin_legs,cup_mode};
    const {error}=editingId
      ? await supabaseClient.from("competitions").update(payload).eq("id",editingId)
      : await supabaseClient.from("competitions").insert(payload);
    if(error){adminMessage("Não foi possível salvar a competição: "+error.message,"error");return;}
    $("#countryCompetitionName").value="";
    $("#countryCompetitionDivision").value="1";
    $("#countryCompetitionTeams").value=competition_type==="league"?"20":"32";
    e.currentTarget.dataset.editingId="";
    e.currentTarget.querySelector("button").textContent="Adicionar competição";
    await refreshCountryCompetitions();
    await refreshAdmin();
    adminMessage("Competição adicionada ao país.");
  };
  $("#addAllCompetitionTeams").onclick=addAllCompetitionTeams;

  $("#openRosterImporter").onclick=openRosterImporter;
  $("#rosterImportCompetition").onchange=async e=>loadRosterImportClubs(e.target.value);
  $("#backAdminFromRosterImporter").onclick=async()=>{show("admin");$("#pageTitle").textContent="Meus campeonatos";await refreshAdmin();};
  $("#loadRosterCsvBtn").onclick=readRosterCsv;
  $("#downloadRosterCsvTemplate").onclick=downloadRosterCsvTemplate;
  $("#clearRosterCsvBtn").onclick=clearRosterCsv;
  $("#saveImportedRoster").onclick=saveImportedRoster;
  $("#rosterImportForm").onsubmit=e=>e.preventDefault();

  $("#competitionTeamForm").onsubmit=async e=>{
    e.preventDefault();
    if(!currentAdminCompetitionId)return;
    const clubId=Number($("#competitionTeamClub").value);
    if(!clubId)return;
    const {data:comp,error:compError}=await supabaseClient.from("competitions").select("team_count,country_id").eq("id",currentAdminCompetitionId).single();
    if(compError){adminMessage("Não foi possível verificar a competição: "+compError.message,"error");return;}
    const {count,error:countError}=await supabaseClient.from("competition_clubs").select("*",{count:"exact",head:true}).eq("competition_id",currentAdminCompetitionId);
    if(countError){adminMessage("Não foi possível verificar os times: "+countError.message,"error");return;}
    if((count||0)>=Number(comp.team_count||0)){adminMessage("A competição já atingiu o número máximo de times.","error");return;}
    const {error}=await supabaseClient.from("competition_clubs").insert({competition_id:currentAdminCompetitionId,club_id:clubId});
    if(error){adminMessage("Não foi possível adicionar o time: "+error.message,"error");return;}
    await refreshCompetitionTeams();
    await refreshAdmin();
    adminMessage("Time adicionado à competição.");
  };
  $("#backCountryFromCompetition").onclick=async()=>{
    show("countryAdmin");
    $("#pageTitle").textContent=$("#countryAdminName").textContent.replace(/^\S+\s/,"");
    await refreshCountryCompetitions();
  };
  $("#backCountries").onclick=async()=>{
    show("admin");
    $("#pageTitle").textContent="Meus campeonatos";
    await refreshAdmin();
  };
  $("#addPlayerRow").onclick=()=>addSquadRow();
  $("#saveSquad").onclick=saveSquad;
  $("#backAdmin").onclick=async()=>{show("admin");$("#pageTitle").textContent="Meus campeonatos";await refreshAdmin();};
}



document.addEventListener("click",e=>{
  const b=e.target.closest("[data-open-country]");
  if(b){e.preventDefault();openAdminCountry(Number(b.dataset.openCountry));}
});

window.addEventListener("error",e=>{
  console.error(e.error||e.message);
  const el=$("#rosterImportMessage");
  if(el&&document.querySelector("#rosterImporterView:not(.hidden)")){
    el.textContent="Erro JavaScript: "+(e.message||"erro desconhecido");
    el.className="admin-message error";
    el.classList.remove("hidden");
  }
});
window.addEventListener("unhandledrejection",e=>{
  console.error(e.reason);
  const el=$("#rosterImportMessage");
  if(el&&document.querySelector("#rosterImporterView:not(.hidden)")){
    el.textContent="Erro JavaScript: "+(e.reason?.message||String(e.reason||"promessa rejeitada"));
    el.className="admin-message error";
    el.classList.remove("hidden");
  }
});

document.addEventListener("DOMContentLoaded",async()=>{
  showAuthMode("login");

  $("#authSwitch").onclick=()=>showAuthMode($("#loginForm").classList.contains("hidden")?"login":"signup");

  $("#loginForm").onsubmit=async e=>{
    e.preventDefault();
    await login($("#loginEmail").value.trim(),$("#loginPassword").value);
  };

  $("#signupForm").onsubmit=async e=>{
    e.preventDefault();
    const email=$("#signupEmail").value.trim();
    const password=$("#signupPassword").value;
    const password2=$("#signupPassword2").value;
    if(password!==password2){setAuthMessage("As senhas não são iguais.","error");return;}
    if(password.length<6){setAuthMessage("A senha precisa ter pelo menos 6 caracteres.","error");return;}
    await signup(email,password);
  };

  $("#logoutBtn").onclick=async()=>{await supabaseClient.auth.signOut();currentId=null;showAuthMode("login");showAuth();};
  try{
    setupAdminForms();
  }catch(error){
    console.error("Erro ao configurar o painel administrativo:",error);
    const el=$("#rosterImportMessage");
    if(el){
      el.textContent="Erro JavaScript ao configurar o painel: "+(error?.message||String(error));
      el.className="admin-message error";
      el.classList.remove("hidden");
    }
  }

  supabaseClient.auth.onAuthStateChange((event,session)=>{
    if(session) showApp(session.user);
    else if(event==="SIGNED_OUT") showAuth();
  });

  const {data:{session}}=await supabaseClient.auth.getSession();
  if(session) showApp(session.user);
  else showAuth();

  document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{show(b.dataset.view);if(b.dataset.view==="home"){$("#pageTitle").textContent="Meus campeonatos";home()}});
  $("#headerCreate").onclick=()=>show("create");
  $("#emptyCreate").onclick=()=>show("create");
  $("#cancelCreate").onclick=()=>{show("home");home()};
  $("#saveChampionship").onclick=()=>{let n=$("#name").value.trim();if(!n)return alert("Informe o nome.");let c={id:Date.now().toString(),name:n,division:$("#division").value.trim(),format:$("#format").value,teams:[],matches:[]};db.championships.push(c);save();$("#name").value="";$("#division").value="";openChamp(c.id)};
  $("#backHome").onclick=()=>{show("home");$("#pageTitle").textContent="Meus campeonatos";home()};
  $("#deleteChamp").onclick=()=>{if(confirm("Excluir este campeonato?")){db.championships=db.championships.filter(c=>c.id!==currentId);save();show("home");home();$("#pageTitle").textContent="Meus campeonatos"}};
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
  $("#goMatches").onclick=()=>tab("matches");
  $("#addTeam").onclick=addTeam;
  $("#teamName").addEventListener("keydown",e=>{if(e.key==="Enter")addTeam()});
  $("#generate").onclick=generate;
  $("#saveResults").onclick=saveResults;
  home();
});
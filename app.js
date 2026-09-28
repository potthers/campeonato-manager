const SUPABASE_URL="https://kilbtohoqdmesnqozqqv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_jonA24CsFKjANOtOoM-s0g_NK_TNb4d";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

const KEY="championship_manager_v1";
let db;
try{db=JSON.parse(localStorage.getItem(KEY)||"{\"championships\":[]}");if(!db||!Array.isArray(db.championships))throw new Error("dados");}
catch(e){db={championships:[]};localStorage.removeItem(KEY)}
let currentId=null;

const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const cur=()=>db.championships.find(c=>c.id===currentId);

function show(v){document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));$("#"+v+"View").classList.remove("hidden");}
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
  const [countries,competitions,clubs,players]=await Promise.all([
    supabaseClient.from("countries").select("*").order("name"),
    supabaseClient.from("competitions").select("*, countries(name)").order("name"),
    supabaseClient.from("clubs").select("*, countries(name)").order("name"),
    supabaseClient.from("players").select("*, countries!players_nationality_country_id_fkey(name)").order("name")
  ]);
  if(countries.error||competitions.error||clubs.error||players.error){
    adminMessage("Não foi possível carregar os dados administrativos.","error");
    return;
  }
  const cs=countries.data||[];
  const comps=competitions.data||[];
  const cls=clubs.data||[];
  const ps=players.data||[];
  $("#countriesList").innerHTML=cs.length?cs.map(x=>'<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">'+esc(x.name)+'</div><div class="admin-item-meta">'+esc(x.code||"Sem código")+'</div></div><button class="admin-delete" data-delete-country="'+x.id+'">Excluir</button></div>').join(""):'<div class="empty-small">Nenhum país cadastrado.</div>';
  $("#competitionsList").innerHTML=comps.length?comps.map(x=>'<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">'+esc(x.name)+'</div><div class="admin-item-meta">'+esc(x.countries?.name||"Sem país")+' · Divisão '+x.division+'</div></div><button class="admin-delete" data-delete-competition="'+x.id+'">Excluir</button></div>').join(""):'<div class="empty-small">Nenhuma competição cadastrada.</div>';
  $("#clubsList").innerHTML=cls.length?cls.map(x=>'<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">'+esc(x.name)+'</div><div class="admin-item-meta">'+esc(x.countries?.name||"Sem país")+' · Força '+x.strength+'</div></div><button class="admin-delete" data-delete-club="'+x.id+'">Excluir</button></div>').join(""):'<div class="empty-small">Nenhum clube cadastrado.</div>';
  $("#playersList").innerHTML=ps.length?ps.map(x=>'<div class="admin-item"><div class="admin-item-main"><div class="admin-item-name">'+esc(x.name)+'</div><div class="admin-item-meta">'+esc(x.position)+' · OVR '+x.overall+' · POT '+x.potential+'</div></div><button class="admin-delete" data-delete-player="'+x.id+'">Excluir</button></div>').join(""):'<div class="empty-small">Nenhum jogador cadastrado.</div>';
  $("#competitionCountry").innerHTML=optionRows(cs,"País");
  $("#clubCountry").innerHTML=optionRows(cs,"País");
  $("#playerNationality").innerHTML=optionRows(cs,"Nacionalidade");
  document.querySelectorAll("[data-delete-country]").forEach(b=>b.onclick=()=>deleteAdmin("countries",b.dataset.deleteCountry));
  document.querySelectorAll("[data-delete-competition]").forEach(b=>b.onclick=()=>deleteAdmin("competitions",b.dataset.deleteCompetition));
  document.querySelectorAll("[data-delete-club]").forEach(b=>b.onclick=()=>deleteAdmin("clubs",b.dataset.deleteClub));
  document.querySelectorAll("[data-delete-player]").forEach(b=>b.onclick=()=>deleteAdmin("players",b.dataset.deletePlayer));
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
    await addAdminRow("countries",{name:$("#countryName").value.trim(),code:$("#countryCode").value.trim().toUpperCase()||null});
    $("#countryName").value="";$("#countryCode").value="";
  };
  $("#competitionForm").onsubmit=async e=>{
    e.preventDefault();
    const name=$("#competitionName").value.trim(),country=$("#competitionCountry").value;
    if(!country){adminMessage("Selecione o país da competição.","error");return;}
    const ok=await addAdminRow("competitions",{name,country_id:Number(country),division:Number($("#competitionDivision").value)||1});
    if(ok)$("#competitionName").value="";
  };
  $("#clubForm").onsubmit=async e=>{
    e.preventDefault();
    const name=$("#clubName").value.trim(),country=$("#clubCountry").value;
    if(!country){adminMessage("Selecione o país do clube.","error");return;}
    const ok=await addAdminRow("clubs",{name,short_name:$("#clubShortName").value.trim()||null,country_id:Number(country),strength:Number($("#clubStrength").value)||50,reputation:Number($("#clubStrength").value)||50,budget:Number($("#clubBudget").value)||0});
    if(ok){$("#clubName").value="";$("#clubShortName").value="";}
  };
  $("#playerForm").onsubmit=async e=>{
    e.preventDefault();
    const name=$("#playerName").value.trim(),nationality=$("#playerNationality").value;
    const ok=await addAdminRow("players",{name,nationality_country_id:nationality?Number(nationality):null,position:$("#playerPosition").value,overall:Number($("#playerOverall").value)||50,potential:Number($("#playerPotential").value)||50});
    if(ok)$("#playerName").value="";
  };
}


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
  setupAdminForms();

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
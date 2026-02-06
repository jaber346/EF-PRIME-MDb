function qs(sel){return document.querySelector(sel)}

function showToast(msg, isErr=false){
  const t = qs('#toast');
  if(!t){ alert(msg); return; }
  t.textContent = msg;
  t.classList.add('show');
  t.classList.toggle('err', !!isErr);
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

async function safeJson(res){
  try { return await res.json(); } catch { return null; }
}

async function fetchHealth(){
  const badge = qs('#healthBadge');
  if(!badge) return;
  badge.textContent = 'Checking...';
  try{
    const res = await fetch('/api/health');
    const data = await safeJson(res);
    if(!res.ok) throw new Error(data?.error || 'Health error');
    badge.textContent = `OK • sessions: ${data.sessions_active}`;
  }catch(e){
    badge.textContent = 'Offline';
  }
}

async function requestCode(){
  const input = qs('#phone');
  const out = qs('#codeOut');
  const btn = qs('#btnPair');
  const num = (input?.value || '').trim();
  if(!num){
    showToast('Entre ton numéro (ex: +226xxxxxxxx)', true);
    return;
  }
  btn && (btn.disabled = true);
  out && (out.value = '');
  try{
    const url = `/api/pair?number=${encodeURIComponent(num)}`;
    const res = await fetch(url);
    const data = await safeJson(res);
    if(!res.ok || !data?.ok){
      throw new Error(data?.error || 'Erreur pairing');
    }
    if(!data.code){
      showToast('Déjà enregistré (pas de code).', false);
      return;
    }
    out && (out.value = data.code);
    showToast('Code généré ✅');
  }catch(e){
    showToast(e.message || 'Erreur', true);
  }finally{
    btn && (btn.disabled = false);
    fetchHealth();
  }
}

async function copyCode(){
  const out = qs('#codeOut');
  const val = out?.value || '';
  if(!val){
    showToast('Aucun code à copier', true);
    return;
  }
  try{
    await navigator.clipboard.writeText(val);
    showToast('Copié ✅');
  }catch{
    out.select();
    document.execCommand('copy');
    showToast('Copié ✅');
  }
}

async function refreshDashboard(){
  const tableBody = qs('#sessionsBody');
  const count = qs('#sessionsCount');
  if(!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="3">Chargement...</td></tr>';
  try{
    const res = await fetch('/api/status');
    const data = await safeJson(res);
    if(!res.ok || !data?.ok) throw new Error('Status error');
    const rows = (data.sessions || []).map((s, i)=>{
      const since = s.since ? new Date(s.since).toLocaleString() : '-';
      return `<tr><td>${i+1}</td><td>${s.number}</td><td>${since}</td></tr>`;
    }).join('');
    tableBody.innerHTML = rows || '<tr><td colspan="3">Aucune session</td></tr>';
    if(count) count.textContent = String(data.sessions_active ?? 0);
  }catch(e){
    tableBody.innerHTML = '<tr><td colspan="3">Erreur</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  fetchHealth();
  const btnPair = qs('#btnPair');
  btnPair && btnPair.addEventListener('click', requestCode);

  const btnCopy = qs('#btnCopy');
  btnCopy && btnCopy.addEventListener('click', copyCode);

  const btnRefresh = qs('#btnRefresh');
  btnRefresh && btnRefresh.addEventListener('click', refreshDashboard);

  if(qs('#sessionsBody')) refreshDashboard();
});

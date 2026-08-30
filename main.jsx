import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const AREAS=["AkdeMIS","Akademik","Erasmus","Kampüs Kafası","Yurt","Kariyer","İçerik","KPSS","Kişisel"];
const PRIORITIES=["S","A","B","C"];
const STATUSES=["Başlamadı","Devam ediyor","Bekliyor","Tamamlandı","Ertelendi"];
const LS="elif-life-os-v1";

const iso=d=>new Date(d).toISOString().slice(0,10);
const today=iso(new Date());
const uid=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());

const initialEvents=[
 {id:uid(),date:"2026-09-07",time:"09:00",title:"Kurulum dönemi başlangıcı",area:"Kişisel",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Ana yaşam sistemini aktif kullanmaya başla."},
 {id:uid(),date:"2026-09-26",time:"10:00",title:"Antalya il/ilçe gezisi",area:"Kişisel",priority:"B",status:"Başlamadı",owner:"Elif",notes:"İçerik fırsatı: vlog + Reels + story."},
 {id:uid(),date:"2026-10-01",time:"10:00",title:"İspanya’dan gelen öğrencilerle içerik / ziyaret",area:"Erasmus",priority:"A",status:"Başlamadı",owner:"Elif",notes:"Mümkünse Erasmus ve öğrenci hayatı içeriği üret."},
 {id:uid(),date:"2026-10-13",time:"00:00",title:"Portekiz Erasmus programı",area:"Erasmus",priority:"S",status:"Başlamadı",owner:"Elif",notes:"13–22 Ekim. Seyahat + sosyal medya görevi."},
 {id:uid(),date:"2026-10-24",time:"00:00",title:"Portekiz dönüşü",area:"Erasmus",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Gece dönüş; ertesi gün KPSS."},
 {id:uid(),date:"2026-10-25",time:"09:00",title:"Ortaöğretim KPSS",area:"KPSS",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Başka büyük görev planlama."},
 {id:uid(),date:"2026-10-30",time:"20:00",title:"Halloween etkinliği — olasılık",area:"Kişisel",priority:"C",status:"Başlamadı",owner:"Elif",notes:"Kampüs Kafası ile; bütçeye göre."},
 {id:uid(),date:"2026-11-04",time:"18:00",title:"AkdeMIS Doğum Günü",area:"AkdeMIS",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Profesyonel + samimi. UBF konferans salonu düşünülebilir."},
 {id:uid(),date:"2027-03-08",time:"18:00",title:"İş Dünyasında Kadınlar — hedef",area:"AkdeMIS",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Mümkünse 8 Mart’tan önce; değilse sonraki hafta."},
 {id:uid(),date:"2027-04-08",time:"09:00",title:"TeknoYön 4 — hedef tarih",area:"AkdeMIS",priority:"S",status:"Başlamadı",owner:"Elif",notes:"Nisan 2. hafta hedefi; gerçek tarih kesinleşince değiştir."}
];

function load(){
 try{return JSON.parse(localStorage.getItem(LS))||{events:initialEvents,tasks:[]}}
 catch{return {events:initialEvents,tasks:[]}}
}
function App(){
 const [data,setData]=useState(load);
 const [tab,setTab]=useState("Bugün");
 const [selectedDate,setSelectedDate]=useState(today);
 const [modal,setModal]=useState(null);
 const [search,setSearch]=useState("");
 const [now,setNow]=useState(new Date());
 useEffect(()=>localStorage.setItem(LS,JSON.stringify(data)),[data]);
 useEffect(()=>{const t=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(t)},[]);
 const all=useMemo(()=>[...data.events,...data.tasks], [data]);
 const visible=all.filter(x=>(x.title||x.task||"").toLowerCase().includes(search.toLowerCase()));
 const upsert=(item,type)=>{
   setData(d=>({...d,[type]:d[type].some(x=>x.id===item.id)?d[type].map(x=>x.id===item.id?item:x):[...d[type],item]}));
   setModal(null);
 };
 const toggle=(item,type)=>upsert({...item,status:item.status==="Tamamlandı"?"Başlamadı":"Tamamlandı"},type);
 const remove=(item,type)=>setData(d=>({...d,[type]:d[type].filter(x=>x.id!==item.id)}));
 const dateItems=visible.filter(x=>x.date===selectedDate).sort((a,b)=>(a.time||"99").localeCompare(b.time||"99"));
 const upcoming=visible.filter(x=>x.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,8);
 const completed=all.filter(x=>x.status==="Tamamlandı").length;
 const delayed=all.filter(x=>x.status!=="Tamamlandı" && x.date<today).length;
 const addTask=()=>setModal({kind:"task",item:{id:uid(),date:selectedDate,time:"18:00",title:"",area:"Kişisel",priority:"B",status:"Başlamadı",owner:"Elif",notes:""}});
 return <div className="app">
  <aside className="side">
   <div className="brand">ELİF<br/><span>LIFE OS</span></div>
   <div className="clock">{now.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}<small>{now.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})}</small></div>
   {["Bugün","Takvim","Dashboard"].map(x=><button className={tab===x?"nav active":"nav"} onClick={()=>setTab(x)} key={x}>{x}</button>)}
   <div className="label">YAŞAM ALANLARI</div>
   {AREAS.map(x=><button className={tab===x?"nav active":"nav"} onClick={()=>setTab(x)} key={x}>{x}</button>)}
   <div className="sideBottom">v1 • yerel veri<br/>Veriler bu cihazda saklanır.</div>
  </aside>
  <main>
   <header><div><h1>{tab}</h1><p>{tab==="Bugün"?"Önce bugün. Sonra geri kalan hayat.": "Elif’in yaşayan dönem sistemi"}</p></div><div className="actions"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ara..."/><button onClick={addTask}>＋ Yeni görev</button></div></header>
   {tab==="Bugün"&&<Today now={now} items={all.filter(x=>x.date===today).sort((a,b)=>(a.time||"").localeCompare(b.time||""))} onToggle={toggle} onEdit={(i,t)=>setModal({kind:t,item:i})} onDelete={remove} onAdd={addTask} upcoming={upcoming}/>}
   {tab==="Takvim"&&<Calendar date={selectedDate} setDate={setSelectedDate} items={visible} onToggle={toggle} onEdit={(i,t)=>setModal({kind:t,item:i})} onDelete={remove} onAdd={addTask}/>}
   {tab==="Dashboard"&&<Dashboard all={all} completed={completed} delayed={delayed}/>}
   {AREAS.includes(tab)&&<Area name={tab} items={visible.filter(x=>x.area===tab)} onToggle={toggle} onEdit={(i,t)=>setModal({kind:t,item:i})} onDelete={remove} onAdd={addTask}/>}
  </main>
  {modal&&<Editor modal={modal} close={()=>setModal(null)} save={upsert}/>}
 </div>
}

function Today({items,onToggle,onEdit,onDelete,onAdd,upcoming}){
 return <section>
  <div className="hero"><div><span className="eyebrow">BUGÜNÜN ODAĞI</span><h2>{items.length?`${items.length} iş planlandı`:"Bugün için kayıt yok"}</h2><p>Gereksiz yük yok. Önce gerçekten yapılması gerekenler.</p></div><button onClick={onAdd}>＋ Bugüne ekle</button></div>
  <h3>Bugünün akışı</h3><div className="list">{items.map(i=><Card key={i.id} i={i} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>)}</div>
  <h3>Yaklaşanlar</h3><div className="grid">{upcoming.map(i=><Card compact key={i.id} i={i} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>)}</div>
 </section>
}
function Card({i,onToggle,onEdit,onDelete,compact}){
 const done=i.status==="Tamamlandı";
 return <article className={"card "+(done?"done":"")}>
  <div className="check" onClick={()=>onToggle(i,i.task!==undefined?"tasks":"events")}>{done?"✓":""}</div>
  <div className="cardmain"><div className="meta">{i.date} {i.time&&`• ${i.time}`} <b>{i.area}</b><b className={"p p"+i.priority}>{i.priority}</b></div><h4>{i.title||i.task}</h4>{!compact&&i.notes&&<p>{i.notes}</p>}</div>
  <div className="more"><button onClick={()=>onEdit(i,i.task!==undefined?"tasks":"events")}>Düzenle</button><button onClick={()=>onDelete(i,i.task!==undefined?"tasks":"events")}>Sil</button></div>
 </article>
}
function Calendar({date,setDate,items,onToggle,onEdit,onDelete,onAdd}){
 const d=new Date(date+"T12:00:00"); const days=[];
 for(let n=-3;n<=3;n++){let x=new Date(d);x.setDate(d.getDate()+n);days.push(iso(x))}
 return <section><div className="week">{days.map(x=><button className={x===date?"day sel":"day"} onClick={()=>setDate(x)} key={x}><small>{new Date(x+"T12:00:00").toLocaleDateString("tr-TR",{weekday:"short"})}</small><strong>{x.slice(8)}</strong></button>)}</div>
 <div className="calendarHead"><h2>{date}</h2><button onClick={onAdd}>＋ Bu güne ekle</button></div>
 <div className="list">{items.filter(x=>x.date===date).sort((a,b)=>(a.time||"").localeCompare(b.time||"")).map(i=><Card key={i.id} i={i} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>)}</div></section>
}
function Area({name,items,onToggle,onEdit,onDelete,onAdd}){
 return <section><div className="areaHero"><span className="eyebrow">YAŞAM ALANI</span><h2>{name}</h2><p>{areaDesc[name]||"Bu alanın görevleri ve planları."}</p><button onClick={onAdd}>＋ Görev ekle</button></div><div className="list">{items.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(i=><Card key={i.id} i={i} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>)}</div></section>
}
const areaDesc={"AkdeMIS":"Başkanlık, etkinlik, ekip, hoca ilişkileri, SKS, sponsorluk ve kulüp çıktıları.","Akademik":"Ders programı, sınavlar, ödevler ve somut çalışma görevleri.","Erasmus":"Erasmus Antalya, LARA ve uluslararası öğrenci operasyonları.","Kampüs Kafası":"Başkan yardımcılığı, ekip bağı, geziler ve sosyal etkinlikler.","Yurt":"Temsilcilik, menü geri bildirimi, toplantılar ve İl Müdürlüğü ilişkisi.","Kariyer":"CV, LinkedIn, portföy, şirket araştırması, staj ve network.","İçerik":"YouTube, Instagram, TikTok ve doğal içerik fırsatları.","KPSS":"25 Ekim 2026’ya kadar ders bazlı tekrar, soru ve deneme sistemi.","Kişisel":"Sosyal hayat, dinlenme, Pilates, bakım, alışveriş, yurt ve kişisel düzen."};

function Dashboard({all,completed,delayed}){
 const counts=AREAS.map(a=>[a,all.filter(x=>x.area===a).length]);
 return <section><div className="stats"><Stat n={all.length} t="Toplam kayıt"/><Stat n={completed} t="Tamamlandı"/><Stat n={delayed} t="Geciken"/><Stat n={all.filter(x=>x.priority==="S").length} t="Stratejik"/></div><div className="panel"><h3>Yaşam alanları</h3>{counts.map(([a,n])=><div className="bar" key={a}><span>{a}</span><strong>{n}</strong></div>)}</div></section>
}
function Stat({n,t}){return <div className="stat"><strong>{n}</strong><span>{t}</span></div>}
function Editor({modal,close,save}){
 const [i,setI]=useState({...modal.item});
 const isTask=modal.kind==="tasks"||modal.kind==="task";
 const submit=e=>{e.preventDefault(); if(!i.title?.trim())return; save(i,isTask?"tasks":"events")};
 return <div className="overlay"><form className="modal" onSubmit={submit}><div className="modalhead"><h2>{modal.kind==="task"?"Yeni görev":"Düzenle"}</h2><button type="button" onClick={close}>×</button></div>
 <label>Görev / etkinlik<input value={i.title||""} onChange={e=>setI({...i,title:e.target.value})} autoFocus/></label>
 <div className="two"><label>Tarih<input type="date" value={i.date} onChange={e=>setI({...i,date:e.target.value})}/></label><label>Saat<input type="time" value={i.time||""} onChange={e=>setI({...i,time:e.target.value})}/></label></div>
 <div className="two"><label>Alan<select value={i.area} onChange={e=>setI({...i,area:e.target.value})}>{AREAS.map(a=><option key={a}>{a}</option>)}</select></label><label>Öncelik<select value={i.priority} onChange={e=>setI({...i,priority:e.target.value})}>{PRIORITIES.map(a=><option key={a}>{a}</option>)}</select></label></div>
 <div className="two"><label>Durum<select value={i.status} onChange={e=>setI({...i,status:e.target.value})}>{STATUSES.map(a=><option key={a}>{a}</option>)}</select></label><label>Sorumlu<input value={i.owner||""} onChange={e=>setI({...i,owner:e.target.value})}/></label></div>
 <label>Not<input value={i.notes||""} onChange={e=>setI({...i,notes:e.target.value})}/></label>
 <div className="modalactions"><button type="button" onClick={close}>Vazgeç</button><button className="primary">Kaydet</button></div>
 </form></div>
}
createRoot(document.getElementById("root")).render(<App/>);

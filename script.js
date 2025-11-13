const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const aiInfo = document.getElementById('aiInfo');

function appendMsg(text, cls='assistant'){
  const d = document.createElement('div'); d.className='chatMessage '+cls; d.textContent=text; chatBox.appendChild(d); chatBox.scrollTop=chatBox.scrollHeight;
}

chatForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const prompt = chatInput.value.trim(); if(!prompt) return;
  appendMsg('Anda: '+prompt,'user');
  appendMsg('Menunggu jawaban...','assistant');
  chatInput.value='';
  try{
    const res = await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const j = await res.json();
    // remove last assistant placeholder
    const kws = Array.from(chatBox.querySelectorAll('.assistant'));
    if(kws.length) kws[kws.length-1].remove();
    appendMsg('AI: '+(j.response||j.error||'Tidak ada balasan.'),'assistant');
    if(j.model) aiInfo.textContent = 'Menggunakan model: '+j.model;
  }catch(err){
    console.error(err);
    appendMsg('AI: Gagal menghubungi server.','assistant');
  }
});

// MUSIC lists (search queries)
const music = {
  indo:["Raisa Kali Kedua","Tulus Monokrom","Isyana Tetap Dalam Jiwa","Sheila On 7 Dan","NOAH Separuh Aku","Agnes Monica Matahariku","Dewa 19 Kangen","Glenn Fredly Januari","Mahalini Sisa Rasa","Rizky Febian Kesempurnaan Cinta"],
  west:["Ed Sheeran Shape of You","Adele Hello","Coldplay Viva La Vida","Maroon 5 Sugar","The Weeknd Blinding Lights","Bruno Mars Uptown Funk","Imagine Dragons Believer","Taylor Swift Shake It Off","Queen Bohemian Rhapsody","Bruno Mars Just The Way You Are"],
  hiphop:["Eminem Lose Yourself","Drake Hotline Bling","Kendrick Lamar HUMBLE","Jay-Z Empire State of Mind","Kanye West Stronger","Lil Nas X Old Town Road","Snoop Dogg Drop It Like It's Hot","Travis Scott Sicko Mode","Cardi B Bodak Yellow","Nicki Minaj Super Bass"],
  dangdut:["Rhoma Irama Begadang","Mansyur S 702","Inul Bojo Galak","Via Vallen Sayang","Nella Kharisma Jaran Goyang","Syahrini Sesuatu","Lesti Kulepas Dengan Ikhlas","Elvy Sukaesih Selamat Malam","Iis Dahlia Payung Merah","Cita Citata Goyang Dumang"]
};

function pick(cat){
  const list = cat==='all' ? [...music.indo,...music.west,...music.hiphop,...music.dangdut] : music[cat] || music.indo;
  return list[Math.floor(Math.random()*list.length)];
}

function playRandom(){
  const cat = document.getElementById('genre').value;
  const q = pick(cat);
  const src = 'https://www.youtube.com/embed?listType=search&list='+encodeURIComponent(q)+'&autoplay=1';
  document.getElementById('playerWrap').innerHTML = `<iframe width="100%" height="100%" src="${src}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  document.getElementById('now').textContent = 'Memutar: '+q;
}

document.getElementById('playBtn').addEventListener('click', playRandom);
window.addEventListener('load', playRandom);

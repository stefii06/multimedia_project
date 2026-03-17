console.log("Editorul foto a pornit.");

// I. REFERINȚE DOM ȘI VARIABILE GLOBALE


const canvas = document.getElementById('CANVAS');
const context = canvas.getContext('2d', { willReadFrequently: true });  


const salvareBtn = document.getElementById('save_btn');
const stergereSelectieBtn = document.getElementById('delete_btn');
const cropBtn = document.getElementById('crop_btn');
const efectBtn = document.getElementById('grayscale_btn');




const imagineIncarcare = document.getElementById('image_loading');

const histogramaCanva = document.getElementById('histogram-canvas');
const histogramaCtx = histogramaCanva.getContext('2d', { willReadFrequently: true });

let imagineIncarcata = null; 

let imagineOriginala = null;


let selectie = { x: 0, y: 0, width: 0, height: 0 };
let desenareInCurs = false;
let origX, origY;
let mutareChenar = false; 
let decalareSelectie = { x: 0, y: 0 };


let listaText = []; 
let indexCurent = null;
let mutareText = false;

let punctApucareText = { x: 0, y: 0 };

const btnAdauga = document.getElementById('add_text_btn');
const btnModalSalvare = document.getElementById('modal-save-btn');
const btnModalStergere = document.getElementById('modal-cancel-btn');

const modalOverlay = document.getElementById('text-modal-overlay');
const scalareBtn = document.getElementById('scale_btn');

const resetareBtn = document.getElementById('reset_btn');

// II. FUNCȚII

//histograma
function updateHistogram() {

    // resetam canvasul histogramei
    histogramaCtx.clearRect(0, 0, histogramaCanva.width, histogramaCanva.height);

    if (!imagineIncarcata || selectie.width <= 0) return;

    // luam datele pxelilor din selectie
    const pixeliSelectie = context.getImageData(selectie.x, selectie.y, selectie.width, selectie.height).data;

    const frecventaIntensitate = new Array(256).fill(0);

    // calculam intensitatea fiecarui pixel
    for (let i = 0; i < pixeliSelectie.length; i += 4) {

        const nivelGri = Math.round((pixeliSelectie[i] + pixeliSelectie[i + 1] + pixeliSelectie[i + 2]) / 3); // formula pentru a transforma culoarea (RGB) in intensitate (Gri)
      
        frecventaIntensitate[nivelGri]++;
    }

    // desenam grafiicul
    const maxVal = Math.max(...frecventaIntensitate); 
    histogramaCtx.strokeStyle = '#28a745'; 
     histogramaCtx.lineWidth = 1;

    histogramaCtx.beginPath();

    for (let i = 0; i < 256; i++) {
        const height = (frecventaIntensitate[i] / maxVal) * histogramaCanva.height; // formula de scalare pentru ca graficul sa nu iasa din ecran
       
 histogramaCtx.moveTo(i, histogramaCanva.height);
         histogramaCtx.lineTo(i, histogramaCanva.height - height);
    }

 histogramaCtx.stroke();
}



function refreshCanvas() {

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (imagineIncarcata) {
        context.drawImage(imagineIncarcata, 0, 0, canvas.width, canvas.height);
    
    } else {
         const centruX = canvas.width / 2;
        const centruY = canvas.height / 2;

 

  context.textAlign = 'center';

  context.textBaseline = 'middle';
   context.fillStyle = 'rgba(255, 255, 255, 0.5)';
       

        const iconImg = document.getElementById('icon_upload');
        if (iconImg && iconImg.complete) {
            context.drawImage(iconImg, centruX - 64, centruY - 104, 128, 128);
        }
        
        context.font = '20px Inter, sans-serif'; 
context.fillText("Trage si plaseazs imaginea aici", centruX, centruY + 40); 
context.font = '16px Inter, sans-serif'; 
context.fillText("sau foloseste butonul din stanga.", centruX, centruY + 70);
    }

    // Desenam textele
    listaText.forEach((t, i) => {
      
        context.fillStyle = t.color;
        context.textAlign = 'left';

        context.textBaseline = 'alphabetic';
     context.font = t.size + "px " + t.font;

        if (i === indexCurent) {
            context.strokeStyle = "#000000ff";
            context.lineWidth = 2;

            context.setLineDash([4, 4]);
          const marimeInaltime = context.measureText(t.content).width;
            context.strokeRect(t.x - 5, t.y - t.size, marimeInaltime + 10, t.size + 10);

            context.setLineDash([]);
        }

        context.fillText(t.content, t.x, t.y);
    });

    // desenam selectia
 if (selectie.width > 0 && selectie.height > 0 && imagineIncarcata) {

    context.strokeStyle = 'white';
    context.lineWidth = 2;

 context.setLineDash([5, 5]); 


    context.strokeRect(selectie.x, selectie.y, selectie.width, selectie.height);

    context.setLineDash([]); 
}
    updateHistogram();
}

// III. TEXT & MODAL


// deschidere modal (adaugare/editare)
btnAdauga.addEventListener('click', () => {
    const cancelBtn = document.getElementById('modal-cancel-btn');

    const salvareBtnModal = document.getElementById('modal-save-btn');
    
    //daca exista text, se deschide fereastra de editare text
    if (indexCurent !== null) 
        {
        const t = listaText[indexCurent]; //extrage textul selectatt din lista

        document.getElementById('modal-text-input').value = t.content;

        document.getElementById('modal-font-size').value = t.size;
        document.getElementById('modal-font-color').value = t.color;

  document.getElementById('modal-font-family').value = t.font;
        
        document.getElementById('modal-title').innerText = "Editare Text";

salvareBtnModal.innerText = "Salvează modificările";


cancelBtn.innerText = "Șterge Text";

   
cancelBtn.style.background = "#dc3545";
    } 

    // daca nu exista text, se deschide fereastra de adaugara text 
    else
         {
        document.getElementById('modal-text-input').value = "";
        document.getElementById('modal-title').innerText = "Adaugă Text";

        salvareBtnModal.innerText = "Adaugă pe imagine";
        cancelBtn.innerText = "Anulează";

        cancelBtn.style.background = "#555";
    }
    modalOverlay.style.display = 'flex'; //face fereastra vizibila, deoarece in css e ascunsa
});




// buton salvare
btnModalSalvare.addEventListener('click', () => {
    const content = document.getElementById('modal-text-input').value;
    if (!content) {
        alert("Te rog introdu un text!");
        return;
    }

    const data = {
        content: content,

        size: parseInt(document.getElementById('modal-font-size').value),

        color: document.getElementById('modal-font-color').value,

        font: document.getElementById('modal-font-family').value,

        
        // daca e text nou, il punem in centrul canvaslui
        x: indexCurent !== null ? listaText[indexCurent].x : canvas.width / 2 - 50,
        y: indexCurent !== null ? listaText[indexCurent].y : canvas.height / 2

        
    };

    if (indexCurent !== null) {
        listaText[indexCurent] = data;
    } else {
        listaText.push(data);
    }

    modalOverlay.style.display = 'none';//inchide fereastra
    indexCurent = null; // resetam selectiia dupa salvare
    refreshCanvas();
});

// buton stergere
btnModalStergere.addEventListener('click', () => {

    if (indexCurent !== null) {

        // daca scrie "Șterge Text", il eliminam
        listaText.splice(indexCurent, 1);
        indexCurent = null;
        btnAdauga.innerText = "Adaugă Text";
    }
    modalOverlay.style.display = 'none'; //inchide fereastra
    refreshCanvas();
});



// IV. EVENIMENTE MOUSE

canvas.addEventListener('mousedown', (e) => {

    if (!imagineIncarcata) return;

    //incadare imagine( de orice dimensiune) in canvas / decalare click
    const zonaCanvas = canvas.getBoundingClientRect();

    const scaleX = canvas.width / zonaCanvas.width;    
    const scaleY = canvas.height / zonaCanvas.height; 

    const mx = (e.clientX - zonaCanvas.left) * scaleX;
    const my = (e.clientY - zonaCanvas.top) * scaleY;
   

    // mutare selectie cu shift
    if (e.shiftKey && 
        //verifica ca mouse ul sa se afle in interiorul dreptunghiului de selectie,
        mx > selectie.x && mx < selectie.x + selectie.width &&
        my > selectie.y && my < selectie.y + selectie.height) 
        
        {
        
        mutareChenar = true; //spunem ca actiunea e de mutare

  decalareSelectie.x = mx - selectie.x;
        decalareSelectie.y = my - selectie.y;
        return; // oprim functia aici ca să nu selecteze text sau sa faca selectie noua
    }
    
    let foundText = false;

    // verificam daca am apasat pe un text
    for (let i = listaText.length - 1; i >= 0; i--) {
        const t = listaText[i];
        
         context.font = t.size + "px " + t.font;
        const marimeInaltime = context.measureText(t.content).width;

        if (mx > t.x && mx < t.x + marimeInaltime && my > t.y - t.size && my < t.y) {
            indexCurent = i;
            mutareText = true;
            punctApucareText.x = mx - t.x;
            punctApucareText.y = my - t.y;
            btnAdauga.innerText = "Editează Text";
            foundText = true;
            break; 
        }
    }

    // daca nu am apasat pe text, incepm selectia pentru histograma/crop
    if (!foundText) {
        indexCurent = null;
        btnAdauga.innerText = "Adaugă Text";
        desenareInCurs = true;
        origX = mx;
        origY = my;
        selectie = { x: origX, y: origY, width: 0, height: 0 };
    }

    refreshCanvas();
});



canvas.addEventListener('mousemove', (e) => {
  
     //incadare imagine( de orice dimensiune) in canvas / decalare click
    const zonaCanvas = canvas.getBoundingClientRect();
    const scaleX = canvas.width / zonaCanvas.width;
    const scaleY = canvas.height / zonaCanvas.height;

    const mx = (e.clientX - zonaCanvas.left) * scaleX;
    const my = (e.clientY - zonaCanvas.top) * scaleY;
  
    //actualizam pozitie dreptunghi selectie
    if (mutareChenar) {

 selectie.x = mx - decalareSelectie.x;
  selectie.y = my - decalareSelectie.y;
        refreshCanvas();

    } 
    //mutam textul
    else if (mutareText && indexCurent !== null) 
        {
        
   listaText[indexCurent].x = mx - punctApucareText.x;

        listaText[indexCurent].y = my - punctApucareText.y;
        refreshCanvas();
    } 
    //dsenam un dreptunghi nou de selectie

    else if (desenareInCurs) 
        {

        selectie.x = Math.min(mx, origX);
        selectie.y = Math.min(my, origY);

        selectie.width = Math.abs(mx - origX);
        selectie.height = Math.abs(my - origY);

        refreshCanvas();
    }
});

window.addEventListener('mouseup', () => {
    desenareInCurs = false;
    mutareText = false;
    mutareChenar = false;
});



// V. OPERAȚIUNI IMAGINE 

//efect alb-negru
efectBtn.addEventListener('click', () => {
    if (!imagineIncarcata || selectie.width <= 0) return;
    console.log("1. am inceput. Lățime selecție:", selectie.width);

    // capturam pixelii
    const imagineData = context.getImageData(selectie.x, selectie.y, selectie.width, selectie.height);
    const data = imagineData.data;
    for (let i = 0; i < data.length; i += 4) {

        const nivelGri = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];

        data[i] = data[i+1] = data[i+2] = nivelGri; //setam rosu, verde, albastry la aceeasi valoare(gri)
    }

    context.putImageData(imagineData, selectie.x, selectie.y);
    console.log("2. pixelii au fost schimbați pe ecran");
     selectie = { x: 0, y: 0, width: 0, height: 0 };
    const newImg = new Image();

 newImg.onload = () => {
    console.log("3. GATA! Imaginea gri a fost salvată în memorie.");
        imagineIncarcata = newImg;
       
       
        refreshCanvas();
    };
    newImg.src = canvas.toDataURL();
});


//efect crop
cropBtn.addEventListener('click', () => {
    if (!imagineIncarcata || selectie.width <= 5) return;

    const imagineTaiata = context.getImageData(selectie.x, selectie.y, selectie.width, selectie.height);

    canvas.width = selectie.width;
    canvas.height = selectie.height;

    //pune pixelii copiati anterior pe noul canvas mic
    context.putImageData(imagineTaiata, 0, 0);
    const newImg = new Image();

newImg.onload = () => {
        imagineIncarcata = newImg;
        selectie = { x: 0, y: 0, width: 0, height: 0 };
        refreshCanvas();
    };
    newImg.src = canvas.toDataURL();
});


//stergere selectie
stergereSelectieBtn.addEventListener('click', () => {
    if (!imagineIncarcata || selectie.width <= 0) return;

    context.fillStyle = "white";
    //pixelii din selectie devin albi
    context.fillRect(selectie.x, selectie.y, selectie.width, selectie.height);

    selectie = { x: 0, y: 0, width: 0, height: 0 };

    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {


        imagineIncarcata = newImg;
        refreshCanvas();
    };
});


//scalarea imaginii
scalareBtn.addEventListener('click', () => {
    if (!imagineIncarcata) {

        alert("Încarcă o imagine mai întâi!");
        return;
    }

    //intrebam utilizatorul ce dimensiune vrea sa schimbe
    const tip = prompt("Ce doresti sa modifici? Introdu 'l' pentru latime sau 'i' pentru înaltime:");
    
    if (!tip) return; // utilizatorul a apăsat Cancel



    let nouaLatime, nouaInaltime;
    const raport = imagineIncarcata.width / imagineIncarcata.height; // raportul original (W / H)

    // calculam proportiile
    if (tip.toLowerCase() === 'l') {
        const valoare = parseInt(prompt("Introdu noua latime (în pixeli):"));
        if (isNaN(valoare) || valoare <= 0) return;
        
        nouaLatime = valoare;
        nouaInaltime = valoare / raport; // formula pentru a păstra proporția
    } 
    else if (tip.toLowerCase() === 'i') {
        const valoare = parseInt(prompt("Introdu noua inalltime (in pixeli):"));
        //verifcam
        if (isNaN(valoare) || valoare <= 0) return;

        nouaInaltime = valoare;
        nouaLatime = valoare * raport; // formula pentru a pastra proportia
    } 
    else {
        alert("Optiune invalida! Introdu doar 'l' sau 'i'.");
        return;
    }

    // aplicam noile dimensiuni pe canvas
    canvas.width = nouaLatime;
    canvas.height = nouaInaltime;

    //desenam imaginea scalata
    context.drawImage(imagineIncarcata, 0, 0, nouaLatime, nouaInaltime);

    // salvam modficarea in imagineIncarcata (pentru a putea face si alte editari)
    const imgScalata = new Image();
    imgScalata.onload = () => {

        imagineIncarcata = imgScalata;
        refreshCanvas();
        console.log(`Imagine scalată la: ${Math.round(nouaLatime)}x${Math.round(nouaInaltime)}`);
    };
    imgScalata.src = canvas.toDataURL();
});

imagineIncarcare.addEventListener("change", function(e) {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width; 
            canvas.height = img.height;
            
            // cream o copie fiziica a imaginii originale
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;

            tempCanvas.height = img.height;

   tempCanvas.getContext('2d').drawImage(img, 0, 0);
            
            imagineOriginala = new Image();
            imagineOriginala.src = tempCanvas.toDataURL(); // salvam "amprenta" originală
            
            imagineIncarcata = img; 


            refreshCanvas();
        };
        img.src = reader.result;
    };
    
    reader.readAsDataURL(e.target.files[0]);
});




resetareBtn.addEventListener('click', () => {
    if (!imagineOriginala) {
        alert("Nu există nicio imagine de resetat!");
        return;
    }

    // resetam dimensiuniile canvasului la cele ale pozei originale
    canvas.width = imagineOriginala.width;

    canvas.height = imagineOriginala.height;
    
    // cream o instanta noua pentru imagineIncarcata bazata pe original
 const resetImg = new Image();


 resetImg.onload = () => {
       
        imagineIncarcata = resetImg;
     selectie = { x: 0, y: 0, width: 0, height: 0 }  ;
        listaText = []; //  sterge si textele
        refreshCanvas();

        alert("Imaginea a fost resetată la varianta originală!");
    };
    resetImg.src = imagineOriginala.src;
});

salvareBtn.addEventListener('click', () => {
    // verificaam daca exista o imagine incarcata
    if (!imagineIncarcata) {

        alert("Eroare: Nu puteți salva deoarece nu ați încărcat nicio imagine!");
        console.error("Tentativă de salvare eșuată: imagineIncarcata este null.");
        return; // Oprim execuția funcției aici
    }
  // daca există imagiine, procedam la descarcare
    const link = document.createElement('a');
    link.download = 'editor_rezultat.png';
 link.href = canvas.toDataURL();

    link.click();
    
    console.log("Imaginea a fost salvată cu succes.");
});



window.onload = () => {
    refreshCanvas(); 
};
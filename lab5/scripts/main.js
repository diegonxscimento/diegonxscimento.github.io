
function entra() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Eiii!👋";
  area.style.backgroundColor = "#f1fc8eff";
}

function sai() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Adeus! 👋";
  area.style.backgroundColor = "#fc8e8eff";
}

mudaCor = (cor) => {
  const h2 = document.querySelector('#mudaCor h2');
  h2.style.color = cor;
}

function mudaCorTexto() {
  const input = document.getElementById('textoInput');

  const colors = ['#ae5f5fff', '#d4b556ff', '#66ea66ff', '#5289f8ff', '#cf77ffff'];
  const len = input.value.length;
  if (len === 0) {
    input.style.backgroundColor = '';
    return;
  }
  const ciclo = len % colors.length;
  input.style.backgroundColor = colors[ciclo];

}

function mudaCorFundo() {
  document.querySelector('select').onchange = function() {
    document.querySelector('body').style.backgroundColor = this.value;
}
}

if(!localStorage.getItem('contador')) {
  localStorage.setItem('contador', 0);
}

function conta() {
  let contador = localStorage.getItem('contador');
  contador++;
  document.getElementById('valor').textContent = contador;
  localStorage.setItem('contador', contador);
}
document.querySelector('#valor').textContent = localStorage.getItem('contador');

function formulario() {
  document.querySelector('form').onsubmit = function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const idade = document.getElementById('idade').value;
    document.querySelector('#mensagem').textContent = `Olá, o/a  ${nome} tem ${idade} anos.`;
  }
}

formulario();

function contadorAutomatico() {
  let valorContadorAutomatico = localStorage.getItem('valorContadorAutomatico');
    valorContadorAutomatico++;
    document.getElementById('contadorAuto').textContent = valorContadorAutomatico;
    localStorage.setItem('valorContadorAutomatico', valorContadorAutomatico);
}
setInterval(contadorAutomatico, 1000);
countadorAutomatico();
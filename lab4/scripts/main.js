function entra() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Não te preocupes, o JavaScript raramente explode. 💥";
  area.style.backgroundColor = "#f1fc8eff";
}

function sai() {
  const area = document.getElementById("hoverArea");
  area.textContent = "BOOOM!💥";
  area.style.backgroundColor = "red";
}

function mudaCor(cor) {
  document.body.style.backgroundColor = cor;
}
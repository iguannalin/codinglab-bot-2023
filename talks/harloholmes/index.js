window.addEventListener("load", () => {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  const container = document.getElementById("container");
  const offset = 100;

  function position(b) {
    b.style.top = getRandomInt(-offset,window.innerHeight+offset)+"px";
    b.style.left = getRandomInt(-offset,window.innerWidth+offset)+"px";
  }

  function randomize() {
    const blocks = Array.from(document.getElementsByClassName("block"));
    blocks.forEach((b) => position(b));
  }

  for (let i = 0; i < getRandomInt(450,500); i++) {
    const block = document.createElement("span");
    block.className = "block";
    const r = getRandomInt(50,55);
    position(block);
    block.style.width = r+"px";
    block.style.height = r+"px";
    document.body.appendChild(block);
  }

  setInterval(randomize, 2500);
});
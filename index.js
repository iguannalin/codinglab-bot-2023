window.addEventListener("load", () => {
  const container = document.getElementById("container");
  const createImg = (src, size) => {
    const img = document.createElement("img");
    img.width = size;
    img.src = src;
    img.style.paddingTop = "12px";
    img.style.cursor = "pointer";
    img.onclick = () => window.open("https://codinglab.itp.io/");
    container.appendChild(img);
  }
  fetch("dates.json").then((r) => r.json()).then((d) => {
    d.forEach((date, i) => {
      console.log(date)
      const div = document.createElement("div");
      const h1 = document.createElement("h1");
      const span = document.createElement("span");
      const h2 = document.createElement("h2");
      const mark = document.createElement("mark");
      const sub = document.createElement("sub");
      const img = document.createElement("img");
      const a = document.createElement("a");
      a.innerText = "add to calendar";
      a.style.display = "block";
      a.href = date.link;
      img.src = "icons/icon.png";
      img.style.paddingRight = "8px";
      span.innerText = date.title;
      h2.innerHTML += date.author+"&nbsp;&nbsp;";
      h2.appendChild(sub);
      sub.style.fontStyle = "italic";
      mark.innerText = date.description;
      sub.innerText = date.time;
      div.style.padding = "6px";
      h1.appendChild(img);
      h1.appendChild(span);
      div.appendChild(h1);
      div.appendChild(h2);
      div.appendChild(mark);
      div.appendChild(a);
      container.appendChild(div);
    });
    createImg("thecodinglab.png", 220);
    createImg("qrcode.png", 150);
  });
});
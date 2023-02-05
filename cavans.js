const cavans = document.getElementById("cavans");
const ctx = cavans.getContext("2d");

cavans.width = window.innerWidth - 1;
cavans.height = window.innerHeight - 1;

// init option
const options = {
  flag: false,
  color: "black",
  width: "7",
};

// option function
// clear
const clearBtn = document.querySelector(".clear");
function clear() {
  if (!localStorage.getItem("coords").length == 0) {
    localStorage.setItem("coords", "");
  }
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}
clearBtn.addEventListener("click", function () {
  clear();
});
// color
const colors = document.querySelector(".colors");
colors.addEventListener("click", function (evt) {
  options.color = evt.target.value;
});
// width
const width = document.querySelector(".width");
width.addEventListener("click", function (evt) {
  options.width = evt.target.value;
});
// save info
function saveLocal(coords) {
  localStorage.setItem("coords", coords);
}
// repeat
function repeatPaint() {
  const items = JSON.parse(localStorage.getItem("coords"));
  clearBtn.disabled = true;
  cavans.classList.add("repeading");
  clear();
  const timerPaint = setInterval(function () {
    if (!items.length) {
      clearInterval(timerPaint);
      ctx.beginPath();
      clearBtn.disabled = false;
      cavans.classList.remove("repeading");
      return;
    } else {
      crd = items.shift();
      evt = {
        clientX: crd["0"],
        clientY: crd["1"],
        color: crd["2"],
        width: crd["3"],
      };
      ctx.lineTo(evt.clientX, evt.clientY);
      ctx.lineWidth = evt.width * 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(evt.clientX, evt.clientY, evt.width, 0, 2 * Math.PI);
      ctx.fillStyle = evt.color;
      ctx.strokeStyle = evt.color;
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(evt.clientX, evt.clientY);
    }
  }, 20);
}
const repeatBtn = document.querySelector(".repeat");

repeatBtn.addEventListener("click", function () {
  repeatPaint();
});

const userPositionXY = [];
// paint
cavans.addEventListener("mousedown", function () {
  options.flag = true;
});

cavans.addEventListener("mouseup", function () {
  options.flag = false;
  ctx.beginPath();
  userPositionXY.push("mouseup");
});
cavans.addEventListener("mousemove", function (evt) {
  if (options.flag) {
    userPositionXY.push([
      evt.clientX,
      evt.clientY,
      options.color,
      options.width,
    ]);

    saveLocal(JSON.stringify(userPositionXY));

    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.lineWidth = options.width * 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(evt.clientX, evt.clientY, options.width, 0, 2 * Math.PI);
    ctx.fillStyle = options.color;
    ctx.strokeStyle = options.color;
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(evt.clientX, evt.clientY);
  }
});

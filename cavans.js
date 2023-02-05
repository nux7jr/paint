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
  } else {
    // mobile version
    const cavans = document.getElementById("cavans");
    // const ctx = cavans.getContext("2d");
    cavans.addEventListener("touchstart", handleStart, false);
    cavans.addEventListener("touchend", handleEnd, false);
    cavans.addEventListener("touchcancel", handleCancel, false);
    cavans.addEventListener("touchmove", handleMove, false);

    const ongoingTouches = [];

    function handleStart(evt) {
      evt.preventDefault();
      console.log("touchstart.");
      const cavans = document.getElementById("cavans");
      var ctx = cavans.getContext("2d");
      var touches = evt.changedTouches;

      for (var i = 0; i < touches.length; i++) {
        console.log("touchstart:" + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        var color = colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
        console.log("touchstart:" + i + ".");
      }
    }

    function handleMove(evt) {
      evt.preventDefault();
      const cavans = document.getElementById("cavans");
      var ctx = cavans.getContext("2d");
      var touches = evt.changedTouches;

      for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
          console.log("continuing touch " + idx);
          ctx.beginPath();
          console.log(
            "ctx.moveTo(" +
              ongoingTouches[idx].pageX +
              ", " +
              ongoingTouches[idx].pageY +
              ");"
          );
          ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
          console.log(
            "ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");"
          );
          ctx.lineTo(touches[i].pageX, touches[i].pageY);
          ctx.lineWidth = 4;
          ctx.strokeStyle = color;
          ctx.stroke();

          ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
          console.log(".");
        } else {
          console.log("can't figure out which touch to continue");
        }
      }
    }
    function handleEnd(evt) {
      evt.preventDefault();
      log("touchend");
      const cavans = document.getElementById("cavans");
      var ctx = cavans.getContext("2d");
      var touches = evt.changedTouches;

      for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
          ctx.lineWidth = 4;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
          ctx.lineTo(touches[i].pageX, touches[i].pageY);
          ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // and a square at the end
          ongoingTouches.splice(idx, 1); // remove it; we're done
        } else {
          console.log("can't figure out which touch to end");
        }
      }
    }
    function handleCancel(evt) {
      evt.preventDefault();
      var touches = evt.changedTouches;

      for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1); // remove it; we're done
      }
    }
    function colorForTouch(touch) {
      var r = touch.identifier % 16;
      var g = Math.floor(touch.identifier / 3) % 16;
      var b = Math.floor(touch.identifier / 7) % 16;
      r = r.toString(16); // make it a hex digit
      g = g.toString(16); // make it a hex digit
      b = b.toString(16); // make it a hex digit
      var color = "#" + r + g + b;
      console.log(
        "color for touch with identifier " + touch.identifier + " = " + color
      );
      return color;
    }
    function copyTouch({ identifier, pageX, pageY }) {
      return { identifier, pageX, pageY };
    }
    function ongoingTouchIndexById(idToFind) {
      for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;

        if (id == idToFind) {
          return i;
        }
      }
      return -1; // not found
    }
    function log(msg) {
      var p = document.getElementById("log");
      p.innerHTML = msg + "\n" + p.innerHTML;
    }
  }
});

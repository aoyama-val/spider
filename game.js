var G = {
  FPS: 30,
  MS_PER_FRAME: 1000.0 / 30,
  CANVAS_W: 800,
  CANVAS_H: 450,
  frame: 0,
  lastId: 0,
  entities: [],
  mouseX: 0,
  canonAngle: 90,
  score: 0,
  displayingScore: 0,
};

var Spider = function() {
  var that = this;
  G.lastId += 1;
  that.id = "id" + G.lastId;

  that.isAlive = true;
  that.size = Math.floor(Math.random() * 30);
  that.frameDC = 0;

  // 初期位置
  that.x = 200;
  that.y = 200;

  that.x = 0;
  that.y = 0;

  that.setSpeed();

  var obj = document.createElement("img");
  obj.src = "spider.png";
  obj.width = 40 + that.size;
  obj.height = 40 + that.size;
  obj.className = "entity";
  that.appended = false;
  that.obj = obj;
};

Spider.prototype = {
  action: function() {
    var that = this;
    that.x += that.speedX;
    that.y += that.speedY;
    if (that.x > G.CANVAS_W) {
      that.x -= G.CANVAS_W;
    } else if (that.x < 0) {
      that.x += G.CANVAS_W;
    }
    if (that.y > G.CANVAS_H) {
      that.y -= G.CANVAS_H;
    } else if (that.y < 0) {
      that.y += G.CANVAS_H;
    }

    that.frameDC -= 1;

    if (that.frameDC <= 0) {
      that.setSpeed();
      that.frameDC = Math.floor(Math.random() * G.FPS * 3);

      that.isAlive = false;
    }
  },

  setSpeed: function() {
    var that = this;
    var direction = Math.random() * 2 * Math.PI;
    var speed = Math.random() * 10;
    that.speedX = Math.cos(direction) * speed;
    that.speedY = Math.sin(direction) * speed;
  },

  draw: function() {
    var that = this;
    that.obj.style.left = that.x + "px";
    that.obj.style.top  = that.y + "px";
    if (!that.appended) {
      document.getElementById("canvas").appendChild(that.obj);
      that.appended = true;
    }
  }
};

Bullet = function() {
  var that = this;

  that.x = 360;
  that.y = 400;

  var speed = 30;
  that.speedX = -Math.cos(deg2rad(G.canonAngle)) * speed;
  that.speedY = -Math.sin(deg2rad(G.canonAngle)) * speed;

  var obj = document.createElement("img");
  obj.id = "bullet";
  obj.src = "bullet.png";
  obj.width = 40;
  obj.height = 40;
  obj.className = "entity";
  that.obj = obj;
  that.appended = false;
}

Bullet.prototype = {
  action: function() {
    var that = this;
    that.x += that.speedX;
    that.y += that.speedY;
    if (that.x < 0 || that.x > G.CANVAS_W || that.y < 0 || that.y > G.CANVAS_H) {
      removeBullet();
    }
  },

  draw: function() {
    var that = this;
    that.obj.style.left = that.x + "px";
    that.obj.style.top  = that.y + "px";
    if (!that.appended) {
      document.getElementById("canvas").appendChild(that.obj);
      that.appended = true;
    }
  }
}

function removeBullet() {
  $('#bullet').remove();
  G.bullet = null;
}

function start() {
  setInterval(tick, G.MS_PER_FRAME);

  $("body").mousemove(function(e) {
    var speed = 3;
    var dx = e.clientX - G.mouseX;
    G.mouseX = e.clientX;
    if (dx != 0) {
      if (dx > 0) {
        G.canonAngle -= speed;
      } else if (dx < 0) {
        G.canonAngle += speed;
      }
      G.canonAngle = clamp(G.canonAngle, 0, 180);
      $("#canon").css("transform", "rotate(" + (G.canonAngle - 90) + "deg)");
    }
  }).click(function(e) {
    if (G.bullet != null) {
      return;
    }
    G.bullet = new Bullet();
  });

  spawnSpider();
}

function clamp(v, min, max) {
  if (v < min)
    return min;
  else if (v > max)
    return max;
  else
    return v;
}

function tick() {
  action();
  draw();
}

function action() {
  G.frame += 1;

  var tmp = [];
  G.entities.forEach(function(e) {
    e.action();
    if (e.isAlive) {
      tmp.push(e);
    } else {
      $('#' + e.id).remove();
    }
  });
  G.entities = tmp;

  if (G.bullet != null) {
    G.bullet.action();
  }

  if (Math.random() < 0.002) {
    spawnSpider();
  }
}

function spawnSpider() {
  console.log("spawnSpider");
  G.entities.push(new Spider());
}

function draw() {
  G.entities.forEach(function(e) {
    e.draw();
  });

  if (G.bullet != null) {
    G.bullet.draw();
  }

  G.displayingScore += 3;
  G.displayingScore = clamp(G.displayingScore, 0, G.score);

  $('#canonAngle').text(G.canonAngle);
  $('#score').text(G.displayingScore);
}

function secondsToFrame(seconds) {
  return seconds * G.FPS;
}

function deg2rad(deg) {
  return deg / 180.0 * Math.PI;
}

var G = {
  FPS: 30,
  MS_PER_FRAME: 1000.0 / 30,
  CANVAS_W: 800,
  CANVAS_H: 450,
  frame: 0,
  lastId: 0,
  entities: [],
  effects: [],
  mouseX: 0,
  canonAngle: 90,
  score: 0,
  spawnDC: 30,
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
  that.x = G.CANVAS_W * Math.random();
  that.y = G.CANVAS_H * Math.random();

  that.setSpeed();

  var obj = document.createElement("img");
  obj.id = that.id;
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

      //that.isAlive = false;
    }
  },

  setSpeed: function() {
    var that = this;
    var direction = Math.random() * 2 * Math.PI;
    //var speed = Math.random() * 10;
    var speed = 1;
    that.speedX = Math.cos(direction) * speed;
    that.speedY = Math.sin(direction) * speed;
  },

  getCenter: function() {
    var that = this;
    return [that.x + that.obj.width / 2, that.y + that.obj.height / 2];
  },

  die: function() {
    var that = this;
    that.isAlive = false;
    G.score += 3 * (30 + that.size);
    G.effects.push(new Effect(that.x, that.y));
    G.spawnDC = secondsToFrame(2.0);
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

Effect = function(x, y) {
  var that = this;
  that.x = x;
  that.y = y;
  that.frame = secondsToFrame(1.0);

  var obj = document.createElement("img");
  obj.src = "crash2.png";
  obj.width = 40;
  obj.height = 40;
  obj.className = "entity";
  that.obj = obj;
  that.appended = false;
};

Effect.prototype = {
  action: function() {
    var that = this;
    that.frame -= 1;
    that.isAlive = true;
    that.appended = false;
    if (that.frame < 0) {
      that.isAlive = false;
    }

  },
  draw: function() {
    var that = this;
    if (that.obj) {
      that.obj.style.left = that.x + "px";
      that.obj.style.top  = that.y + "px";
    }
    if (!that.appended) {
      document.getElementById("canvas").appendChild(that.obj);
      that.appended = true;
    }
  }
}

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
    } else {
      that.checkCollision();
    }
  },

  getCenter: function() {
    var that = this;
    return [that.x + that.obj.width / 2, that.y + that.obj.height / 2];
  },

  checkCollision: function() {
    var that = this;
    G.entities.forEach(function(e) {
      if (isCollide(
        that.x, that.y, $(that.obj).width(), $(that.obj).height(),
        e.x, e.y, $(e.obj).width(), $(e.obj).height())) {
        e.die();
      }
      //var dist = distance(that.getCenter(), e.getCenter());
      //if (dist < 20) {
        //e.die();
      //}
    });
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

  var tmp2 = [];
  G.effects.forEach(function(e) {
    e.action();
    if (e.isAlive) {
      tmp2.push(e);
    } else {
      $(e.obj).remove();
    }
  });
  G.effects = tmp2;

  if (G.bullet != null) {
    G.bullet.action();
  }

  G.spawnDC -= 1;
  if (G.spawnDC <= 0) {
    if (G.entities.length < 10) {
      spawnSpider();
    }
    G.spawnDC = secondsToFrame(2 + 10 * Math.random());
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

  G.effects.forEach(function(e) {
    e.draw();
  });

  if (G.bullet != null) {
    G.bullet.draw();
  }

  G.displayingScore += 2;
  G.displayingScore = clamp(G.displayingScore, 0, G.score);

  $('#score').text(G.displayingScore);
}

function secondsToFrame(seconds) {
  return Math.ceil(seconds * G.FPS);
}

function deg2rad(deg) {
  return deg / 180.0 * Math.PI;
}

function distance(p1, p2) {
  var dx = p1[0] - p2[0];
  var dy = p1[1] - p2[1];
  var dist = Math.sqrt(dx * dx + dy * dy);
  return dist;
}

function isCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return ( x1 < x2 + w2  &&
             x2 < x1 + w1  &&
             y1 < y2 + h2  &&
             y2 < y1 + h1  );
}


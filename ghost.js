class Ghost {
  constructor(
    x,
    y,
    width,
    height,
    speed,
    imageX,
    imageY,
    imageWidth,
    imageHeight,
    range
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = DIRECTION_RIGHT;
    this.imageX = imageX;
    this.imageY = imageY;
    this.imageHeight = imageHeight;
    this.imageWidth = imageWidth;
    this.range = range;
    this.randomTargetIndex = parseInt(Math.random() * 4);
    this.target = randomTargetsForGhosts[this.randomTargetIndex];
    this.changeDirectionInterval = setInterval(() => {
      this.changeRandomDirection();
    }, 3000);
  }

  isInRange() {
    const xDistance = Math.abs(pacman.getMapX() - this.getMapX());
    const yDistance = Math.abs(pacman.getMapY() - this.getMapY());
    return Math.sqrt(xDistance ** 2 + yDistance ** 2) <= this.range;
  }

  changeRandomDirection() {
    this.randomTargetIndex = (this.randomTargetIndex + 1) % 4;
  }

  moveProcess() {
    this.target = this.isInRange()
      ? pacman
      : randomTargetsForGhosts[this.randomTargetIndex];
    this.changeDirectionIfPossible();
    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
    }
  }

  moveBackwards() {
    const movement = {
      4: () => (this.x -= this.speed), // Right
      3: () => (this.y += this.speed), // Up
      2: () => (this.x += this.speed), // Left
      1: () => (this.y -= this.speed), // Bottom
    };
    movement[this.direction]?.();
  }

  moveForwards() {
    const movement = {
      4: () => (this.x += this.speed), // Right
      3: () => (this.y -= this.speed), // Up
      2: () => (this.x -= this.speed), // Left
      1: () => (this.y += this.speed), // Bottom
    };
    movement[this.direction]?.();
  }

  checkCollisions() {
    return (
      map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] ==
        1 ||
      map[parseInt(this.y / oneBlockSize + 0.9999)][
        parseInt(this.x / oneBlockSize)
      ] == 1 ||
      map[parseInt(this.y / oneBlockSize)][
        parseInt(this.x / oneBlockSize + 0.9999)
      ] == 1 ||
      map[parseInt(this.y / oneBlockSize + 0.9999)][
        parseInt(this.x / oneBlockSize + 0.9999)
      ] == 1
    );
  }

  changeDirectionIfPossible() {
    const tempDirection = this.direction;
    this.direction = this.calculateNewDirection(
      map,
      parseInt(this.target.x / oneBlockSize),
      parseInt(this.target.y / oneBlockSize)
    );
    if (typeof this.direction === "undefined") {
      this.direction = tempDirection;
      return;
    }

    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
      this.direction = tempDirection;
    } else {
      this.moveBackwards();
    }
  }

  calculateNewDirection(map, destX, destY) {
    const mp = map.map((row) => row.slice());
    const visited = new Set();
    const queue = [
      {
        x: this.getMapX(),
        y: this.getMapY(),
        moves: [],
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      if (current.x === destX && current.y === destY) {
        return current.moves[0];
      }

      const neighbors = this.addNeighbors(current, mp);
      for (const neighbor of neighbors) {
        queue.push(neighbor);
      }
    }

    return 1; // Default direction if no path is found
  }

  addNeighbors(current, mp) {
    const queue = [];
    const numOfRows = mp.length;
    const numOfColumns = mp[0].length;

    const directions = [
      { x: -1, y: 0, move: DIRECTION_LEFT },
      { x: 1, y: 0, move: DIRECTION_RIGHT },
      { x: 0, y: -1, move: DIRECTION_UP },
      { x: 0, y: 1, move: DIRECTION_BOTTOM },
    ];

    for (const { x, y, move } of directions) {
      const newX = current.x + x;
      const newY = current.y + y;
      if (
        newX >= 0 &&
        newX < numOfColumns &&
        newY >= 0 &&
        newY < numOfRows &&
        mp[newY][newX] != 1
      ) {
        const tempMoves = current.moves.slice();
        tempMoves.push(move);
        queue.push({ x: newX, y: newY, moves: tempMoves });
      }
    }

    return queue;
  }

  getMapX() {
    return parseInt(this.x / oneBlockSize);
  }

  getMapY() {
    return parseInt(this.y / oneBlockSize);
  }

  getMapXRightSide() {
    return parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
  }

  getMapYRightSide() {
    return parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
  }

  changeAnimation() {
    this.currentFrame =
      this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1;
  }

  draw() {
    canvasContext.save();
    canvasContext.drawImage(
      ghostFrames,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    canvasContext.restore();
  }
}

const updateGhosts = () => {
  ghosts.forEach((ghost) => ghost.moveProcess());
};

const drawGhosts = () => {
  if (Array.isArray(ghosts) && ghosts.length > 0) {
    ghosts.forEach((ghost) => ghost.draw());
  }
};

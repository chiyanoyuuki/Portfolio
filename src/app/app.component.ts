import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public innerWidth: any = window.innerWidth;
  public innerHeight: any = window.innerHeight;

  lang = 'fr';
  menus: { fr: string; en: string; id: number }[] = [
    { en: 'Projects', fr: 'Projets', id: 4 },
    { en: 'Skills', fr: 'Compétences', id: 3 },
    { en: 'Career', fr: 'Carrière', id: 2 },
    { en: 'Studies', fr: 'Etudes', id: 1 },
    { en: 'About me', fr: 'Qui suis-je', id: 0 },
  ];

  characterPosition: any = { x: 500, y: 500 };
  currentFrame: any = 0;
  walking: any = false;
  direction: any = 'right';
  frames: any = ['1.png', '0.png', '5.png'];
  frameInterval: any;
  frame: any = this.frames[0];
  deplacement: any = 5;
  startJumpY: any = 0;
  hideCharacter: boolean = false;

  isJumping = false;
  jumpHeight = 150;
  jumpSpeed = 10;

  voidUnder = false;
  keysDown = { left: false, right: false, up: false, down: false };
  characterHeight = 52;
  characterWidth = 40;

  selectedMenu: any = -1;

  vie = [1, 1, 1];

  tuyauWidth = 205;
  tuyauBottom = 150;
  tuyauHeight = 85;
  plateformeWidth = 120;

  clouds: any = [];

  taillebloc = 50;
  sol: number[] = Array.from(
    { length: this.innerWidth / this.taillebloc + 2 },
    (_, i) => i + 1
  );

  constructor() {}

  ngOnInit(): void {
    this.jump(true);
    this.move();
    this.generateClouds();
  }

  generateClouds(): void {
    for (let i = 0; i < 20; i++) {
      this.createCloud();
    }
    /*setInterval(() => {
      this.createCloud();
    }, 3000);*/
  }

  createCloud(): void {
    this.innerWidth = window.outerWidth;
    const cloud: any = {
      width: Math.random() * 100 + 100,
      y: Math.random() * 300 - 20,
      x:
        this.innerWidth * -3 + (this.innerWidth / 5) * (this.clouds.length + 1),
    };
    this.clouds.push(cloud);
  }

  ngAfterViewInit(): void {
    /*this.drawLine(
      0,
      700 - this.menus.length * this.tuyauHeight,
      1000,
      700 - this.menus.length * this.tuyauHeight
    );*/
  }

  drawLine(x1: number, y1: number, x2: number, y2: number): void {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (context) {
      // Ajuster la taille du canvas à celle de la fenêtre
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Dessiner la ligne
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = 'red'; // Couleur de la ligne
      context.lineWidth = 2; // Épaisseur de la ligne
      context.stroke();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerHeight = event.target.innerHeight;
    this.innerWidth = event.target.innerWidth;

    if (this.innerWidth < this.characterPosition.x + this.characterWidth)
      this.characterPosition.x = this.innerWidth - this.characterWidth;

    this.sol = Array.from(
      { length: this.innerWidth / this.taillebloc + 2 },
      (_, i) => i + 1
    );
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (
      (event.code === 'Space' || event.code === 'Numpad0') &&
      !this.isJumping &&
      this.selectedMenu == -1
    ) {
      clearInterval(this.frameInterval);
      this.frameInterval = undefined;
      this.currentFrame = 0;
      this.startJumpY = 0;
      this.frame = '4.png';
      this.isJumping = true;
      this.jump();
    }

    if (!this.isJumping) {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.clearInterval(true);
        this.keysDown.down = true;
        this.frame = '3.png';
      }
      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.clearInterval(true);
        this.keysDown.up = true;
        this.frame = '2.png';
      }
    }

    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.walking = true;
      this.keysDown.right = true;
      this.direction = 'right';
      this.moveRight();
    }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.walking = true;
      this.keysDown.left = true;
      this.direction = 'left';
      this.moveLeft();
    }
  }

  resetFrame() {
    if (!this.isJumping && !this.keysDown.down && !this.keysDown.up) {
      this.currentFrame = 0;
      this.frame = this.frames[0];
    }
  }

  @HostListener('window:keyup', ['$event'])
  stopWalking(event: KeyboardEvent) {
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.keysDown.right = false;
      this.clearInterval();
      this.resetFrame();
    }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.keysDown.left = false;
      this.clearInterval();
      this.resetFrame();
    }
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.keysDown.down = false;
      this.frame = this.frames[0];
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.keysDown.up = false;
      this.frame = this.frames[0];
    }
  }

  clearInterval(force: boolean = false) {
    if (force || (!this.keysDown.left && !this.keysDown.right)) {
      this.walking = false;
      clearInterval(this.frameInterval);
      this.frameInterval = undefined;
    }
  }

  moveLeft() {
    if (this.walking) {
      if (!this.frameInterval && !this.isJumping) {
        this.currentFrame = 1;
        this.frame = this.frames[1];
        this.frameInterval = setInterval(() => this.updateFrame(), 100);
      }
    }
  }

  moveRight() {
    if (this.walking) {
      if (!this.frameInterval && !this.isJumping) {
        this.currentFrame = 1;
        this.frame = this.frames[1];
        this.frameInterval = setInterval(() => this.updateFrame(), 100);
      }
    }
  }

  move() {
    let x = this.characterPosition.x;
    let y = this.characterPosition.y;

    if (this.keysDown.right && !this.keysDown.up && !this.keysDown.down) {
      this.walking = true;
      this.direction = 'right';
      if (x < this.innerWidth - this.characterWidth)
        this.characterPosition.x += this.deplacement; // Déplacement à droite
      if (
        !this.isJumping &&
        x > this.tuyauWidth + this.plateformeWidth - 50 &&
        y + this.characterHeight < this.innerHeight - this.tuyauBottom + 20
      ) {
        this.jump(true);
      }
      if (
        x > this.tuyauWidth - 40 &&
        y < this.innerHeight - this.tuyauBottom + 20 &&
        !this.isJumping
      ) {
        this.selectedMenu = -1;
      }
      if (this.frameInterval == undefined && !this.isJumping) this.moveRight();
    }
    if (this.keysDown.left && !this.keysDown.up && !this.keysDown.down) {
      this.walking = true;
      this.direction = 'left';
      let can = true;
      if (
        this.isJumping &&
        x < this.tuyauWidth &&
        y < this.innerHeight - this.tuyauBottom
      )
        can = false;
      if (x > 0 && can) this.characterPosition.x -= this.deplacement; // Déplacement à gauche
      if (
        x < this.tuyauWidth - 20 &&
        y < this.innerHeight - this.tuyauBottom + 20 &&
        !this.isJumping
      ) {
        for (let i = 0; i < this.menus.length; i++) {
          if (y > 670 - 80 * i && y < 730 - 80 * i)
            this.selectedMenu = 5 - i - 1;
        }
      }
      if (this.frameInterval == undefined && !this.isJumping) this.moveLeft();
    }
    requestAnimationFrame(() => this.move()); // Continuer le mouvement
  }

  updateFrame() {
    //if (this.direction == 'right') this.characterPosition.x += this.deplacement;
    //else this.characterPosition.x -= this.deplacement;
    if (!this.isJumping && !this.keysDown.up && !this.keysDown.down) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.frame = this.frames[this.currentFrame];
    }
  }

  jump(justFall: boolean = false) {
    if (justFall) {
      this.startJumpY = -150;
      this.isJumping = true;
    }
    // Utilisation de requestAnimationFrame pour une animation fluide
    const jumpUp = () => {
      const x = this.characterPosition.x;
      const y = this.characterPosition.y;
      if (justFall) {
        this.startJumpY = -this.jumpHeight;
        fallDown();
      }
      //Collision tuyaux menu
      else if (x < this.tuyauWidth && y < this.innerHeight - this.tuyauBottom) {
        this.startJumpY = -this.jumpHeight;
        fallDown();
      }
      //Collision bloc lang
      else if (
        x + this.characterWidth > this.tuyauWidth + 20 &&
        x < this.tuyauWidth + 70 &&
        y + 30 < 700 - this.menus.length * this.tuyauHeight
      ) {
        this.lang = this.lang == 'fr' ? 'en' : 'fr';
        this.startJumpY = -this.jumpHeight;
        fallDown();
      } else if (this.startJumpY > -this.jumpHeight) {
        this.startJumpY -= this.jumpSpeed; // Monter le personnage
        this.characterPosition.y -= this.jumpSpeed;
        requestAnimationFrame(jumpUp); // Continuer l'animation
      } else {
        this.startJumpY = -this.jumpHeight;
        fallDown(); // Commencer à redescendre une fois arrivé en haut
      }
    };

    // Animation pour la redescente
    const fallDown = () => {
      let stop = false;
      this.voidUnder = false;
      const x = this.characterPosition.x;
      const y = this.characterPosition.y + this.characterHeight;

      if (!this.voidUnder)
        this.voidUnder = y < this.innerHeight - this.taillebloc;

      if (
        x > this.tuyauWidth - 20 &&
        x < this.tuyauWidth + this.plateformeWidth
      ) {
        for (let i = 0; i < this.menus.length; i++) {
          if (!stop)
            stop =
              y - this.startJumpY <
                this.innerHeight -
                  this.taillebloc +
                  20 -
                  this.tuyauHeight * i &&
              y > this.innerHeight - this.tuyauBottom - this.tuyauHeight * i;
        }
      }

      if (this.voidUnder && !stop) {
        this.startJumpY += this.jumpSpeed; // Redescendre le personnage
        this.characterPosition.y += this.jumpSpeed;
        requestAnimationFrame(fallDown); // Continuer l'animation
      } else {
        this.isJumping = false; // Le saut est terminé, réinitialiser l'état
        this.frame = this.frames[0];
      }
    };

    jumpUp(); // Commencer à monter le personnage
  }
}

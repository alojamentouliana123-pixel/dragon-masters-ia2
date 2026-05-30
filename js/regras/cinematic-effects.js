// =====================================================
// ULTRA REALISTIC CINEMATIC PARTICLES ENGINE
// ELDRAKAR — AAA VERSION
// =====================================================

export class CinematicParticles {

  constructor() {

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.className = "cinematic-particles";

    document.body.appendChild(this.canvas);

    this.resize();

    window.addEventListener("resize", () => this.resize());

    this.particles = [];

    this.animation = null;

  }

  resize() {

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

  }

  destroy() {

    cancelAnimationFrame(this.animation);

    this.canvas.remove();

  }

  // =====================================================
  // CHUVA REALISTA
  // =====================================================

  rain(intensity = 700) {

    this.particles = [];

    for (let i = 0; i < intensity; i++) {

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        length: 10 + Math.random() * 25,
        speed: 12 + Math.random() * 18,
        opacity: 0.1 + Math.random() * 0.5,
        thickness: 0.5 + Math.random() * 1.2
      });

    }

    const render = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = "rgba(255,255,255,0.4)";
      this.ctx.lineCap = "round";

      for (const p of this.particles) {

        this.ctx.beginPath();

        this.ctx.lineWidth = p.thickness;

        this.ctx.strokeStyle = `rgba(220,230,255,${p.opacity})`;

        this.ctx.moveTo(p.x, p.y);

        this.ctx.lineTo(
          p.x - 4,
          p.y + p.length
        );

        this.ctx.stroke();

        p.y += p.speed;
        p.x -= p.speed * 0.15;

        if (p.y > this.canvas.height) {

          p.y = -20;
          p.x = Math.random() * this.canvas.width;

        }

      }

      this.animation = requestAnimationFrame(render);

    };

    render();

  }

  // =====================================================
  // NEVE REALISTA
  // =====================================================

  snow(intensity = 400) {

    this.particles = [];

    for (let i = 0; i < intensity; i++) {

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 1 + Math.random() * 4,
        speed: 0.2 + Math.random() * 1.5,
        drift: Math.random() * 2 - 1,
        opacity: 0.2 + Math.random() * 0.8
      });

    }

    const render = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {

        this.ctx.beginPath();

        this.ctx.fillStyle =
          `rgba(255,255,255,${p.opacity})`;

        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "white";

        this.ctx.arc(
          p.x,
          p.y,
          p.radius,
          0,
          Math.PI * 2
        );

        this.ctx.fill();

        p.y += p.speed;
        p.x += Math.sin(p.y * 0.01) * p.drift;

        if (p.y > this.canvas.height) {

          p.y = -10;
          p.x = Math.random() * this.canvas.width;

        }

      }

      this.animation = requestAnimationFrame(render);

    };

    render();

  }

  // =====================================================
  // FUMAÇA CINEMATOGRÁFICA
  // =====================================================

  smoke(intensity = 120) {

    this.particles = [];

    for (let i = 0; i < intensity; i++) {

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + Math.random() * 200,
        radius: 80 + Math.random() * 200,
        speed: 0.2 + Math.random() * 0.8,
        opacity: 0.02 + Math.random() * 0.08,
        drift: Math.random() * 1.5 - 0.75
      });

    }

    const render = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {

        const gradient =
          this.ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius
          );

        gradient.addColorStop(
          0,
          `rgba(180,180,180,${p.opacity})`
        );

        gradient.addColorStop(
          1,
          "rgba(0,0,0,0)"
        );

        this.ctx.fillStyle = gradient;

        this.ctx.beginPath();

        this.ctx.arc(
          p.x,
          p.y,
          p.radius,
          0,
          Math.PI * 2
        );

        this.ctx.fill();

        p.y -= p.speed;
        p.x += p.drift;

        if (p.y < -200) {

          p.y = this.canvas.height + 200;
          p.x = Math.random() * this.canvas.width;

        }

      }

      this.animation = requestAnimationFrame(render);

    };

    render();

  }

  // =====================================================
  // FOG AAA
  // =====================================================

  fog(intensity = 80) {

    this.particles = [];

    for (let i = 0; i < intensity; i++) {

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 150 + Math.random() * 300,
        opacity: 0.01 + Math.random() * 0.04,
        speed: 0.1 + Math.random() * 0.3
      });

    }

    const render = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {

        const gradient =
          this.ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius
          );

        gradient.addColorStop(
          0,
          `rgba(255,255,255,${p.opacity})`
        );

        gradient.addColorStop(
          1,
          "rgba(255,255,255,0)"
        );

        this.ctx.fillStyle = gradient;

        this.ctx.beginPath();

        this.ctx.arc(
          p.x,
          p.y,
          p.radius,
          0,
          Math.PI * 2
        );

        this.ctx.fill();

        p.x += p.speed;

        if (p.x > this.canvas.width + 300) {

          p.x = -300;

        }

      }

      this.animation = requestAnimationFrame(render);

    };

    render();

  }

}
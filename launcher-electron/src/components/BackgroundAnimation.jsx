import React, { useEffect, useRef } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Get theme colors from CSS variables
    const getThemeColors = () => {
      const root = document.documentElement;
      const primary = getComputedStyle(root).getPropertyValue('--theme-primary').trim();
      const secondary = getComputedStyle(root).getPropertyValue('--theme-secondary').trim();
      const accent = getComputedStyle(root).getPropertyValue('--theme-accent').trim();
      
      // Convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 139, g: 92, b: 246 }; // fallback purple
      };

      return {
        primary: hexToRgb(primary),
        secondary: hexToRgb(secondary),
        accent: hexToRgb(accent)
      };
    };

    let themeColors = getThemeColors();

    // Listen for theme changes
    const handleThemeChange = () => {
      themeColors = getThemeColors();
    };
    window.addEventListener('themeChanged', handleThemeChange);

    let time = 0;
    const particles = [];
    const particleCount = 80;
    const waves = [];
    const waveCount = 5;

    // Particle class with glow effect
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.size = Math.random() * 4 + 1;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.colorType = Math.random() < 0.5 ? 'primary' : 'secondary'; // Use primary or secondary theme color
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Pulse effect
        this.pulsePhase += this.pulseSpeed;
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const currentSize = this.size * pulse;
        const color = themeColors[this.colorType];

        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentSize * 4
        );
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity * pulse})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity * 0.3 * pulse})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wave class for background waves
    class Wave {
      constructor(index) {
        this.index = index;
        this.amplitude = 50 + index * 20;
        this.frequency = 0.002 - index * 0.0002;
        this.speed = 0.02 + index * 0.005;
        this.offset = Math.random() * Math.PI * 2;
        this.y = canvas.height * 0.3 + index * 80;
        this.opacity = 0.05 + index * 0.01;
        this.colorType = index % 2 === 0 ? 'primary' : 'secondary';
      }

      draw(time) {
        ctx.beginPath();
        ctx.moveTo(0, this.y);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y = this.y + 
            Math.sin(x * this.frequency + time * this.speed + this.offset) * this.amplitude +
            Math.sin(x * this.frequency * 2 + time * this.speed * 1.5) * (this.amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const color = themeColors[this.colorType];
        const gradient = ctx.createLinearGradient(0, this.y - this.amplitude, 0, canvas.height);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Initialize waves
    for (let i = 0; i < waveCount; i++) {
      waves.push(new Wave(i));
    }

    // Floating orbs
    const orbs = [];
    class Orb {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 100 + 50;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.colorType = Math.random() < 0.33 ? 'primary' : (Math.random() < 0.5 ? 'secondary' : 'accent');
        this.opacity = Math.random() * 0.1 + 0.05;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
      }

      draw() {
        const color = themeColors[this.colorType];
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 5; i++) {
      orbs.push(new Orb());
    }

    // Animation loop
    function animate() {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      // Draw waves
      waves.forEach(wave => wave.draw(time));

      // Draw and update orbs
      orbs.forEach(orb => {
        orb.update();
        orb.draw();
      });

      // Draw animated gradient overlay
      const primaryColor = themeColors.primary;
      const secondaryColor = themeColors.secondary;
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.5) * 200,
        canvas.height / 2 + Math.cos(time * 0.3) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8
      );
      centerGradient.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.15)`);
      centerGradient.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.05)`);
      centerGradient.addColorStop(1, 'rgba(10, 10, 10, 0)');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections with glow
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const opacity = 0.3 * (1 - distance / 200);
            
            // Glow line
            ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${opacity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Core line
            const accentColor = themeColors.accent;
            ctx.strokeStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Sparkle effects
      if (Math.random() < 0.1) {
        const sparkle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          life: 1
        };

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: document.documentElement.classList.contains('light') ? 0.2 : 0.6 }}
    />
  );
};

export default BackgroundAnimation;

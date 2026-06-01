import React, { useEffect, useRef, useState } from 'react';
import collection from './collection.js';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const config = {
  imageCount: 25,
  radius: 275,
  sensitivity: 220,
  effectFalloff: 250,
  cardMoveAmount: 50,
  lerpFactor: 0.15,
  isMobile: window.innerWidth < 1000,
};

function App() {
  const galleryRef = useRef(null);
  const galleryContainerRef = useRef(null);
  const titleContainerRef = useRef(null);
  const cardsRef = useRef([]);

  const [isPreviewing, setIsPreviewing] = useState(false);
  
  // Refs for mutable animation state
  const isPreviewingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const currentTitleRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const transformStateRef = useRef([]);
  const parallaxStateRef = useRef({
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    currentX: 0,
    currentY: 0,
    currentZ: 0,
  });

  // Initialize data and transform states once
  const galleryData = useRef([]);
  if (galleryData.current.length === 0) {
    for (let i = 0; i < config.imageCount; i++) {
      const angle = (i / config.imageCount) * Math.PI * 2;
      const x = config.radius * Math.cos(angle);
      const y = config.radius * Math.sin(angle);
      const cardIndex = i % collection.length;
      
      galleryData.current.push({
        id: i,
        angle,
        x,
        y,
        item: collection[cardIndex]
      });

      transformStateRef.current.push({
        currentRotation: 0,
        targetRotation: 0,
        currentX: 0,
        targetX: 0,
        currentY: 0,
        targetY: 0,
        currentScale: 1,
        targetScale: 1,
        angle,
      });
    }
  }

  useEffect(() => {
    // Initial Setup
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const data = galleryData.current[i];
      gsap.set(card, {
        x: data.x,
        y: data.y,
        rotation: (data.angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: 'center center',
      });
    });

    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      config.isMobile = viewportWidth < 1000;

      let galleryScale = 1;

      if (viewportWidth < 768) {
        galleryScale = 0.6;
      } else if (viewportWidth < 1200) {
        galleryScale = 0.8;
      }

      gsap.set(galleryRef.current, {
        scale: galleryScale,
      });

      if (!isPreviewingRef.current) {
        Object.assign(parallaxStateRef.current, {
          targetX: 0, targetY: 0, targetZ: 0,
          currentX: 0, currentY: 0, currentZ: 0,
        });

        transformStateRef.current.forEach((state) => {
          state.targetRotation = 0;
          state.currentRotation = 0;
          state.targetScale = 1;
          state.currentScale = 1;
          state.targetX = 0;
          state.currentX = 0;
          state.targetY = 0;
          state.currentY = 0;
        });
      }
    };

    const handleMouseMove = (e) => {
      if (isPreviewingRef.current || isTransitioningRef.current || config.isMobile) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const percentX = (e.clientX - centerX) / centerX;
      const percentY = (e.clientY - centerY) / centerY;

      parallaxStateRef.current.targetY = percentX * 15;
      parallaxStateRef.current.targetX = -percentY * 15;
      parallaxStateRef.current.targetZ = (percentX + percentY) * 5;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.sensitivity && !config.isMobile) {
          const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
          const angle = transformStateRef.current[index].angle;
          const moveAmount = config.cardMoveAmount * flipFactor;

          transformStateRef.current[index].targetRotation = 180 * flipFactor;
          transformStateRef.current[index].targetScale = 1 + 0.3 * flipFactor;
          transformStateRef.current[index].targetX = moveAmount * Math.cos(angle);
          transformStateRef.current[index].targetY = moveAmount * Math.sin(angle);
        } else {
          transformStateRef.current[index].targetRotation = 0;
          transformStateRef.current[index].targetScale = 1;
          transformStateRef.current[index].targetX = 0;
          transformStateRef.current[index].targetY = 0;
        }
      });
    };

    const animate = () => {
      if (!isPreviewingRef.current && !isTransitioningRef.current) {
        parallaxStateRef.current.currentX +=
          (parallaxStateRef.current.targetX - parallaxStateRef.current.currentX) * config.lerpFactor;
        parallaxStateRef.current.currentY +=
          (parallaxStateRef.current.targetY - parallaxStateRef.current.currentY) * config.lerpFactor;
        parallaxStateRef.current.currentZ +=
          (parallaxStateRef.current.targetZ - parallaxStateRef.current.currentZ) * config.lerpFactor;

        if (galleryContainerRef.current) {
          gsap.set(galleryContainerRef.current, {
            rotateX: parallaxStateRef.current.currentX,
            rotateY: parallaxStateRef.current.currentY,
            rotation: parallaxStateRef.current.currentZ,
          });
        }

        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          const state = transformStateRef.current[index];

          state.currentRotation +=
            (state.targetRotation - state.currentRotation) * config.lerpFactor;
          state.currentScale +=
            (state.targetScale - state.currentScale) * config.lerpFactor;
          state.currentX += (state.targetX - state.currentX) * config.lerpFactor;
          state.currentY += (state.targetY - state.currentY) * config.lerpFactor;

          const angle = state.angle;
          const x = config.radius * Math.cos(angle);
          const y = config.radius * Math.sin(angle);

          gsap.set(card, {
            x: x + state.currentX,
            y: y + state.currentY,
            rotationY: state.currentRotation,
            scale: state.currentScale,
            rotation: (angle * 180) / Math.PI + 90,
            transformPerspective: 1000,
          });
        });
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const togglePreview = (index) => {
    isPreviewingRef.current = true;
    isTransitioningRef.current = true;
    setIsPreviewing(true);

    const angle = transformStateRef.current[index].angle;
    const targetPosition = (Math.PI * 3) / 2;
    let rotationRadians = targetPosition - angle;

    if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;
    else if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;

    transformStateRef.current.forEach((state) => {
      state.currentRotation = state.targetRotation = 0;
      state.currentScale = state.targetScale = 1;
      state.currentX = state.targetX = state.currentY = state.targetY = 0;
    });

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.to(card, {
        x: config.radius * Math.cos(transformStateRef.current[i].angle),
        y: config.radius * Math.sin(transformStateRef.current[i].angle),
        rotationY: 0,
        scale: 1,
        duration: 1.25,
        ease: 'power4.Out',
      });
    });

    gsap.to(galleryRef.current, {
      scale: 5,
      y: 1300,
      rotation: (rotationRadians * 180) / Math.PI + 360,
      duration: 2,
      ease: 'power4.InOut',
      onComplete: () => {
        isTransitioningRef.current = false;
      },
    });

    gsap.to(parallaxStateRef.current, {
      currentX: 0,
      currentY: 0,
      currentZ: 0,
      duration: 0.5,
      ease: 'power2.Out',
      onUpdate: () => {
        if (galleryContainerRef.current) {
          gsap.set(galleryContainerRef.current, {
            rotateX: parallaxStateRef.current.currentX,
            rotateY: parallaxStateRef.current.currentY,
            rotateZ: parallaxStateRef.current.currentZ,
            transformOrigin: 'center center',
          });
        }
      },
    });

    const titleText = galleryData.current[index].item.title;
    const p = document.createElement('p');
    p.textContent = titleText;
    titleContainerRef.current.appendChild(p);
    currentTitleRef.current = p;

    const splitText = new SplitText(p, {
      type: 'words',
      wordsClass: 'word',
    });
    const words = splitText.words;

    gsap.set(words, { y: '125%' });
    gsap.to(words, {
      y: '0%',
      duration: 0.75,
      delay: 1.25,
      stagger: 0.1,
      ease: 'power4.Out',
    });
  };

  const resetGallery = () => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    if (currentTitleRef.current) {
      const words = currentTitleRef.current.querySelectorAll('.word');
      gsap.to(words, {
        y: '125%',
        duration: 0.75,
        delay: 0.5,
        stagger: 0.1,
        ease: 'power4.Out',
        onComplete: () => {
          if (currentTitleRef.current) {
            currentTitleRef.current.remove();
            currentTitleRef.current = null;
          }
        },
      });
    }

    const viewportWidth = window.innerWidth;
    let galleryScale = 1;

    if (viewportWidth < 768) {
      galleryScale = 0.6;
    } else if (viewportWidth < 1200) {
      galleryScale = 0.8;
    }

    gsap.to(galleryRef.current, {
      scale: galleryScale,
      y: 0,
      x: 0,
      rotation: 0,
      duration: 2.5,
      ease: 'power4.InOut',
      onComplete: () => {
        isPreviewingRef.current = false;
        isTransitioningRef.current = false;
        setIsPreviewing(false);
        Object.assign(parallaxStateRef.current, {
          targetX: 0, targetY: 0, targetZ: 0,
          currentX: 0, currentY: 0, currentZ: 0,
        });
      },
    });
  };

  const handleCardClick = (index, e) => {
    e.stopPropagation();
    if (!isPreviewingRef.current && !isTransitioningRef.current) {
      togglePreview(index);
    }
  };

  const handleDocumentClick = () => {
    if (isPreviewingRef.current && !isTransitioningRef.current) {
      resetGallery();
    }
  };

  return (
    <div onClick={handleDocumentClick}>
      <nav>
        <a href="#">Silhouette</a>
        <p></p>
      </nav>
      <div className="container">
        <div id="gallery-container" className="gallery-container" ref={galleryContainerRef}>
          <div id="gallery" className="gallery" ref={galleryRef}>
            {galleryData.current.map((data, i) => (
              <div
                key={data.id}
                className="card"
                title={data.item.title}
                ref={(el) => (cardsRef.current[i] = el)}
                onClick={(e) => handleCardClick(i, e)}
              >
                <img src={`/${data.item.img}`} alt={data.item.title} />
              </div>
            ))}
          </div>
        </div>
        <div id="title-container" className="title-container" ref={titleContainerRef}></div>
      </div>
      <footer>
        <p></p>
        <p>made by abhijeet</p>
      </footer>
    </div>
  );
}

export default App;

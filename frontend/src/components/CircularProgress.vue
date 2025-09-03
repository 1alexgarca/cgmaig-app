<template>
  <div class="circular-progress-wrapper" ref="container">
    <!-- Contenedor de segmentos circulares -->
    <div class="segments-container" ref="segmentsContainer">
      <!-- Los segmentos se generan dinámicamente -->
    </div>
    
    <!-- Contenido central (inputs) -->
    <div class="circle-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CircularProgress",
  props: {
    // Porcentaje de avance (0-100)
    avance: { 
      type: Number, 
      default: 0 
    },
    // Número total de segmentos en el círculo
    totalSegments: { 
      type: Number, 
      default: 24 
    },
    // Tamaño del componente
    size: { 
      type: Number, 
      default: 200 
    },
    // Color de los segmentos activos
    activeColor: { 
      type: String, 
      default: '#007bff' 
    }
  },
  data() {
    return {
      segments: []
    }
  },
  computed: {
    // Calcular cuántos segmentos deben estar activos
    activeSegmentsCount() {
      return Math.ceil((this.avance / 100) * this.totalSegments)
    },
    // Calcular el radio basado en el tamaño
    radius() {
      return (this.size * 0.85) / 2
    },
    // Centro del círculo
    center() {
      return this.size / 2
    }
  },
  mounted() {
    this.initCircle()
    this.updateProgress()
  },
  watch: {
    avance() { 
      this.updateProgress()
    },
    totalSegments() {
      this.initCircle()
      this.updateProgress()
    }
  },
  methods: {
    initCircle() {
      this.createSegments()
    },

    createSegments() {
      const container = this.$refs.segmentsContainer
      if (!container) return

      // Limpiar segmentos existentes
      container.innerHTML = ''
      this.segments = []

      // Actualizar el tamaño del contenedor
      const wrapper = this.$refs.container
      wrapper.style.width = this.size + 'px'
      wrapper.style.height = this.size + 'px'
      container.style.width = this.size + 'px'
      container.style.height = this.size + 'px'

      for (let i = 0; i < this.totalSegments; i++) {
        const segment = document.createElement('div')
        segment.className = 'segment'
        
        // Calcular ángulo para distribuir uniformemente
        const angle = (i / this.totalSegments) * 360 - 90 // -90 para empezar arriba
        const radian = (angle * Math.PI) / 180
        
        // Calcular posición
        const x = this.center + this.radius * Math.cos(radian)
        const y = this.center + this.radius * Math.sin(radian)
        
        // Tamaño del segmento proporcional al tamaño total
        const segmentWidth = Math.max(2, this.size * 0.04)
        const segmentHeight = Math.max(8, this.size * 0.1)
        
        // Posicionar y rotar el segmento
        segment.style.left = (x - segmentWidth/2) + 'px'
        segment.style.top = (y - segmentHeight/2) + 'px'
        segment.style.width = segmentWidth + 'px'
        segment.style.height = segmentHeight + 'px'
        segment.style.transform = `rotate(${angle + 90}deg)`
        
        container.appendChild(segment)
        this.segments.push(segment)
      }

      // Actualizar el contenido central
      const circleContent = wrapper.querySelector('.circle-content')
      if (circleContent) {
        const contentSize = this.size * 0.75
        circleContent.style.width = contentSize + 'px'
        circleContent.style.height = contentSize + 'px'
      }
    },

    updateProgress() {
      if (this.segments.length === 0) return
      
      this.segments.forEach((segment, index) => {
        segment.classList.remove('active')
        if (index < this.activeSegmentsCount) {
          segment.classList.add('active')
        }
      })
    },

    // Método público para actualizar el avance
    setAvance(nuevoAvance) {
      this.avance = Math.max(0, Math.min(100, nuevoAvance))
    }
  }
}
</script>

<style scoped>
.circular-progress-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  display: inline-block;
  margin: 20px;
}

.segments-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  pointer-events: none;
}

.segment {
  position: absolute;
  width: 8px;
  height: 20px;
  border-radius: 2px;
  background-color: #e9ecef;
  transform-origin: center center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.3;
}

.segment.active {
  background: linear-gradient(135deg, v-bind(activeColor), color-mix(in srgb, v-bind(activeColor) 80%, black));
  box-shadow: 0 0 12px color-mix(in srgb, v-bind(activeColor) 60%, transparent);
  opacity: 1;
  transform: rotate(var(--rotation)) scale(1.1);
}

.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 2px 8px rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 1;
  backdrop-filter: blur(10px);
}

/* Responsive para diferentes tamaños */
@media (max-width: 768px) {
  .circular-progress-wrapper {
    width: 150px;
    height: 150px;
  }
  
  .segments-container {
    width: 150px;
    height: 150px;
  }
  
  .circle-content {
    width: 110px;
    height: 110px;
  }
}

/* Animación de entrada */
.segment {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 0.3;
    transform: scale(1);
  }
}

/* Animación para segmentos activos */
.segment.active {
  animation: activateSegment 0.5s ease-out forwards;
}

@keyframes activateSegment {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>
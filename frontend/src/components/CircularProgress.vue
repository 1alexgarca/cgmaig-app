<template>
  <div class="circular-progress-wrapper" ref="container">
    <!-- Contenedor de segmentos circulares -->
    <div class="segments-container" ref="segmentsContainer">
      <!-- Los segmentos se generan dinámicamente -->
    </div>
    
    <!-- Contenido central (input) -->
    <div class="circle-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CircularProgress",
  props: {
    value: { 
      type: Number, 
      default: 0 
    },
    max: { 
      type: Number, 
      default: 100 
    },
    isHours: { 
      type: Boolean, 
      default: false 
    }
  },
  data() {
    return {
      segments: [],
      currentMaxSegments: 20
    }
  },
  mounted() {
    this.initCircle()
    this.updateProgress()
  },
  watch: {
    value(newVal) { 
      this.updateProgress()
    },
    max(newVal) { 
      if (this.isHours && newVal > 8) {
        this.expandSegments(newVal)
      }
      this.updateProgress()
    }
  },
  methods: {
    initCircle() {
      // Determinar número inicial de segmentos
      this.currentMaxSegments = this.isHours ? 8 : 20
      this.createSegments()
    },

    createSegments() {
      const container = this.$refs.segmentsContainer
      if (!container) return

      // Limpiar segmentos existentes
      container.innerHTML = ''
      this.segments = []

      const radius = 85 // Radio del círculo
      const centerX = 100 // Centro X
      const centerY = 100 // Centro Y

      for (let i = 0; i < this.currentMaxSegments; i++) {
        const segment = document.createElement('div')
        segment.className = 'segment'
        
        // Calcular ángulo para distribuir uniformemente
        const angle = (i / this.currentMaxSegments) * 360 - 90 // -90 para empezar arriba
        const radian = (angle * Math.PI) / 180
        
        // Calcular posición
        const x = centerX + radius * Math.cos(radian)
        const y = centerY + radius * Math.sin(radian)
        
        // Posicionar y rotar el segmento
        segment.style.left = (x - 4) + 'px'
        segment.style.top = (y - 10) + 'px'
        segment.style.transform = `rotate(${angle + 90}deg)`
        
        container.appendChild(segment)
        this.segments.push(segment)
      }
    },

    expandSegments(newMax) {
      if (this.isHours && newMax > 8) {
        // Calcular nuevos segmentos necesarios
        const newSegmentCount = Math.max(8, Math.ceil(newMax / 8) * 8)
        if (newSegmentCount > this.currentMaxSegments) {
          this.currentMaxSegments = newSegmentCount
          this.createSegments()
        }
      }
    },

    updateProgress() {
      if (this.segments.length === 0) return

      const maxValue = this.isHours ? Math.max(this.max, 8) : this.max
      const percentage = Math.min(100, (this.value / maxValue) * 100)
      const activeSegments = Math.ceil((percentage / 100) * this.segments.length)
      
      this.segments.forEach((segment, index) => {
        segment.classList.remove('active', 'hours-active')
        if (index < activeSegments) {
          segment.classList.add(this.isHours ? 'hours-active' : 'active')
        }
      })
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
  border-radius: 4px;
  background-color: #e9ecef;
  transform-origin: center bottom;
  transition: all 0.3s ease;
}

.segment.active {
  background: linear-gradient(135deg, #007bff, #0056b3);
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.4);
}

.segment.hours-active {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.4);
}

.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid #f8f9fa;
  z-index: 1;
}
</style>
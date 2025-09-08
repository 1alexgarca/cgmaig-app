<template>
  <div class="content-view">
    <!-- Header Section -->
    <div class="header-section mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title mb-1">Perfil de Usuario</h2>
          <p class="page-subtitle">Gestiona tu información personal y configuración de seguridad</p>
        </div>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 class="card-title fw-bold text-dark mb-1">Información del Perfil</h4>
                <p class="card-text text-muted">Actualiza tu información personal y foto de perfil</p>
              </div>
              <button 
                type="button" 
                class="btn btn-outline-primary"
                @click="$refs.fileInput.click()"
              >
                <i class="bi bi-camera me-2"></i>
                Cambiar Imagen
              </button>
              <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" hidden>
            </div>

            <div class="row align-items-center">
              <div class="col-md-3 text-center">
                <div class="profile-image-container mb-3">
                  <img 
                    :src="imagenUrl" 
                    class="profile-image"
                    alt="Perfil de Usuario"
                  >
                  <div class="profile-overlay">
                    <i class="bi bi-camera text-white fs-4"></i>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="vistaActual = 'seguridad'"
                >
                  <i class="bi bi-shield-lock me-1"></i>
                  Cambiar Contraseña
                </button>
              </div>

              <div class="col-md-9">
                <div class="row">
                  <div class="col-md-6">
                    <div class="department-info">
                      <h6 class="text-muted fw-semibold mb-2">Dirección General</h6>
                      <p class="fw-semibold text-dark mb-1">Dirección General de Enlace Institucional de Tecnologías de la Información y Comunicaciones</p>
                      <p class="text-muted mb-0">Secretaría de Administración y Finanzas</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="user-stats">
                      <div class="stat-item">
                        <i class="bi bi-person-check text-primary"></i>
                        <span class="ms-2">Usuario verificado</span>
                      </div>
                      <div class="stat-item">
                        <i class="bi bi-envelope text-primary"></i>
                        <span class="ms-2">{{ email }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Tabs -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs nav-underline mb-4">
              <li class="nav-item">
                <a class="nav-link fw-semibold" :class="{ 'active': vistaActual === 'datosPersonales' }" 
                   @click="vistaActual = 'datosPersonales'">
                  <i class="bi bi-person me-2"></i>
                  Datos Personales
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link fw-semibold" :class="{ 'active': vistaActual === 'seguridad' }" 
                   @click="vistaActual = 'seguridad'">
                  <i class="bi bi-shield-lock me-2"></i>
                  Seguridad
                </a>
              </li>
            </ul>

            <!-- Datos Personales Form -->
            <div v-if="vistaActual === 'datosPersonales'" class="tab-content">
              <form @submit.prevent="handleSubmit">
                <h5 class="fw-bold text-dark mb-4">Información Personal</h5>
                
                <div class="row g-3 mb-4">
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Nombre</label>
                    <input v-model="nombre" type="text" class="form-control border" placeholder="Ingresa tu nombre">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Apellido Paterno</label>
                    <input v-model="paterno" type="text" class="form-control border" placeholder="Apellido paterno">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Apellido Materno</label>
                    <input v-model="materno" type="text" class="form-control border" placeholder="Apellido materno">
                  </div>
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Número de Celular</label>
                    <input v-model="telefono" type="text" class="form-control border" placeholder="Número de contacto">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Correo Electrónico</label>
                    <input v-model="email" type="email" class="form-control border" disabled>
                    <small class="text-muted">El correo electrónico no puede ser modificado</small>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary">
                    <i class="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-circle me-2"></i>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            <!-- Seguridad Form -->
            <div v-if="vistaActual === 'seguridad'" class="tab-content">
              <form @submit.prevent="cambiarPassword">
                <h5 class="fw-bold text-dark mb-4">Configuración de Seguridad</h5>
                <input type="text" name="username" autocomplete="username" style="display: none;">

                <div class="row g-3 mb-4">
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Contraseña Actual</label>
                    <input 
                      v-model="form.actual"
                      type="password"
                      class="form-control border"
                      placeholder="Ingresa tu contraseña actual"
                      autocomplete="current-password"
                      @input="verificarPasswordActual"
                    >
                    <small v-if="passwordValida === false" class="text-danger">
                      <i class="bi bi-exclamation-circle me-1"></i>
                      Contraseña incorrecta
                    </small>
                    <small v-if="passwordValida === true" class="text-success">
                      <i class="bi bi-check-circle me-1"></i>
                      Contraseña válida
                    </small>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Nueva Contraseña</label>
                    <input 
                      type="password"
                      v-model="form.nueva"
                      placeholder="Crea una nueva contraseña"
                      autocomplete="new-password"
                      class="form-control border"
                    >
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Repetir Contraseña</label>
                    <input 
                      type="password" 
                      class="form-control border"
                      placeholder="Confirma tu nueva contraseña"
                      autocomplete="new-password"
                      v-model="form.repetir"
                    >
                    <small v-if="form.nueva && form.nueva !== form.repetir" class="text-danger">
                      <i class="bi bi-exclamation-circle me-1"></i>
                      Las contraseñas no coinciden
                    </small>
                    <small v-if="form.nueva && form.nueva === form.repetir" class="text-success">
                      <i class="bi bi-check-circle me-1"></i>
                      Las contraseñas coinciden
                    </small>
                  </div>
                </div>

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  Asegúrate de que tu nueva contraseña sea segura y diferente a la anterior.
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary" @click="vistaActual = 'datosPersonales'">
                    <i class="bi bi-arrow-left me-2"></i>
                    Volver
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="!formularioValido">
                    <i class="bi bi-shield-check me-2"></i>
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import defaultImage from '@/assets/perfil.webp'
import { useToast } from 'vue-toastification'
import CustomToast from './CustomToast.vue'
import { h, useId } from 'vue'

const user = JSON.parse(localStorage.getItem('user'))
const toast = useToast()
const userId = user?.id

export default {
  name: 'PerfilView',
  components: {
    CustomToast
  },
  data() {
    return {
      vistaActual: 'datosPersonales',
      selectedImage: null,
      imagenUrl: '',
      nombre: user.name || '',
      paterno: user.paterno || '',
      materno: user.materno || '',
      email: user.email || '',
      telefono: user.telefono || '',
      imagen: user.imagen || defaultImage,
      form: {
        actual: '',
        nueva: '',
        repetir: ''
      },
      passwordValida: null
    };
  },
  computed: {
    formularioValido() {
      return (
        this.passwordValida &&
        this.form.nueva &&
        this.form.nueva !== this.form.actual &&
        this.form.nueva === this.form.repetir
      )
    }
  },
  mounted(){
    if (user && user.imagen) {
      this.imagenUrl = `http://localhost:4001${user.imagen}`;
    } else {
      this.imagenUrl = defaultImage
    }
  },
  methods: {
    async handleFileChange(event) {
      const file = event.target.files[0]

      if (!file) return

      const formData = new FormData()
      formData.append('imagen', file)

      try {
        const res = await axios.post(`http://localhost:4001/api/usuarios/${user.id}/imagen`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', 
          }
        })
        const nuevaRuta = res.data.ruta

        this.imagenUrl = `http://localhost:4001${nuevaRuta}`;
        localStorage.setItem('user', JSON.stringify({ ...user, imagen: nuevaRuta }));
        
        toast.success(
          h(CustomToast, {
            title: 'Imagen actualizada',
            message: 'Tu foto de perfil se ha actualizado correctamente'
          })
        )
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'No se pudo actualizar la imagen'
          })
        )
      }
    },
    async handleSubmit() {
      try {
        const payload = {
          nombre: this.nombre,
          paterno: this.paterno,
          materno: this.materno,
          email: this.email,
          telefono: this.telefono
        }
        const response = await fetch(`http://localhost:4001/api/usuarios/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        })

        if(!response.ok) {
          const errorData = await response.json()
          if (response.status === 400) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'Error al actualizar los datos'
              })
            )
          }
          throw new Error(errorData.error || 'Error al actualizar los datos')
        }
        
        const updatedUser = { ...user, ...payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success(
          h(CustomToast, {
            title: 'Datos actualizados',
            message: 'Tu información personal se ha guardado correctamente'
          })
        )
      } catch (error) {
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'Error al guardar los datos'
          })
        )
      }
    },
    async verificarPasswordActual() {
      if (!this.form.actual) {
        this.passwordValida = null;
        return;
      }
      
      const res = await fetch(`http://localhost:4001/api/usuarios/verificar-password/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.form.actual })
      })
      const data = await res.json()
      this.passwordValida = data.esValida
    },
    async cambiarPassword() {
      if (!this.passwordValida) {
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'La contraseña actual no es válida'
          })
        )
        return
      }
      if (this.form.nueva !== this.form.repetir) {
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'Las contraseñas nuevas no coinciden'
          })
        )
        return
      }
      
      const res = await fetch(`http://localhost:4001/api/usuarios/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: this.form.actual,
          newPassword: this.form.nueva
        })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success(
          h(CustomToast, {
            title: 'Contraseña actualizada',
            message: 'Tu contraseña se ha cambiado correctamente'
          })
        )
        this.form = { actual: '', nueva: '', repetir: '' }
        this.passwordValida = null
      } else {
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'No se pudo cambiar la contraseña'
          })
        )
      }
    }
  }
};
</script>

<style scoped>
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --primary-light: #dbeafe;
    --success-color: #10b981;
    --success-light: #d1fae5;
    --warning-color: #f59e0b;
    --warning-light: #fef3c7;
    --info-color: #06b6d4;
    --info-light: #cffafe;
    --danger-color: #ef4444;
    --danger-light: #fee2e2;
    --secondary-color: #6b7280;
    --light-bg: #f8fafc;
    --border-color: #e5e7eb;
    --border-radius: 12px;
    --border-radius-sm: 8px;
    --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s ease;
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

/* Header Section */
.header-section {
    background: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
}

.page-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 2rem;
}

.page-subtitle {
    font-size: 1.1rem;
    margin-bottom: 0;
    color: var(--secondary-color);
}

/* Card Styles */
.card {
    border-radius: var(--border-radius);
    transition: var(--transition);
}

.card:hover {
    box-shadow: var(--box-shadow-lg);
}

/* Profile Image */
.profile-image-container {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
}

.profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition);
}

.profile-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition);
}

.profile-image-container:hover .profile-overlay {
    opacity: 1;
}

.profile-image-container:hover .profile-image {
    transform: scale(1.1);
}

/* Department Info */
.department-info {
    background: var(--light-bg);
    padding: 1.5rem;
    border-radius: var(--border-radius-sm);
    border-left: 4px solid var(--primary-color);
}

/* User Stats */
.user-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.stat-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background: var(--light-bg);
    border-radius: var(--border-radius-sm);
    font-weight: 500;
}

/* Navigation Tabs */
.nav-tabs {
    border-bottom: 2px solid var(--border-color);
}

.nav-link {
    color: var(--secondary-color);
    font-weight: 500;
    padding: 1rem 1.5rem;
    border: none;
    transition: var(--transition);
}

.nav-link:hover {
    color: var(--primary-color);
    background: var(--primary-light);
}

.nav-link.active {
    color: var(--primary-color);
    border-bottom: 3px solid var(--primary-color);
    background: transparent;
}

/* Form Styles */
.form-label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-control {
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    padding: 0.75rem 1rem;
    transition: var(--transition);
}

.form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control:disabled {
    background-color: #f9fafb;
    color: #6b7280;
}

/* Button Styles */
.btn {
    border-radius: var(--border-radius-sm);
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: var(--transition);
}

.btn-primary {
    background:  rgb(105, 28, 32);
    border: 2px rgb(105, 28, 32);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-outline-primary {
    border: 2px rgb(105, 28, 32) !important;
    color: rgb(105, 28, 32);
}

.btn-outline-primary:hover {
    background: rgb(105, 28, 32);
    color: white;
}

/* Alert Styles */
.alert {
    border-radius: var(--border-radius-sm);
    border: none;
    padding: 1rem 1.5rem;
}

.alert-info {
    background: var(--info-light);
    color: var(--info-color);
    border-left: 4px solid var(--info-color);
}

/* Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.header-section,
.card {
    animation: fadeInUp 0.6s ease forwards;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }

/* Responsive Design */
@media (max-width: 768px) {
    .content-view {
        padding: 1rem;
    }
    
    .header-section {
        padding: 1.5rem;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .profile-image-container {
        width: 120px;
        height: 120px;
        margin-bottom: 1.5rem;
    }
    
    .department-info {
        margin-bottom: 1.5rem;
    }
    
    .nav-link {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 576px) {
    .btn {
        width: 100%;
        margin-bottom: 0.5rem;
    }
    
    .d-flex.justify-content-end {
        flex-direction: column;
    }
}
</style>

<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="content-wrapper">
      <div class="logo-section">
        <!-- <img src="@/assets/3.png" alt="Equipo de trabajo" class="logo-img" /> -->
        <h1 class="app-title text-gob">Sistema de Gestión y Control de Actividades</h1>
        <p class="text-gob fw-bold">Gobierno del estado de Tabasco</p>
      </div>
      <div class="login-form">
        <!-- login form -->
         <div v-if="!showRegister">
            <div class="form-header">
              <h2 class="form-title text-gob">Bienvenido</h2>
              <p class="form-subtitle">Inicia sesión para gestionar tus actividades</p>
            </div>
              <form @submit.prevent="handleLogin">
                <div class="input-group animated-input">
                  <input 
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="Correo electrónico" 
                  class="form-control custom-input"/>
                  <span class="input-icon"><i class="bi bi-envelope-fill"></i></span>
                </div>
                <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>

                <div class="input-group animated-input">
                  <input 
                  v-model="loginForm.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Contraseña" 
                  class="form-control mt-2 custom-input"/>
                  <span class="input-icon" @click="togglePassword" role="button">
                    <i :class="showPassword ? 'bi bi-eye-slash-fill': 'bi bi-eye-fill'"></i>
                  </span>

                </div>
                <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>

                <div class="forgot-password mt-3">
                  <!-- <router-link to="/recover-password" class="text-pass">¿Olvidaste tu contraseña?</router-link> -->
                </div>
                <div v-if="errors.server" class="text-danger mt-2">{{ errors.server }}</div>

                <button type="submit" class="btn btn-custom-login bg-gob mt-3 w-100">Iniciar sesión</button>
              </form>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const showRegister = ref(false)
const showPassword = ref(false)
const errors = ref({})

// Formularios reactivos
const loginForm = reactive({
  email: '',
  password: ''
})


function togglePassword() {
  showPassword.value = !showPassword.value
}

function validateLogin() {
  errors.value = {}
  if (!loginForm.email) errors.value.email = 'Correo requerido.'
  if (!loginForm.password) errors.value.password = 'Contraseña requerida.'
  return Object.keys(errors.value).length === 0
}


async function handleLogin() {
  if (!validateLogin()) return

  try {
    const res = await fetch('http://localhost:4001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })

    if (!res.ok) {
      const err = await res.json()
      errors.value.server = err.error || 'Error de login'
      return
    }

    const data = await res.json()
    localStorage.setItem('user', JSON.stringify(data.user))
    auth.login(data.user, 'token-demo')
    router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    errors.value.server = 'Servidor no disponible'
  }
}



</script>


<style scoped>
.text-gob {
  color: rgb(221, 201, 163);
}

.bg-gob {
  background-color: rgb(118, 19, 59);
}
.text-pass{
  color: rgb(118, 19, 59);
}
.bg-register {
  background-color: rgb(1890, 19, 59, 0.5);
}

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(118, 19, 59);
  /* background: linear-gradient(135deg, #1e3c72, #2a5298); */
  position: relative;
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/escudosegob.png') repeat;
  opacity: 0.1;
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  gap: 40px;
}

.logo-section {
  text-align: center;
  /* color: #fff; */
  animation: fadeIn 1.5s ease-in-out;
}

.logo-img {
  width: 500px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-top: 15px;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  animation: slideIn 1s ease-out;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 1.5rem;
  /* color: #2a5298; */
  font-weight: 600;
}

.form-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.animated-input {
  position: relative;
  margin-bottom: 15px;
}

.custom-input {
  border: none;
  border-bottom: 2px solid #dee2e6;
  border-radius: 0;
  padding: 10px 40px 10px 10px;
  font-size: 1rem;
  transition: border-bottom 0.3s ease;
}

.input-groupR.animated-inputR {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.custom-inputR {
  border: none;
  border-bottom: 2px solid #dee2e6;
  border-radius: 0;
  padding: 10px 10px 10px 40px; /* Padding izquierdo suficiente para el ícono */
  font-size: 1rem;
  transition: border-bottom 0.3s ease;
  width: 100%; /* Asegura que ocupe todo el espacio disponible */
  box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
}
.custom-inputB {
  border: none;
  border-bottom: 2px solid #dee2e6;
  border-radius: 0;
  padding: 10px 10px 10px 10px; /* Padding izquierdo suficiente para el ícono */
  font-size: 1rem;
  transition: border-bottom 0.3s ease;
  width: 100%; /* Asegura que ocupe todo el espacio disponible */
  box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
}

.custom-inputR:focus {
  border-bottom: 2px solid #2a5298;
  outline: none;
  box-shadow: none;
}

.input-iconR {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1; /* Asegura que el ícono esté sobre el input */
  pointer-events: none; /* Evita que el ícono interfiera con clics en el input */
}

.custom-input:focus {
  border-bottom: 2px solid #2a5298;
  outline: none;
  box-shadow: none;
}

.input-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
}



.input-icon:hover {
  color: #2a5298;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.btn-custom-login {
  /* background: linear-gradient(45deg, #2a5298, #1e3c72); */
  color: #fff;
  border: none;
  padding: 10px 20px;
  width: 100%;
  font-weight: 500;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-custom-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(42, 82, 152, 0.5);
}

.signup-prompt {
  text-align: center;
  color: #6c757d;
}

.signup-prompt a {
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>

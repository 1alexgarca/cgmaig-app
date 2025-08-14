import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcrypt'
import multer from 'multer';
import path from 'path';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/es.js';
import { json } from 'stream/consumers';
import es from 'dayjs/locale/es.js';

dayjs.extend(relativeTime);
dayjs.locale('es');

const app = express();


const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const storage = multer.diskStorage({
  destination: './uploads/usuarios',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `usuario_${req.params.id}${ext}`)
  }
})

const upload = multer({ storage })

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use( express.json()); 
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 4001;


//------------------- LOGIN ------------------- //

// Login
app.post('/api/login', async (req, res) => {
    const  { email, password } = req.body

    try {
        const [rows] = await pool.query(`
          SELECT u.*, d.nombre_dependencia
          FROM usuarios u
          LEFT JOIN dependencias d ON u.dependencia_id = d.id_dependencia
          WHERE u.email = ?`,
            [email]
        )
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }
        const user = rows[0]
        
        const isMatch = await bcrypt.compare(password, user.password_hash)
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' })
        }

        if (user.rol !== 'trabajador') {
          return  res.status(403).json({ error: 'Acceso denegado: usuario no autorizado' })
        }


        res.json({
            message: 'Inicio de sesión éxitoso',
            user: {
                id: user.id_user,
                name: user.nombre,
                paterno: user.paterno,
                materno: user.materno,
                email: user.email,
                rol: user.rol,
                telefono: user.telefono,
                imagen: user.imagen,
                dependencia: user.nombre_dependencia
            }
        })
    } catch (error) {
        console.error('Error en el inicio de sesión', error)
        res.status(500).json({ error: 'Error al iniciar sesión' })
    }
}) 



//------------------- CONSULTA DEL DASHBOARD ------------------- //

// Consultas para los cards superiores
app.get('/api/dashboard/estadisticas/:id_usuario', async (req, res) => {
    const  { id_usuario} = req.params
    try {
        const [result] = await pool.query(`
            SELECT
                COUNT(CASE WHEN avance = 100 THEN 1 END) AS tareasCompletadas,
                COUNT(CASE WHEN avance < 100 AND DATE(fecha_limite) < CURDATE() THEN 1 END) AS tareasNoCompletadas,
                COUNT(CASE WHEN avance < 100 AND DATE(fecha_limite) = CURDATE() THEN 1 END) AS tareasPorVencer,
                COUNT(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 END) AS nuevasAsignaciones
            FROM actividades WHERE usuario_asignado = ? 
        `, [id_usuario])
        res.json(result[0])
    } catch (error) {
        console.error('Error al obtener actividades:', error.message)
        res.status(500).json({ error: 'Error al obtener actividades' })
    }
})

// Consulta para diagrama de dona
app.get('/api/dashboard/estado-tareas/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params
    try {
        const [result] = await pool.query(`
            SELECT
                SUM(CASE WHEN avance = 100 THEN 1 ELSE 0 END) AS terminadas,
                SUM(CASE WHEN avance > 0 AND avance < 100 THEN 1 ELSE 0 END) AS en_proceso,
                SUM(CASE WHEN avance = 0 THEN 1 ELSE 0 END) AS pendientes
            FROM actividades WHERE usuario_asignado = ?
        `, [id_usuario])
        res.json(result[0])
    } catch (error) {
        console.error('Error al obtener estado de tareas:', error.message)
        res.status(500).json({ error: 'Error al obtener estado de tareas' })
    }
})

// Consulta para diagrama de línea
app.get('/api/dashboard/actividad-por-dia/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params
    try {
        const [result] = await pool.query(`
            SELECT 
                DATE(r.fecha_actualizacion) AS fecha,
                COUNT(*) AS total
            FROM registro_actividad r
            JOIN actividades a ON a.id_activities = r.id_actividad
            WHERE r.avance = 100 AND a.usuario_asignado = ?
            GROUP BY DATE(r.fecha_actualizacion)
            ORDER BY fecha DESC
        `, [id_usuario])
        res.json(result) 
    } catch (error) {
        console.error('Error al obtener actividades por dia:', error.message)
        res.status(500).json({ error: 'Error al obtener usuarios por día'})
    }
})



//------------------- CONSULTAS PARA EL MODULO DE ACTIVIDADES ------------------- //

// Consulta para cargar actualizaciones de la tabla al abrir el offcanvas
app.get('/api/actualizaciones/:id_actualizacion', async (req, res) => {
  const { id_actualizacion } = req.params;
  try {
    const [rows] = await pool.query(`
        SELECT a.id_activities, a.actividad, 
              r.avance, r.horas_trabajadas, r.fecha_actualizacion
        FROM actividades a
        JOIN registro_actividad r ON a.id_activities = r.id_actividad
        WHERE a.id_activities = ?
        ORDER BY r.fecha_actualizacion DESC
    `, [id_actualizacion]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actualizaciones:', error.message);
    res.status(500).json({ error: 'Error al obtener actualizaciones' });
  }
})

// Consulta para cargar las actividades de los cards { Asignaciones, En progreso, Completadas }
app.get('/api/actividades/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT
        a.id_activities,
        a.actividad,
        a.descripcion,
        a.avance,
        a.prioridad,
        a.fecha_creacion,
        a.fecha_limite,
        IFNULL(SUM(r.horas_trabajadas), 0) AS horas_trabajadas
      FROM actividades a
      LEFT JOIN registro_actividad r ON a.id_activities = r.id_actividad
      WHERE a.usuario_asignado = ? AND a.estado NOT IN ('pendiente', 'rechazada')
      GROUP BY a.id_activities
    `, [id_usuario]);

    const asignaciones = [];
    const enProgreso = [];
    const completadas = [];

    rows.forEach(row => {
      if (row.avance === 0) {
        asignaciones.push(row);
      } else if (row.avance >= 0 && row.avance < 100) {
        enProgreso.push(row);
      } else if (row.avance === 100) {
        completadas.push(row);
      }
    });

    res.json({
      asignaciones,
      enProgreso,
      completadas
    });

  } catch (error) {
    console.error('Error al obtener actividades:', error.message);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

// GET Para validar si se cumplieron 8 hrs en el día
app.get('/api/usuarios/:id/horas-hoy', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT SUM(r.horas_trabajadas) AS total_horas
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = ?
      AND DATE(r.fecha_actualizacion) = CURDATE()
    `, [id]);

    res.json({ total_horas: rows[0].total_horas || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar horas del día' });
  }
});

// POST Para guardar una nueva actividad
app.post('/api/tasks', async (req, res) => {
  const {
    usuario_id,
    proyecto_id,
    actividad,
    descripcion,
    prioridad,
    usuario_creador,
    avance,
    horas
  } = req.body;

  if (!prioridad || !actividad || !proyecto_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const connection = await pool.getConnection(); // Para transacción

  try {
    await connection.beginTransaction();

    // Insertar en actividades
    const [result] = await connection.query(
      `INSERT INTO actividades (
        proyecto, actividad, descripcion, prioridad,
        fecha_limite, usuario_asignado, avance, horas_trabajadas, estado
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, 'aceptada')`,
      [proyecto_id, actividad, descripcion, prioridad, usuario_creador, avance, horas]
    );

    const idActividad = result.insertId;

    // Insertar en registro_actividad
    await connection.query(
      `INSERT INTO registro_actividad (id_actividad, avance, horas_trabajadas, fecha_actualizacion)
       VALUES (?, ?, ?, NOW())`,
      [idActividad, avance, horas]
    );

    await connection.commit();

    res.status(201).json({
      id_activities: idActividad,
      usuario_id,
      proyecto_id,
      actividad,
      descripcion,
      prioridad,
      fecha_creacion: new Date().toISOString(),
      usuario_creador
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al asignar actividad y registrar avance:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'No se pudo asignar, entrada duplicada' });
    } else {
      res.status(500).json({ error: `Fallo al asignar actividad: ${error.message}` });
    }

  } finally {
    connection.release();
  }
});

// GET Para mostrar datos en el modal de las actividades completas
app.get('/api/actividades/:id/detalles', async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id_activities,
        a.actividad,
        a.descripcion,
        a.fecha_limite,
        a.prioridad,
        a.avance,
        p.name_proyect AS name_proyect,
        CONCAT(u.nombre, ' ', u.paterno, ' ', u.materno) AS asignador,
        ra.avance AS avance_registro,
        ra.horas_trabajadas
      FROM actividades a
      JOIN proyectos p ON a.proyecto = p.id_proyecto
      LEFT JOIN usuarios u ON a.usuario_creador = u.id_user
      LEFT JOIN registro_actividad ra ON a.id_activities = ra.id_actividad
      WHERE a.id_activities = ?
    `, [id])

  // Verificar si hay registros
  if (rows.length === 0) return res.status(404).json({ message: ' Actividad no encontrada' })

  // Agrupar datos generales y registros 
  const actividad = {
    id: rows[0].id_activities,
    actividad: rows[0].actividad,
    descripcion: rows[0].descripcion,
    fecha_limite: rows[0].fecha_limite,
    prioridad: rows[0].prioridad,
    avance: rows[0].avance,
    proyecto: rows[0].name_proyect,
    asignador: rows[0].asignador,
    actualizaciones: [],
    totalHoras: 0
  }

  rows.forEach(r => {
    actividad.actualizaciones.push({
      fecha: r.fecha,
      avance: r.avance_registro,
      horas: r.horas_trabajadas
    })
    actividad.totalHoras += r.horas_trabajadas || 0
  })

  res.json(actividad)

  } catch (error) {
    console.error(error)
  }
})

// SELECT Para mostrar proyectos dentro del formulario de nueva actividad
app.get('/api/project', async (req, res) => {
  try {
    const [project] = await pool.query(
      `SELECT
        id_proyecto as id_project,
        name_proyect as name_project,
        descripcion as description 
        FROM proyectos`
    )
    res.json(project)
  } catch (error) {
    console.error('Error fetching projects:', error.message)
    res.status(500).json({ error: 'Error al obtener proyectos'})
  }
})

// Para actualizar el avance de una actividad en el offcanvas
app.put('/api/actividades/:id_activities/avance', async (req, res) => {
  const { id_activities } = req.params;
  const { avance, horas_trabajadas } = req.body;

  try {
    // Actualiza avance y horas totales en la tabla actividades
    await pool.query(`
      UPDATE actividades
      SET avance = ?, horas_trabajadas = ?
      WHERE id_activities = ?
    `, [avance, horas_trabajadas, id_activities]);

    // Registra el avance en la tabla de historial
    await pool.query(`
      INSERT INTO registro_actividad (id_actividad, avance, horas_trabajadas)
      VALUES (?, ?, ?)
    `, [id_activities, avance, horas_trabajadas]);

    res.json({ message: 'Actualizado y registrado con éxito' });
  } catch (error) {
    console.error('Error SQL:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/api/actividades/:id/registro', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT avance, horas_trabajadas, fecha_actualizacion
      FROM registro_actividad
      WHERE id_actividad = ?
      ORDER BY fecha_actualizacion DESC
    `, [id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de actividad' });
  }
});



//------------------- CONSULTAS PARA EL MODULO PERFIL ------------------- //

// INSERT Para guardar imagen de perfil
app.post('/api/usuarios/:id/imagen', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    console.log('No se recibió archivo');
    return res.status(400).json({ error: 'No se recibió archivo' });
  }

  const ruta = `/uploads/usuarios/${req.file.filename}`;

  try {
    await pool.query('UPDATE usuarios SET imagen = ? WHERE id_user = ?', [ruta, id]);
    res.json({ success: true, ruta });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// Para actualizar datos del usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, paterno, materno, email, telefono } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE usuarios SET nombre = ?, paterno = ?, materno = ?, email = ?, telefono = ? WHERE id_user = ?`,
      [nombre, paterno, materno, email, telefono, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Consultar datos actualizados
    const [rows] = await pool.query(`SELECT * FROM usuarios WHERE id_user = ?`, [id]);

    res.json({ message: 'Usuario actualizado con éxito', updatedData: rows[0] });
  } catch (error) {
      console.error('Error al actualizar usuario:', error.message, error.stack);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar password actual
app.post('/api/usuarios/verificar-password/:id', async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_user = ?',  [id])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }
    const user = rows[0]
    const esValida = await bcrypt.compare(password, user.password_hash)
    res.json({ success: true, esValida })
  } catch (error) {
    console.error('Error al verificar la contraseña:', error)
    res.status(500).json({ success: false, message: 'Errir del servidor' })
  }
})

// Actualizar contraseña
app.put('/api/usuarios/:id/password', async (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword } = req.body

  try {
    const [rows] = await pool.query('SELECT password_hash FROM usuarios WHERE id_user = ?', [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    const hashedPassword = rows[0].password_hash

    console.log('* Contraseña ingresada en el input:', currentPassword)
    console.log('* Hash en la BD', hashedPassword)

    const isMatch = await bcrypt.compare(currentPassword, hashedPassword)
    console.log('* Coinciden', isMatch)

    if(!isMatch) {
      return res.status(401).json({ success: false, message: 'La contraseña actual no es correcta' })
    }
    const saltRounds = 10
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds)
    await pool.query('UPDATE usuarios SET password_hash = ? WHERE id_user = ?', [newHashedPassword, id])
    return res.status(200).json({ success: true, message: 'Contraseña actializada con correctamente' })
  
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error)
    return res.status(500).json({ success: false, message: 'Error en el servidor' })
  } 
}) 


// ------------------- CONSULTAS PARA PARA NOTIFICACIONES ------------------- //

// Obtener notificaciones por usuario (opcion de filtrar no leidas)
app.get('/api/notificaciones/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params
  const { noLeidas } = req.query

  const query = `
    SELECT * FROM notificaciones
    WHERE usuario_id = ?
    ${noLeidas === 'true' ? 'AND leido = 0' : ''}
    ORDER BY fecha DESC
  `

  try {
    const [rows] = await pool.query(query, [idUsuario])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones' })
  }
})

// Marcar notificación como leída
app.put('/api/notificaciones/:id/leida', async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('UPDATE notificaciones SET leido = 1 WHERE id_push = ?',  [id])
    res.json({ message: 'Notificación marcada como leída' })
  } catch (err) {
    res.status(500).json({ errot: 'Error al actualizar notificación' })
  }
})

//Contador de no leídas
app.get('/api/notificaciones/:idUsuario/contador', async (req, res) => {
  const { idUsuario } = req.params

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leido = 0',
      [idUsuario]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener contador' })
  }
})

// Obtener notificaciones agrupadas por leídas y no leídas
app.get('/api/notificaciones/:idUsuario/agrupadas', async (req, res) => {
  const { idUsuario } = req.params

  const query = `
    SELECT
      n.id_push,
      n.usuario_id,
      n.mensaje,
      n.tipo,
      n.leido,
      n.fecha,
      n.respuesta,
      n.pospuesta,
      u_creador.nombre AS nombre_creador,
      u_creador.paterno AS paterno_creador,
      a.prioridad,
      a.actividad
    FROM notificaciones n
    LEFT JOIN usuarios u_creador ON n.id_creador = u_creador.id_user
    LEFT JOIN actividades a ON n.id_actividad = a.id_activities
    WHERE n.usuario_id = ?
    ORDER BY n.fecha DESC
  `

  try {
    const [rows] = await pool.query(query, [idUsuario])

    const notificacionesConTiempo = rows.map(n => ({
      ...n,
      tiempo: dayjs(n.fecha).fromNow()
    }))

    const now = new Date()
    const agrupadas = {
      noLeidas: notificacionesConTiempo.filter(n => n.leido === 0 && (n.tipo !== 'vencimiento' || !n.pospuesta || new Date(n.pospuesta) <= now)),
      leidas: notificacionesConTiempo.filter(n => n.leido === 1),
      pospuestas: notificacionesConTiempo.filter(n => n.tipo === 'vencimiento' && n.pospuesta && new Date(n.pospuesta) > now)
    }

    res.json(agrupadas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener notificaciones agrupadas' })
  }
})

// Obtener y crear notificación para avisar que una actividad se vence
app.post('/api/notificaciones/vencimientos/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [actividades] = await pool.query(`
      SELECT id_activities, actividad, fecha_limite
      FROM actividades
      WHERE usuario_asignado = ? 
      AND DATE(fecha_limite) = CURDATE() + INTERVAL 1 DAY
      AND estado NOT IN ('rechazada', 'pendiente')
    `, [id])
    
    if (actividades.length === 0) {
      return res.json({ mensaje: 'No hay actividades por vencer' })
    }

    let insertadas = 0

    for (const actividad of actividades) {
      const mensaje = `La actividad "${actividad.actividad}" vence mañana.`
      
      // verificar si ya existe una notificación de vencimiento para una actividad
      const [existe] = await pool.query(`
        SELECT 1 FROM notificaciones
        WHERE usuario_id = ? AND tipo = 'vencimiento' AND mensaje = ? LIMIT 1
      `, [id, mensaje])

      if (existe.length === 0) {
        await pool.query(`
          INSERT INTO notificaciones (usuario_id, mensaje, tipo)
          VALUES (?, ? , 'Vencimiento')
        `, [id, mensaje])
        insertadas++
      }
    }
    res.json({ mensaje: 'Notificaciones creadas', total: actividades.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al generar notificaciones de vencimiento' })
  }
})

// Aceptar o rechazar actividad
app.put('/api/notificaciones/:id_push/responder', async (req, res) => {
  const { id_push } = req.params
  const { respuesta } = req.body

  try {
    await pool.query(`
      UPDATE notificaciones
      SET respuesta = ?, leido = 1
      WHERE id_push = ? AND tipo = 'asignacion'
    `, [respuesta, id_push])
    
    const [original] = await pool.query('SELECT usuario_id, id_creador, id_actividad FROM notificaciones WHERE id_push = ?', [id_push])
    const idAdmin = original[0].id_creador
    const idTrabajador = original[0].usuario_id
    const idActividad = original[0].id_actividad

    if (respuesta === 'rechazada') {
      await pool.query(`
        INSERT INTO notificaciones 
          (mensaje, tipo, usuario_id, id_creador, fecha, leido, id_actividad)
        VALUES (?, 'rechazada', ?, ?, NOW(), 0, ?)
      `, ['rechazó la actividad', idAdmin, idTrabajador, idActividad])

      await pool.query(`
        UPDATE actividades
        SET estado = 'rechazada'
        WHERE id_activities = ?
      `,[idActividad])
    }

    if (respuesta === 'aceptada') {
      await pool.query(`
        UPDATE actividades
        SET estado = 'aceptada'
        WHERE id_activities = ?      
      `, [idActividad])
    }
 
    res.json({ success: true, mensaje: 'Respuesta registrada' })
  } catch (err) {
    console.error('Error al actualizar respuesta:', err)
    res.status(500).json({ error: 'Error al actualizar respuesta' })
  }
})

// Posponer notificacion de vencimiento
app.put('/api/notificaciones/:id/posponer', async (req, res) => {
  const { id } = req.params
  const { nuevaFecha } = req.body

  if (!nuevaFecha || isNaN(Date.parse(nuevaFecha))) {
    return res.status(400).json({ error: 'Fecha inválida' })
  }

  try {
    await pool.query(
      'UPDATE notificaciones set pospuesta = ? WHERE id_push = ?', [new Date(nuevaFecha), id]
    )
    res.json({ mensaje: 'Notificación pospuesta con éxito' })
  } catch (error) {
    res.status(500).json({ error: 'Error al posponer notificación' })
  }
})



try {
    app.listen(PORT, () => {
        console.log(`Servidor en http://localhost:${PORT}`);
    });
} catch (err) {
    console.error('Error al iniciar el servidor:', err)
}

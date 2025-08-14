CREATE TABLE usuarios (
	id_user int auto_increment primary key,
    nombre varchar(50) Not null,
    email varchar(50) unique not null,
    rol enum('supervisor', 'trabajador') not null,
    password_hash varchar(100) not null,
    activo boolean default true
);

CREATE TABLE actividades (
	id_activities int auto_increment primary key,
    titulo varchar(100) not null,
    descripcion text,
    usuario_asignado int not null,
    usuario_creador int not null,
    fecha_creacion datetime default current_timestamp,
    fecha_limite datetime,
    estado enum('pendiente', 'en_progreso', 'revision', 'aprobada', 'rechazada') default 'pendiente',
    prioridad enum('urgente', 'alta', 'media', 'baja') default 'media',
    foreign key (usuario_asignado) references usuarios(id_user),
    foreign key (usuario_creador) references usuarios(id_user)
);

CREATE TABLE comentarios (
	id_comentarios int auto_increment primary key,
    actividad_id int not null,
    usuario_id int not null,
    contenido text not null,
    fecha datetime default current_timestamp,
    foreign key (actividad_id) references actividades(id_activities),
    foreign key (usuario_id) references usuarios(id_user)
);

CREATE TABLE registros_horario (
	id_horario int auto_increment primary key,
    usuario_id int not null,
    fecha date not null,
    hora_registro time not null,
    hora_salida time,
    foreign key (usuario_id) references usuarios(id_user)
);

CREATE TABLE notificaciones(
	id_push int auto_increment primary key,
    usuario_id int not null,
    mensaje text not null,
    tipo enum('asignacion', 'vencimiento', 'ajuste') not null,
    leido boolean default false,
    fecha datetime default current_timestamp,
    foreign key (usuario_id) references usuarios(id_user)
);


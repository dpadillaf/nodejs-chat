const { io } = require('../server');
const { Usuarios } = require( '../classes/usuarios' );
const { crearMensaje } = require( '../utilidades/utilidades' );

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on( 'entrarChat', ( usuario, callback ) => {

        if ( !usuario.nombre || !usuario.sala ){
            return callback( { error: true, mensaje: 'El nombre/sala es necesario' } );
        }

        client.join( usuario.sala );

        let personas = usuarios.agregarPersona( client.id, usuario.nombre, usuario.sala ); 

        client.broadcast.to( usuario.sala ).emit( 'listaPersona', usuarios.getPersonasPorSala( usuario.sala ) );
        client.broadcast.to( usuario.sala ).emit( 'crearMensaje', crearMensaje( 'Admin', `${ usuario.nombre } se unió` ) );
        
        callback( usuarios.getPersonasPorSala( usuario.sala ) );

    } );

    client.on( 'crearMensaje', ( data, callback ) => {

        let persona = usuarios.getPersona( client.id );
        let mensaje = crearMensaje( persona.nombre, data.mensaje );
        client.broadcast.to( persona.sala ).emit( 'crearMensaje', mensaje );
        callback( mensaje );

    } );

    client.on( 'disconnect', () => {

        let usuarioBorrado = usuarios.borrarPersona( client.id );

        client.broadcast.to( usuarioBorrado.sala ).emit( 'crearMensaje', crearMensaje( 'Admin', `${ usuarioBorrado.nombre } ha abandonado el chat` ) );

        client.broadcast.to( usuarioBorrado.sala ).emit( 'listaPersona', usuarios.getPersonasPorSala( usuarioBorrado.sala ) );

    } );

    client.on( 'mensajePrivado', ( data ) => {

        let persona = usuarios.getPersona( client.id );
        client.broadcast.to( data.para ).emit( 'mensajePrivado', crearMensaje( persona.nombre, data.mensaje ) );

    } )

});
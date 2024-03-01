import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { mostrarAlerta } from '../funciones.js';

const MostrarProductos = () => {
    const url='http://localhost:8080';
    const [productos, setProductos] = useState([]);
    const [id, setId] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [operacion, setOperacion] = useState(1);
    const [titulo, setTitulo] = useState('');
    const [valorTotalIntentario, setValorTotalInventario] = useState('');
    const [productoMasCaro, setProductoMasCaro] = useState('');
    const [parametroEjercicio, setParametroEjercicio] = useState('');
    const [respuestaEjercicio, setRespuestaEjercicio] = useState([]);

    const [datosSobreGatos, setDatosSobreGatos] = useState([]);
    const [datoInutil, setDatoInutil] = useState('');

    useEffect( ()=> {
        obtenerProductos();
    },[]);

    const obtenerProductos = async() => {        
        cargarDatos();
        var respuesta = await axios.get(url+'/productos');             
        setProductos(respuesta.data);    
        obtenerProductoMasCaro(respuesta.data);    
        respuesta = await axios.get(url+'/valorInventario');
        setValorTotalInventario(respuesta.data);
        
    }

    const obtenerProductoMasCaro = (listaProductos) => {
        var nombreProducto = '';
        var precio = 0;
        listaProductos.map( (p, i)=> {
            if(precio === 0){                
                precio = p.precio;
                nombreProducto = p.nombre;
            }

            if(p.precio > precio){
                precio = p.precio;
                nombreProducto = p.nombre;
            }
        });
        setProductoMasCaro(nombreProducto);
    }

    const openModal = (op,id,nombre, descripcion, precio, cantidad) => {    

        setId('');
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setCantidad('');
        setOperacion(op);
        if(op === 1){
            setTitulo('Agregar nuevo producto');
        } else if(op === 2) {
            setTitulo('Modificar nuevo producto');
            setId(id);
            setNombre(nombre);
            setDescripcion(descripcion);
            setPrecio(precio);
            setCantidad(cantidad);            
        }        
    }

    const validarCampos = () => {
        var parametros;
        var metodo;
        if(nombre.trim() === ''){
            mostrarAlerta('Debe ingresar el nombre');
        } else if(descripcion.trim() === ''){
            mostrarAlerta('Debe ingresar una descripcion');
        } else if(precio === '' || precio <= 0){
            mostrarAlerta('Debe ingresar el precio');
        } else if(cantidad === '' || cantidad <= 0){
            mostrarAlerta('Debe ingresar la cantidad');
        } else {
            if(operacion === 1){
                parametros = {
                                nombre:         nombre.trim(), 
                                descripcion:    descripcion.trim(),
                                precio:         precio,
                                cantidad:       cantidad
                            };
                metodo = "POST";            
            } else {
                parametros = {
                                id:             id,
                                nombre:         nombre.trim(), 
                                descripcion:    descripcion.trim(),
                                precio:         precio,
                                cantidad:       cantidad
                };
                metodo = "PUT";              
            }
            enviarPeticion(metodo, parametros);           
        }       
    }
    
    const ejercicioLogico = async() => {
        await axios ({method:'GET', url: url+'/ejercicioLogico/'+parametroEjercicio, data:{}}).then(function(respuesta){            
            var lista = respuesta.data;
            setRespuestaEjercicio(lista);
        })
    }

    const cargarDatos = async() => {
        var lista = [];
        var numNoticias = 2;
        var count = 0;    
        await axios ({method:'GET', url: 'https://meowfacts.herokuapp.com', data:{}}).then(function(respuesta){               
            lista.push(respuesta.data.data);
        }) 
        await axios ({method:'GET', url: 'https://meowfacts.herokuapp.com', data:{}}).then(function(respuesta){               
            lista.push(respuesta.data.data);
        })                           
        setDatosSobreGatos(lista);     
        await axios ({method:'GET', url: 'https://uselessfacts.jsph.pl/api/v2/facts/today', data:{}}).then(function(respuesta){               
            setDatoInutil(respuesta.data.text);
        })            
    }    

    const enviarPeticion = async(metodo, parametros, path='') => {
        await axios ({method:metodo, url: url+'/producto'+path, data: parametros}).then(function(respuesta){
            var tipo = respuesta.status;
            
            if(tipo === 200){
                document.getElementById('btnCerrarModal').click();
                if(metodo === 'POST'){
                    mostrarAlerta('Producto ingresado', 'success');
                } else if(metodo === 'PUT'){
                    mostrarAlerta('Producto actualizado', 'success');
                } else if(metodo === 'DELETE'){
                    mostrarAlerta('Producto eliminado', 'success');
                }
                obtenerProductos();
            }
        }).catch(function(error){
            mostrarAlerta('Error en la peticion', 'error');
            console.log(error);
        })
    }

    const eliminarProducto = (id, nombre) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title:  'Esta seguro que desea eliminar el producto '+nombre+' ?',
            icon:   'question',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si'
        }).then((result) => {
            if(result.isConfirmed){
                setId(id);
                enviarPeticion('DELETE', {}, '/'+id);                
            }
        })
    }

  return (
    <div className='App'>     
        <div className='container-fluid'>
            <span><h5>Sabias que ...</h5></span>
            <table>
                <tbody>
                    {datosSobreGatos.map( (d,i)=>(
                        <tr><td>{i+1}</td>&nbsp;<td>{d}</td></tr>
                    ))}
                </tbody>
            </table>                    
        </div>   
        <div className='container-fluid'>
            <span><h5>Dato inutil del dia</h5></span>
            <table>
                <tbody>
                    {datoInutil}
                </tbody>
            </table>                    
        </div>        
        <div className='container-fluid'>            
            <div className='row mt-3'>
                <div className='col-md-4 offset-md-4'>
                    <div className='d-grid mx-auto'>
                        <button onClick={() => openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalProductos'>
                            <i className='fa-solid fa-circle-plus'></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
                    <div className='table-responsive'>
                        <table className='table table-bordered'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Producto</th>
                                    <th>Descripcio</th>
                                    <th>Precio</th>
                                    <th>Cantidad</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className='table-group-divider'>
                                {productos.map( (p,i)=>(
                                    <tr key={p.id}>
                                        <td>{(i+1)}</td>
                                        <td>{p.nombre}</td>
                                        <td>{p.descripcion}</td>
                                        <td>{p.precio}</td>
                                        <td>{p.cantidad}</td>
                                        <td>
                                            <button onClick={() => openModal(2, p.id, p.nombre, p.descripcion, p.precio, p.cantidad)} 
                                                className='btn btn-warning' data-bs-toggle='modal' data-bs-target='#modalProductos'>
                                                <i className='fa-solid fa-edit'></i>
                                            </button>
                                            &nbsp;
                                            <button onClick={() => eliminarProducto(p.id, p.nombre)} className='btn btn-danger'>
                                                <i className='fa-solid fa-trash'></i>
                                            </button>                                            
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                        
                        <table>
                            <tbody>
                                <tr>
                                    <td>Valor del inventario: {valorTotalIntentario}</td>
                                </tr>
                                <tr>
                                    <td>Producto cuyo precio es el mayor: {productoMasCaro}</td>
                                </tr>
                            </tbody>
                        </table>
                        &nbsp;
                        <table>
                            <thead>
                                <tr><th>Ejercicio logico</th></tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>
                                    <input type='text' id='parametroEjercicio' className='form-control' placeholder='Valor' value={parametroEjercicio}
                                        onChange={(e)=> setParametroEjercicio(e.target.value)}></input>                                        
                                    </td>
                                    <td>
                                        <button onClick={() => ejercicioLogico()} className='btn btn-success'>
                                            Ejecutar
                                        </button>                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td>Resultado</td>
                                </tr>                                
                                {
                                    respuestaEjercicio.map( (r,i)=>(
                                        <tr><td>
                                        {respuestaEjercicio[i].map ( (t,j) =>(
                                            <span>&nbsp;{t}&nbsp;</span>
                                        ))
                                        }</td></tr>
                                    ))
                                }                                                             
                            </tbody>
                        </table>                        
                    </div>
                </div>
            </div>
        </div>
        <div id='modalProductos' className='modal fade'>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <label className='h5'>{titulo}</label>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' arial-label='close'></button>
                    </div>
                    <div className='modal-body'>
                        <input type='hidden' id='id'></input>
                        <div className='input-group mb-3'>                                
                                <input type='text' id='nombre' className='form-control' placeholder='Nombre' value={nombre}
                                onChange={(e)=> setNombre(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>                                
                                <input type='text' id='descripcion' className='form-control' placeholder='Descripcion' value={descripcion}
                                onChange={(e)=> setDescripcion(e.target.value)}></input>
                        </div>     
                        <div className='input-group mb-3'>                                
                                <input type='text' id='precio' className='form-control' placeholder='Precio' value={precio}
                                onChange={(e)=> setPrecio(e.target.value)}></input>
                        </div>   
                        <div className='input-group mb-3'>                                
                                <input type='text' id='cantidad' className='form-control' placeholder='Cantidad' value={cantidad}
                                onChange={(e)=> setCantidad(e.target.value)}></input>
                        </div>        
                        <div className='d-grid col-6 mx-auto'>
                            <button onClick={() => validarCampos()} className='btn btn-success'>
                                Guardar
                            </button>
                        </div>                                                          
                    </div>
                    <div className='modal-footer'>
                        <button id='btnCerrarModal' type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default MostrarProductos
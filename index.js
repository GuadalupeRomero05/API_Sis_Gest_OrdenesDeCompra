const express = require('express');//importa express
const fs = require('fs');//importa fs para leer y escribir archivos
const bodyParser = require('body-parser')
const bodyP = bodyParser.json()
const app = express();//inicializamos la app con express
app.use(bodyP); 
const port = 3000;//define el puerto donde se levanta el servidor

//funcion para leer a la bd (archivo JSON) 
const leerDatos = () => {
    try{ 
        const datos = fs.readFileSync ("./datos.json");//leer el archivo datos.json
        return JSON.parse(datos);//covierte datos en formato JSON y los retorna
    }
    catch{
        console.log(error);//muestra en consola si ocurre un error
    }
}

//funcion para escribir en la bd (archivo JSON) 
const escribir = (datos) => {
    try{ 
        fs.writeFileSync("./datos.json", JSON.stringify(datos))//escrbie los datos en formato JSON, en el archivo datos.json
    }
    catch{
        console.log(error);//muestra en consola si ocurre un error
    }
}

app.get('/', (req, res) => {
    res.send("API de Sistema de Gestión de Órdenes de Compras");//lo que se le va a mostrar al usuario apenas arranque el servidor 
});

// Orden de compra
// Muestra todas las ordenes de compra
app.get('/ListarOrdenes/:dato', (req, res) => {
    const datos = leerDatos(); // Lee los datos del archivo JSON 
    const { dato } = req.params; // Obtiene el dato desde la URL
    let ordenesFiltradas;

    if (!isNaN(dato)) {
        // Si `dato` es un número, se asume que es un DNI
        ordenesFiltradas = datos.ordenes.filter(orden => orden.dni === parseInt(dato));
        res.json(ordenesFiltradas); // Devuelve el array filtrado de órdenes de compra
    } else if (typeof dato === 'string') {
        // Si `dato` es una palabra, se asume que es el nombre de un proveedor
        ordenesFiltradas = datos.ordenes.filter(orden => orden.proveedor.toLowerCase().includes(dato.toLowerCase()));
        res.json(ordenesFiltradas); // Devuelve el array filtrado de órdenes de compra
    }else{
        const datos = leerDatos();//lee los datos del archivo JSON 
        res.json(datos.ordenes) //devuelve el array de ordenes de compra
    }
});

app.get('/ListarOrdenes/', (req, res) => { //endpoint donde se listan todas las ordenes de compras
    const datos = leerDatos();//lee los datos del archivo JSON 
    res.json(datos.ordenes) //devuelve el array de ordenes de compra
});

// Busca orden de compra por su id
app.get('/BuscarOrden/:nroOrden', (req, res) => { //endpoint donde se busca orden de compra segun su id
    const datos = leerDatos();
    const nroOrden = parseInt(req.params.nroOrden) // recupera el id puesto por parametro
    const orden = datos.ordenes.find((orden) => orden.nroOrden === nroOrden);
    if(orden){
        res.json(orden)//si encuentra el id proporcionado muestra esa orden de compra 
    }else{
        res.status(404).send("Orden de compra no encontrada.");//muestra este mensaje si no se encuentra la orden de compra                   
    }
});
// Actualizar orden de compra
app.put('/ActualizarOrden/:nroOrden', (req,res) => {
    const datos = leerDatos();
    const body = req.body; //recupera el cuerpo de la solicitud
    const nroOrden = parseInt(req.params.nroOrden)//recupera el id puesto por parametros
    const buscarIndex = datos.ordenes.findIndex((orden) => orden.nroOrden === nroOrden);//busca el id indicado en array
    datos.ordenes[buscarIndex]={//actualiza la orden con los nuevos datos
        ...datos.ordenes[buscarIndex],
        ...body,
    };
    escribir(datos);//escribe los nuevos datos en el JSON
    res.json({message: "Orden actualizada"})//lo que se le muestra al usuario
});
// Cambiar estado de orden de compra
app.delete('/EstadoOrden/:nroOrden', (req,res)=>{
    const datos = leerDatos();
    const nroOrden = parseInt(req.params.nroOrden)
    const orden = datos.ordenes.find((orden) => orden.nroOrden === nroOrden);
    if(orden){
        let estado = orden.estado;//recupera el estado de la orden
        //cambia el estado
        if (estado === "Sin entregar"){
            orden.estado = "Entregado"
            escribir(datos);//escribe los nuevos datos en el JSON
            res.json({message: "Estado cambiado"})//lo que se le muestra al usuario
        }else{
            res.status(500).send("No se puede  cambiar el estado de la orden.");//muestra este mensaje si ocurre un error y no se puede cambiar el estado
        }
    }
});
// Cargar orden de compra
app.post('/SubirOrden', (req, res) => {
    const datos = leerDatos();
    let ordenes = datos.ordenes;
    let ultimaOrden = ordenes[datos.ordenes.length-1]
    const body = req.body;
    const nuevaOrden = {
        nroOrden : ultimaOrden.nroOrden + 1, // Se le asigna un id automatico.
        ...body,
    };
    datos.ordenes.push(nuevaOrden);
    escribir(datos);
    res.json(nuevaOrden)
});

// Clientes
// muestra todos los clientes
app.get('/ListarClientes', (req, res) => {
    const datos = leerDatos();
    res.json(datos.clientes)
});
// Busca clientes por su dni
app.get('/BuscarCliente/:dni', (req, res) => {
    const datos = leerDatos();
    const dni = parseInt(req.params.dni)
    const cliente = datos.clientes.find((cliente) => cliente.dni === dni);
    if(cliente){
        res.json(cliente)
    }else{
        res.status(404).send("Cliente no encontrado.");
    }
});
// Cargar cliente
app.post('/SubirCliente', (req, res) => {
    const datos = leerDatos();
    let clientes = datos.clientes;
    let ultimoCliente = clientes[datos.clientes.length-1]
    const body = req.body;
    const nuevoCliente = {
        dni : ultimoCliente.dni + 1, // Se le asigna un id automatico.
        ...body,
    };
    datos.clientes.push(nuevoCliente);
    escribir(datos);
    res.json(nuevoCliente)
});
// Actualizar cliente
app.put('/ActualizarCliente/:dni', (req,res) => {
    const datos = leerDatos();
    const body = req.body;
    const dni = parseInt(req.params.dni)
    const buscarIndex = datos.clientes.findIndex((cliente) => cliente.dni === dni);
    datos.clientes[buscarIndex]={
        ...datos.clientes[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({message: "Actualizado"})
});
// eliminar cliente
app.delete('/EstadoCliente/:dni', (req,res)=>{
    const datos = leerDatos();
    const dni = parseInt(req.params.dni)
    const cliente = datos.clientes.find((cliente) => cliente.dni === dni);
    if(cliente){
        let estado = cliente.estado;
        if (estado === "Activo"){
            cliente.estado = "Inactivo"
        }else{
           cliente.estado = "Activo"
        }
        escribir(datos);
        res.json({message: "Estado cambiado"})
    }
});

// Productos
// muestra todos los productos 
app.get('/ListarProductos/:dato', (req, res) => {
    const datos = leerDatos(); // Lee los datos del archivo JSON
    const { dato } = req.params; // Obtiene el parámetro `dato` de la URL
    const datoLower = dato.toLowerCase(); // Convierte `dato` a minúsculas para comparación

    const productosFiltrados = datos.productos.filter(producto =>
        (producto.categoria && producto.categoria.toLowerCase().includes(datoLower)) ||
        (producto.proveedor && producto.proveedor.toLowerCase().includes(datoLower))
    );

    res.json(productosFiltrados); // Devuelve el array filtrado de productos
});


app.get('/ListarProductos/', (req, res) => {
    const datos = leerDatos();  
    res.json(datos.productos)
});
// Busca producto por su id
app.get('/BuscarProducto/:nroProducto', (req, res) => {
    const datos = leerDatos();
    const nroProducto = parseInt(req.params.nroProducto) // recupera el id puesto por parametro
    const producto = datos.productos.find((producto) => producto.nroProducto === nroProducto);
    if(producto){
        res.json(producto)
    }else{
        res.status(404).send("Producto no encontrado.");
    }
});
// Actualizar producto
app.put('/ActualizarProducto/:nroProducto', (req,res) => {
    const datos = leerDatos();
    const body = req.body;
    const nroProducto = parseInt(req.params.nroProducto)
    const buscarIndex = datos.productos.findIndex((producto) => producto.nroProducto === nroProducto);
    datos.productos[buscarIndex]={
        ...datos.productos[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({message: "Actualizado"})
});
// Cambiar estado del producto
app.delete('/EstadoProducto/:nroProducto', (req,res)=>{
    const datos = leerDatos();
    const nroProducto = parseInt(req.params.nroProducto)
    const producto = datos.productos.find((producto) => producto.nroProducto === nroProducto);
    if(producto){
        let estado = producto.estado;
        if (estado === "Sin stock"){
            producto.estado = "En stock"
        }else{
            producto.estado = "Sin stock"
        }
        escribir(datos);
        res.json({message: "Estado cambiado"})
    }
});
// Cargar producto
app.post('/SubirProducto', (req, res) => {
    const datos = leerDatos();
    let productos = datos.productos;
    let ultimoProducto = productos[datos.productos.length-1]
    const body = req.body;
    const nuevoProducto = {
        nroProducto : ultimoProducto.nroProducto + 1, // Se le asigna un id automatico.
        ...body,
    };
    datos.productos.push(nuevoProducto);
    escribir(datos);
    res.json(nuevoProducto)
});

// Proveedores
// muestra todos los proveedores 
app.get('/ListarProveedores', (req, res) => {
    const datos = leerDatos();
    res.json(datos.proveedores)
});
// Busca proveedor por su id
app.get('/BuscarProveedor/:nroProveedor', (req, res) => {
    const datos = leerDatos();
    const nroProveedor = parseInt(req.params.nroProveedor) // recupera el id puesto por parametro
    const proveedor = datos.proveedores.find((proveedor) => proveedor.nroProveedor === nroProveedor);
    if(proveedor){
        res.json(proveedor)
    }else{
        res.status(404).send("Proveedor no encontrado.");
    }
});
// Actualizar proveedor
app.put('/ActualizarProveedor/:nroProveedor', (req,res) => {
    const datos = leerDatos();
    const body = req.body;
    const nroProveedor = parseInt(req.params.nroProveedor)
    const buscarIndex = datos.proveedores.findIndex((proveedor) => proveedor.nroProveedor === nroProveedor);
    datos.proveedores[buscarIndex]={
        ...datos.proveedores[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({message: "Actualizado"})
});
// Cambiar estado del proveedor
app.delete('/EstadoProveedor/:nroProveedor', (req,res)=>{
    const datos = leerDatos();
    const nroProveedor = parseInt(req.params.nroProveedor)
    const proveedor = datos.proveedores.find((proveedor) => proveedor.nroProveedor === nroProveedor);
    if(proveedor){
        let estado = proveedor.estado;
        if (estado === "Inactivo"){
            proveedor.estado = "Activo"
        }else{
            proveedor.estado = "Inactivo"
        }
        escribir(datos);
        res.json({message: "Estado cambiado"})
    }
});
// Cargar proveedor
app.post('/SubirProveedor', (req, res) => {
    const datos = leerDatos();
    let proveedores = datos.proveedores;
    let ultimoProveedor = proveedores[datos.proveedores.length-1]
    const body = req.body;
    const nuevoProveedor = {
        nroProveedor : ultimoProveedor.nroProveedor + 1, // Se le asigna un id automatico.
        ...body,
    };
    datos.proveedores.push(nuevoProveedor);
    escribir(datos);
    res.json(nuevoProveedor)
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
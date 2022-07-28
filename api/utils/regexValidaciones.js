exports.regex = {
  texto: /^[\s\w\.\,\-áéíóúÁÉÍÓÚñÑ%$¡!¿?(){}[\]:;'"+*@]+$/,
  nombre: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ \.\,\-¡!¿?()@]*$/,
  numero: /^\d*$/,
  correo: /^[a-zA-Z0-9_\-\.]+@([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+$/,
  hora: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  telefonoFijoMovil: /^(\d{9}|\d{11})$/,
  dias: /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)*$/i,
  correlativo: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\-]*$/
};

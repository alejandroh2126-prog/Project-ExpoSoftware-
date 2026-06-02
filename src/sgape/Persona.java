package sgape;

// Clase base - Abstracción y Encapsulamiento
public abstract class Persona {
    private String nombre;
    private String apellido;
    private String cedula;

    public Persona(String nombre, String apellido, String cedula) {
        this.nombre   = nombre;
        this.apellido = apellido;
        this.cedula   = cedula;
    }

    // Getters y Setters - Encapsulamiento
    public String getNombre()   { return nombre; }
    public String getApellido() { return apellido; }
    public String getCedula()   { return cedula; }
    public void setNombre(String nombre)     { this.nombre = nombre; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public void setCedula(String cedula)     { this.cedula = cedula; }

    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }

    // Método abstracto - Polimorfismo
    public abstract String getTipoPersona();

    @Override
    public String toString() {
        return getTipoPersona() + ": " + getNombreCompleto() + " | CC: " + cedula;
    }
}
package sgape;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

// Persistencia de datos en archivos - Unidad 4 del plan
public class ArchivoDAO {

    private static final String DIR = "datos/";

    public ArchivoDAO() {
        new File(DIR).mkdirs(); // Crea la carpeta si no existe
    }

    // ── CARGOS ──────────────────────────────
    public void guardarCargos(List<Cargo> cargos, int empId) {
        String archivo = DIR + "cargos_" + empId + ".csv";
        try (PrintWriter pw = new PrintWriter(new FileWriter(archivo))) {
            for (Cargo c : cargos) pw.println(c.toCSV());
            System.out.println("✅ Cargos guardados en " + archivo);
        } catch (IOException e) {
            System.out.println("❌ Error guardando cargos: " + e.getMessage());
        }
    }

    public List<Cargo> leerCargos(int empId) {
        List<Cargo> lista = new ArrayList<>();
        String archivo = DIR + "cargos_" + empId + ".csv";
        File f = new File(archivo);
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (!linea.trim().isEmpty()) lista.add(Cargo.fromCSV(linea));
            }
        } catch (IOException e) {
            System.out.println("❌ Error leyendo cargos: " + e.getMessage());
        }
        return lista;
    }

    // ── TRABAJADORES ────────────────────────
    public void guardarTrabajadores(List<Trabajador> lista, int empId) {
        String archivo = DIR + "trabajadores_" + empId + ".csv";
        try (PrintWriter pw = new PrintWriter(new FileWriter(archivo))) {
            for (Trabajador t : lista) pw.println(t.toCSV());
            System.out.println("✅ Trabajadores guardados en " + archivo);
        } catch (IOException e) {
            System.out.println("❌ Error guardando trabajadores: " + e.getMessage());
        }
    }

    public List<Trabajador> leerTrabajadores(int empId, List<Cargo> cargos) {
        List<Trabajador> lista = new ArrayList<>();
        String archivo = DIR + "trabajadores_" + empId + ".csv";
        File f = new File(archivo);
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (!linea.trim().isEmpty())
                    lista.add(Trabajador.fromCSV(linea, cargos));
            }
        } catch (IOException e) {
            System.out.println("❌ Error leyendo trabajadores: " + e.getMessage());
        }
        return lista;
    }

    // ── EMPRENDIMIENTOS ──────────────────────
    public void guardarEmprendimientos(List<Emprendimiento> lista) {
        String archivo = DIR + "emprendimientos.csv";
        try (PrintWriter pw = new PrintWriter(new FileWriter(archivo))) {
            for (Emprendimiento e : lista) pw.println(e.toCSV());
            System.out.println("✅ Emprendimientos guardados.");
        } catch (IOException e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }

    public List<Emprendimiento> leerEmprendimientos() {
        List<Emprendimiento> lista = new ArrayList<>();
        File f = new File(DIR + "emprendimientos.csv");
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (!linea.trim().isEmpty())
                    lista.add(Emprendimiento.fromCSV(linea));
            }
        } catch (IOException e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
        return lista;
    }
}
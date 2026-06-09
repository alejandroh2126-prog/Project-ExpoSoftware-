package sgape;

import java.io.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class Estadisticas {

    // Genera un archivo HTML con gráficas Chart.js
    public static void generarReporteHTML(Emprendimiento emp,
                                          List<Producto>  productos,
                                          List<Venta>     ventas,
                                          List<Movimiento> movimientos) {
        String dir      = "reportes/";
        new File(dir).mkdirs();
        String archivo  = dir + "reporte_" + emp.getId() + "_" +
                          LocalDate.now().toString() + ".html";

        // ── datos para gráficas ──
        // Top productos más vendidos
        Map<String, Integer> vendidos = new LinkedHashMap<>();
        for (Venta v : ventas) {
            for (DetalleVenta d : v.getDetalles()) {
                vendidos.merge(d.getProductoNombre(), d.getCantidad(), Integer::sum);
            }
        }
        List<Map.Entry<String,Integer>> topVendidos = vendidos.entrySet().stream()
            .sorted((a, b) -> b.getValue() - a.getValue())
            .limit(8).collect(Collectors.toList());

        // Ventas por mes
        Map<String,Double> ventasMes = new LinkedHashMap<>();
        for (Venta v : ventas) {
            String mes = v.getFecha().length() >= 7 ? v.getFecha().substring(0,7) : v.getFecha();
            ventasMes.merge(mes, v.getTotal(), Double::sum);
        }

        // Gastos vs Ingresos
        double totalIngresos = movimientos.stream()
            .filter(m -> m.getTipo() == Movimiento.Tipo.INGRESO ||
                         m.getTipo() == Movimiento.Tipo.VENTA)
            .mapToDouble(Movimiento::getMonto).sum();
        double totalGastos = movimientos.stream()
            .filter(m -> m.getTipo() == Movimiento.Tipo.GASTO ||
                         m.getTipo() == Movimiento.Tipo.COMPRA)
            .mapToDouble(Movimiento::getMonto).sum();

        // Stock por producto
        List<Producto> prodStock = productos.stream()
            .sorted((a,b) -> b.getStock() - a.getStock())
            .limit(8).collect(Collectors.toList());

        // ── generar HTML ──
        try (PrintWriter pw = new PrintWriter(new FileWriter(archivo))) {
            pw.println("<!DOCTYPE html>");
            pw.println("<html lang='es'><head>");
            pw.println("<meta charset='UTF-8'/>");
            pw.println("<title>Reporte SGAPE – " + emp.getNombre() + "</title>");
            pw.println("<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>");
            pw.println("<style>");
            pw.println("*{margin:0;padding:0;box-sizing:border-box;}");
            pw.println("body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1a1a18;}");
            pw.println(".header{background:linear-gradient(135deg,#085041,#1D9E75);color:#fff;padding:32px 40px;}");
            pw.println(".header h1{font-size:28px;margin-bottom:6px;}");
            pw.println(".header p{opacity:.8;font-size:14px;}");
            pw.println(".container{max-width:1200px;margin:0 auto;padding:32px 24px;}");
            pw.println(".grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;}");
            pw.println(".grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:24px;}");
            pw.println(".card{background:#fff;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.08);}");
            pw.println(".card h3{font-size:16px;color:#085041;margin-bottom:20px;font-weight:700;}");
            pw.println(".stat-card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.08);text-align:center;}");
            pw.println(".stat-num{font-size:32px;font-weight:800;color:#1D9E75;margin-bottom:4px;}");
            pw.println(".stat-lbl{font-size:13px;color:#888;}");
            pw.println(".stat-card.red .stat-num{color:#E24B4A;}");
            pw.println(".stat-card.gold .stat-num{color:#BA7517;}");
            pw.println(".alerta{background:#FAEEDA;border-left:4px solid #BA7517;border-radius:8px;padding:12px 16px;margin-bottom:12px;font-size:13px;color:#7a4e00;}");
            pw.println(".footer{text-align:center;padding:32px;color:#aaa;font-size:12px;}");
            pw.println("canvas{max-height:280px;}");
            pw.println("@media(max-width:700px){.grid,.grid-3{grid-template-columns:1fr;}}");
            pw.println("</style></head><body>");

            // Header
            pw.println("<div class='header'>");
            pw.println("<h1>📊 Reporte Estadístico – " + emp.getNombre() + "</h1>");
            pw.println("<p>Generado el " + LocalDate.now() +
                       " · Sector: " + emp.getSector() + " · Estado: " + emp.getEstado() + "</p>");
            pw.println("</div><div class='container'>");

            // Tarjetas resumen
            double totalVentas = ventas.stream().mapToDouble(Venta::getTotal).sum();
            pw.println("<div class='grid-3'>");
            pw.println(statCard("💰 Total ventas", "$" + String.format("%,.0f", totalVentas), "", false));
            pw.println(statCard("📉 Total gastos", "$" + String.format("%,.0f", totalGastos), "red", false));
            pw.println(statCard("⚖️ Balance", "$" + String.format("%,.0f", totalIngresos - totalGastos), "gold", false));
            pw.println("</div>");

            // Alertas de stock bajo
            List<Producto> stockBajo = productos.stream()
                .filter(Producto::tieneStockBajo).collect(Collectors.toList());
            if (!stockBajo.isEmpty()) {
                pw.println("<div class='card' style='margin-bottom:24px'>");
                pw.println("<h3>⚠️ Alertas de stock bajo</h3>");
                for (Producto p : stockBajo) {
                    pw.println("<div class='alerta'>⚠️ <strong>" + p.getNombre() +
                               "</strong> — Stock actual: <strong>" + p.getStock() +
                               "</strong> (mínimo: " + p.getStockMinimo() + ")</div>");
                }
                pw.println("</div>");
            }

            // Gráfica 1: Productos más vendidos + Stock
            pw.println("<div class='grid'>");
            pw.println("<div class='card'><h3>🏆 Productos más vendidos</h3>");
            pw.println("<canvas id='chartVendidos'></canvas></div>");
            pw.println("<div class='card'><h3>📦 Inventario actual</h3>");
            pw.println("<canvas id='chartStock'></canvas></div>");
            pw.println("</div>");

            // Gráfica 2: Ventas por mes + Ingresos vs Gastos
            pw.println("<div class='grid'>");
            pw.println("<div class='card'><h3>📅 Ventas por mes</h3>");
            pw.println("<canvas id='chartMes'></canvas></div>");
            pw.println("<div class='card'><h3>💹 Ingresos vs Gastos</h3>");
            pw.println("<canvas id='chartDonut'></canvas></div>");
            pw.println("</div>");

            // Scripts Chart.js
            pw.println("<script>");

            // Colores
            pw.println("const colores=['#1D9E75','#085041','#5DCAA5','#BA7517','#FAEEDA','#E24B4A','#3730A3','#F59E0B'];");

            // Chart 1: Más vendidos
            String labVend = topVendidos.stream()
                .map(e -> "'" + e.getKey().replace("'","") + "'")
                .collect(Collectors.joining(","));
            String datVend = topVendidos.stream()
                .map(e -> String.valueOf(e.getValue()))
                .collect(Collectors.joining(","));
            pw.println("new Chart(document.getElementById('chartVendidos'),{");
            pw.println("  type:'bar',data:{labels:[" + labVend + "],");
            pw.println("  datasets:[{label:'Unidades vendidas',data:[" + datVend + "],");
            pw.println("  backgroundColor:colores,borderRadius:6}]},");
            pw.println("  options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});");

            // Chart 2: Stock
            String labStock = prodStock.stream()
                .map(p -> "'" + p.getNombre().replace("'","") + "'")
                .collect(Collectors.joining(","));
            String datStock = prodStock.stream()
                .map(p -> String.valueOf(p.getStock()))
                .collect(Collectors.joining(","));
            String colStock = prodStock.stream()
                .map(p -> p.tieneStockBajo() ? "'#E24B4A'" : "'#1D9E75'")
                .collect(Collectors.joining(","));
            pw.println("new Chart(document.getElementById('chartStock'),{");
            pw.println("  type:'bar',data:{labels:[" + labStock + "],");
            pw.println("  datasets:[{label:'Stock',data:[" + datStock + "],");
            pw.println("  backgroundColor:[" + colStock + "],borderRadius:6}]},");
            pw.println("  options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});");

            // Chart 3: Ventas por mes
            String labMes = ventasMes.keySet().stream()
                .map(k -> "'" + k + "'").collect(Collectors.joining(","));
            String datMes = ventasMes.values().stream()
                .map(v -> String.format("%.0f", v)).collect(Collectors.joining(","));
            pw.println("new Chart(document.getElementById('chartMes'),{");
            pw.println("  type:'line',data:{labels:[" + labMes + "],");
            pw.println("  datasets:[{label:'Ventas ($)',data:[" + datMes + "],");
            pw.println("  borderColor:'#1D9E75',backgroundColor:'rgba(29,158,117,0.1)',");
            pw.println("  fill:true,tension:0.4,pointRadius:5}]},");
            pw.println("  options:{scales:{y:{beginAtZero:true}}}});");

            // Chart 4: Ingresos vs Gastos
            pw.println("new Chart(document.getElementById('chartDonut'),{");
            pw.println("  type:'doughnut',data:{labels:['Ingresos','Gastos'],");
            pw.println("  datasets:[{data:[" + String.format("%.0f", totalIngresos) + "," +
                       String.format("%.0f", totalGastos) + "],");
            pw.println("  backgroundColor:['#1D9E75','#E24B4A'],borderWidth:0}]},");
            pw.println("  options:{plugins:{legend:{position:'bottom'}},cutout:'65%'}});");

            pw.println("</script>");

            // Footer
            pw.println("<div class='footer'>Generado por SGAPE · Universidad Popular del Cesar · " +
                       LocalDate.now().getYear() + " · Autor: Alejandro Henríquez Quinchia</div>");
            pw.println("</div></body></html>");

            System.out.println("✅ Reporte generado: " + archivo);
            System.out.println("   Ábrelo en tu navegador haciendo doble clic.");

        } catch (IOException e) {
            System.out.println("❌ Error generando reporte: " + e.getMessage());
        }
    }

    private static String statCard(String titulo, String valor, String clase, boolean unused) {
        return "<div class='stat-card " + clase + "'>" +
               "<div class='stat-num'>" + valor + "</div>" +
               "<div class='stat-lbl'>" + titulo + "</div></div>";
    }

    // Reporte en consola: ventas del día, semana y mes
    public static void reporteVentasConsola(List<Venta> ventas) {
        LocalDate hoy     = LocalDate.now();
        LocalDate semana  = hoy.minusDays(7);
        LocalDate mes     = hoy.withDayOfMonth(1);

        double vHoy   = ventas.stream().filter(v -> v.getFecha().equals(hoy.toString()))
                              .mapToDouble(Venta::getTotal).sum();
        double vSemana = ventas.stream().filter(v -> {
            try { return !LocalDate.parse(v.getFecha()).isBefore(semana); }
            catch (Exception e) { return false; }
        }).mapToDouble(Venta::getTotal).sum();
        double vMes   = ventas.stream().filter(v -> {
            try { return !LocalDate.parse(v.getFecha()).isBefore(mes); }
            catch (Exception e) { return false; }
        }).mapToDouble(Venta::getTotal).sum();

        System.out.println("\n" + "═".repeat(50));
        System.out.println("  RESUMEN DE VENTAS");
        System.out.println("═".repeat(50));
        System.out.printf("  Hoy (%s)   : $%,.0f%n", hoy, vHoy);
        System.out.printf("  Últimos 7 días    : $%,.0f%n", vSemana);
        System.out.printf("  Este mes          : $%,.0f%n", vMes);
        System.out.printf("  Total histórico   : $%,.0f%n",
            ventas.stream().mapToDouble(Venta::getTotal).sum());
        System.out.println("═".repeat(50));

        // Top 5 productos más vendidos
        Map<String, Integer> top = new LinkedHashMap<>();
        for (Venta v : ventas)
            for (DetalleVenta d : v.getDetalles())
                top.merge(d.getProductoNombre(), d.getCantidad(), Integer::sum);

        System.out.println("\n  🏆 TOP 5 PRODUCTOS MÁS VENDIDOS:");
        top.entrySet().stream()
            .sorted((a, b) -> b.getValue() - a.getValue())
            .limit(5)
            .forEach(e -> System.out.printf("     %-25s → %d unidades%n",
                e.getKey(), e.getValue()));
    }
}